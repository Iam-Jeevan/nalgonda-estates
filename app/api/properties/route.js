import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

// GET /api/properties  ->  list all (newest first)
export async function GET() {
  try {
    await connectMongo();
    const docs = await Property.find({}).sort({ createdAt: -1 }).limit(500);
    return NextResponse.json({ properties: docs.map((d) => d.toClient()) });
  } catch (err) {
    console.error('List properties error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/properties  ->  create
export async function POST(req) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    await connectMongo();

    const id = 'p-' + Date.now();
    const doc = await Property.create({
      ...sanitizeIncoming(body),
      id,
      createdAt: Date.now(),
    });
    return NextResponse.json({ property: doc.toClient() }, { status: 201 });
  } catch (err) {
    console.error('Create property error:', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// Accept either ["url1","url2"] (legacy strings) or [{url, publicId}].
function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      if (!img) return null;
      if (typeof img === 'string') return { url: img, publicId: '' };
      if (img.url) return { url: img.url, publicId: img.publicId || '' };
      return null;
    })
    .filter(Boolean);
}

export function sanitizeIncoming(body) {
  const out = { ...body };
  delete out._id;
  delete out.id;
  delete out.createdAt;
  out.images = normalizeImages(body.images);
  return out;
}