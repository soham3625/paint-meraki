// ============================================
// paint_n_meraki — AUTH STORE
// User authentication with Firebase Client + Server Session + Zustand
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];

  initAuthListener: () => () => void;
  setUser: (user: User | null) => void;
  syncWithBackendSession: (idToken: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword?: string,
    mobile?: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithOtp: (mobile: string) => { success: boolean; error?: string };
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string; mobile?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; devResetToken?: string; devResetUrl?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      users: [],

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      initAuthListener: () => {
        if (typeof window === 'undefined') return () => {};

        try {
          const auth = getFirebaseAuth();
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const idToken = await firebaseUser.getIdToken();
                const res = await fetch('/api/auth/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken }),
                });
                const data = await res.json();
                if (data.success && data.user) {
                  set({ user: data.user, isAuthenticated: true, isLoading: false });
                  return;
                }
              } catch (err) {
                console.error('Error syncing Firebase user session:', err);
              }
            }

            // Check if active JWT cookie session exists
            try {
              const meRes = await fetch('/api/auth/me');
              const meData = await meRes.json();
              if (meData.success && meData.user) {
                set({ user: meData.user, isAuthenticated: true, isLoading: false });
                return;
              }
            } catch (err) {}

            // Otherwise check state in store or set guest
            const currentUser = get().user;
            set({
              user: currentUser,
              isAuthenticated: !!currentUser,
              isLoading: false,
            });
          });

          return unsubscribe;
        } catch (err) {
          set({ isLoading: false });
          return () => {};
        }
      },

      syncWithBackendSession: async (idToken: string) => {
        try {
          const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, user: data.user };
          }
          return { success: false, error: data.error || 'Session creation failed' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error' };
        }
      },

      signup: async (fullName, email, password, confirmPassword, mobile) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName,
              email,
              password,
              confirmPassword: confirmPassword || password,
              mobile: mobile || undefined,
            }),
          });

          const data = await res.json();
          if (res.ok && data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, user: data.user };
          }

          return { success: false, error: data.error || 'Signup failed' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error during registration' };
        }
      },

      login: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (res.ok && data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, user: data.user };
          }

          return { success: false, error: data.error || 'Invalid credentials' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error during login' };
        }
      },

      loginWithOtp: (mobile) => {
        const { users } = get();
        const user = users.find((u) => u.mobile === mobile);

        if (!user) {
          const newCustomer: User = {
            id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            fullName: 'Valued Customer',
            mobile,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          set({ users: [...users, newCustomer], user: newCustomer, isAuthenticated: true, isLoading: false });
          return { success: true };
        }

        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: async () => {
        try {
          const auth = getFirebaseAuth();
          await signOut(auth);
        } catch (err) {}

        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {}

        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;

        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const resData = await res.json();
          if (resData.success && resData.user) {
            set({ user: resData.user });
            return;
          }
        } catch (err) {}

        const updatedUser = { ...user, ...data };
        set({ user: updatedUser });
      },

      changePassword: async (currentPassword, newPassword) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };

        try {
          // Verify current password via login endpoint or reset
          const verifyRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: currentPassword }),
          });

          if (!verifyRes.ok) {
            return { success: false, error: 'Current password is incorrect' };
          }

          // Request password reset for logged in user
          const forgotRes = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
          });
          const forgotData = await forgotRes.json();

          if (forgotData.devResetToken) {
            const resetRes = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: forgotData.devResetToken,
                newPassword,
                confirmPassword: newPassword,
              }),
            });
            const resetData = await resetRes.json();
            return { success: resetRes.ok && resetData.success, error: resetData.error };
          }

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Password update failed' };
        }
      },

      forgotPassword: async (email) => {
        try {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            return {
              success: true,
              message: data.message,
              devResetToken: data.devResetToken,
              devResetUrl: data.devResetUrl,
            };
          }
          return { success: false, error: data.error || 'Failed to process request' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error' };
        }
      },

      resetPassword: async (token, newPassword, confirmPassword) => {
        try {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              newPassword,
              confirmPassword: confirmPassword || newPassword,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            return { success: true, message: data.message };
          }
          return { success: false, error: data.error || 'Failed to reset password' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error' };
        }
      },
    }),
    {
      name: 'paint-meraki-auth',
    }
  )
);

