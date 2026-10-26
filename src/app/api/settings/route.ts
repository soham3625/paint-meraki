import { NextResponse } from 'next/server';
import { getBusinessSettings } from '@/lib/services/db-service';

export async function GET() {
  try {
    const settings = await getBusinessSettings();

    // Return only customer-facing public store configuration
    const publicSettings = {
      businessName: settings.businessName || 'paint_n_meraki',
      logo: settings.logo || '/logo.png',
      whatsappNumber: settings.whatsappNumber,
      instagramUrl: settings.instagramUrl,
      email: settings.email,
      upiId: settings.upiId,
      upiQrCode: settings.upiQrCode,
      codEnabled: settings.codEnabled,
      codMinOrder: settings.codMinOrder,
      codMaxOrder: settings.codMaxOrder,
      codFee: settings.codFee || 0,
      shippingCharge: settings.shippingCharge ?? 99,
      freeShippingThreshold: settings.freeShippingThreshold ?? 2000,
      processingTime: settings.processingTime,
      deliveryTime: settings.deliveryTime,
      announcementText: settings.announcementText,
      announcementEnabled: settings.announcementEnabled,
      businessAddress: settings.businessAddress,
    };

    return NextResponse.json(publicSettings);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch public store settings' }, { status: 500 });
  }
}
