import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';
import { SEED_PROPERTIES } from '@/lib/properties';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

// POST /api/seed  -> wipes the collection and re-loads SEED_PROPERTIES
export async function POST(req) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  await connectMongo();
  await Property.deleteMany({});
  const docs = SEED_PROPERTIES.map((p) => ({
    ...p,
    images: (p.images || []).map((u) => ({ url: u, publicId: '' })),
  }));
  await Property.insertMany(docs);
  return NextResponse.json({ inserted: docs.length });
}