'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AuthInitializer() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initAuthListener]);

  return null;
}
