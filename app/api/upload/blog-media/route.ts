import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';
import { validateFileSignature } from '@/lib/utils/file-security';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Security Check: Size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Security Check: Magic Number Validation
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      console.warn('⚠️ Cloudinary not configured. Falling back to Base64 (MySQL) storage for blog media');
      return NextResponse.json({ 
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        public_id: `db_${Date.now()}`
      });
    }

    // Upload to Cloudinary
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: 'blog-media',
      resource_type: 'auto',
    });

    return NextResponse.json({ 
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id 
    });
  } catch (error: any) {
    console.error('❌ Blog Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
