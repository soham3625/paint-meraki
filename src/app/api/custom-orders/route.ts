import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CustomOrderRequest } from '@/types';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const customOrder: CustomOrderRequest = {
      id: `co-${Date.now()}`,
      customerName: data.name,
      whatsappNumber: data.whatsapp,
      email: data.email || '',
      productType: data.productType,
      preferredSize: data.preferredSize,
      preferredColors: data.preferredColors,
      budget: data.budget,
      description: data.description,
      specialInstructions: data.specialInstructions,
      referenceImageUrl: data.referenceImageUrl,
      personalPhotoUrl: data.personalPhotoUrl,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof globalThis !== 'undefined') {
      const g = globalThis as any;
      if (!g._customOrders) g._customOrders = [];
      g._customOrders.unshift(customOrder);
    }

    try {
      if (process.env.DATABASE_URL) {
        await prisma.customOrder.create({
          data: {
            customerName: customOrder.customerName,
            whatsappNumber: customOrder.whatsappNumber,
            email: customOrder.email,
            productType: customOrder.productType,
            preferredSize: customOrder.preferredSize,
            preferredColors: customOrder.preferredColors,
            budget: customOrder.budget,
            description: customOrder.description,
            specialInstructions: customOrder.specialInstructions,
            referenceImageUrl: customOrder.referenceImageUrl,
            personalPhotoUrl: customOrder.personalPhotoUrl,
            status: 'NEW',
          },
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true, customOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit custom order' }, { status: 500 });
  }
}
