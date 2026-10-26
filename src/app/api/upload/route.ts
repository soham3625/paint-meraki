import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

// Allowed MIME types mapped to safe extensions
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Validate magic bytes (first few bytes of file buffer)
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  switch (mimeType) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    case 'image/gif':
      return (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38 &&
        (buffer[4] === 0x37 || buffer[4] === 0x39) &&
        buffer[5] === 0x61
      );
    case 'image/webp':
      // RIFF .... WEBP
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const rateLimit = checkRateLimit(`upload_${ip}`, 15, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Upload rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 1. Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 2. Validate declared MIME type (Strict whitelist, NO SVG to prevent XSS)
    const declaredType = (file.type || '').toLowerCase();
    const safeExt = ALLOWED_MIME_EXTENSIONS[declaredType];
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Validate magic bytes to verify content matches declared image format
    if (!validateMagicBytes(buffer, declaredType)) {
      return NextResponse.json(
        { success: false, error: 'Corrupted image file or extension mismatch.' },
        { status: 400 }
      );
    }

    // 4. Generate cryptographically random filename (Zero client trust)
    const randomHex = crypto.randomBytes(12).toString('hex');
    const filename = `pm_${Date.now()}_${randomHex}${safeExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const response = NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });

    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 });
  }
}
