import { NextResponse } from 'next/server';
import { getBusinessSettings } from '@/lib/services/db-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getBusinessSettings();

    // Return only customer-facing public store configuration
    const publicSettings = {
      businessName: settings.businessName || 'paint_n_meraki',
      logo: settings.logo || '/logo.jpg',
      favicon: settings.favicon || settings.logo || '/logo.jpg',
      whatsappNumber: settings.whatsappNumber,
      instagramUrl: settings.instagramUrl,
      email: settings.email,
      upiId: settings.upiId,
      upiQrCode: settings.upiQrCode,
      codEnabled: settings.codEnabled,
      codMinOrder: settings.codMinOrder,
      codMaxOrder: settings.codMaxOrder,
      codFee: settings.codFee || 0,
      shippingCharge: typeof settings.shippingCharge === 'number' ? settings.shippingCharge : 99,
      freeShippingThreshold: typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 2000,
      processingTime: settings.processingTime,
      deliveryTime: settings.deliveryTime,
      announcementText: settings.announcementText,
      announcementEnabled: settings.announcementEnabled,
      businessAddress: settings.businessAddress,
    };

    return NextResponse.json(publicSettings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch public store settings' }, { status: 500 });
  }
}
