import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs'; // ensure Node runtime (Buffer + cloudinary)

export async function POST(req) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  let formData;
  try {
    formData = await req.formData();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const files = formData.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'nalgonda_estates';

  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (!file || typeof file === 'string') return null;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'image',
              // Cloudinary handles resize + compression server-side
              transformation: [
                { width: 1600, height: 1600, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            },
            (err, result) => {
              if (err) return reject(err);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
              });
            }
          );
          stream.end(buffer);
        });
      })
    );

    return NextResponse.json({ images: uploaded.filter(Boolean) });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}