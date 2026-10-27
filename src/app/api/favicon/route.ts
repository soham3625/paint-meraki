import { NextResponse } from 'next/server';
import { getBusinessSettings } from '@/lib/services/db-service';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getBusinessSettings();
    const iconUrl = settings?.favicon || settings?.logo || '/logo.jpg';

    // 1. Data URI handler
    if (iconUrl.startsWith('data:')) {
      const match = iconUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=60, s-maxage=60',
          },
        });
      }
    }

    // 2. Relative file in public/ directory
    if (iconUrl.startsWith('/')) {
      const cleanPath = iconUrl.split('?')[0].replace(/^\//, '');
      const localFilePath = path.join(process.cwd(), 'public', cleanPath);

      if (fs.existsSync(localFilePath)) {
        const buffer = fs.readFileSync(localFilePath);
        const ext = path.extname(localFilePath).toLowerCase();
        let mime = 'image/jpeg';
        if (ext === '.png') mime = 'image/png';
        else if (ext === '.ico') mime = 'image/x-icon';
        else if (ext === '.svg') mime = 'image/svg+xml';
        else if (ext === '.webp') mime = 'image/webp';

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=60, s-maxage=60',
          },
        });
      }
    }

    // 3. Fallback redirect
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paintnmeraki.vercel.app';
    const targetUrl = iconUrl.startsWith('http') ? iconUrl : `${baseUrl.replace(/\/$/, '')}${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}`;
    return NextResponse.redirect(new URL(targetUrl));
  } catch (err) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paintnmeraki.vercel.app';
    return NextResponse.redirect(new URL(`${baseUrl}/logo.jpg`));
  }
}
