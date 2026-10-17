import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to upload files' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Base64 upload support
      const body = await req.json();
      const { data, filename = 'evidence.jpg', bookingId } = body;

      if (!data || typeof data !== 'string') {
        return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
      }

      // Check size (base64 length > ~7MB is > 5MB raw)
      if (data.length > 7 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds maximum allowed limit (5MB)' }, { status: 400 });
      }

      const match = data.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP' }, { status: 400 });
      }

      const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
      const buffer = Buffer.from(match[3], 'base64');

      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'evidence');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanFilename = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const filePath = path.join(uploadsDir, cleanFilename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/evidence/${cleanFilename}`,
      });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WEBP images are permitted.' }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'evidence');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = file.type === 'image/jpeg' ? 'jpg' : (file.type === 'image/png' ? 'png' : 'webp');
      const cleanFilename = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const filePath = path.join(uploadsDir, cleanFilename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/evidence/${cleanFilename}`,
      });
    }

    return NextResponse.json({ error: 'Unsupported upload content type' }, { status: 400 });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process file upload' }, { status: 500 });
  }
}
