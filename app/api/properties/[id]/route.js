import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/adminAuth';
import { sanitizeIncoming } from '../route';

export const runtime = 'nodejs';

// GET single
export async function GET(_req, { params }) {
  try {
    await connectMongo();
    const doc = await Property.findOne({ id: params.id });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ property: doc.toClient() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT update
export async function PUT(req, { params }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    await connectMongo();
    const doc = await Property.findOneAndUpdate(
      { id: params.id },
      { $set: sanitizeIncoming(body) },
      { new: true, runValidators: true }
    );
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ property: doc.toClient() });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// PATCH (used for partial actions, e.g. toggleSold)
export async function PATCH(req, { params }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    await connectMongo();

    if (body.action === 'toggleSold') {
      const doc = await Property.findOne({ id: params.id });
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      doc.sold = !doc.sold;
      await doc.save();
      return NextResponse.json({ property: doc.toClient() });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to patch' }, { status: 500 });
  }
}

// DELETE — also removes images from Cloudinary
export async function DELETE(req, { params }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await connectMongo();
    const doc = await Property.findOneAndDelete({ id: params.id });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const publicIds = (doc.images || [])
      .map((img) => img.publicId)
      .filter(Boolean);
    if (publicIds.length) {
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (e) {
        console.warn('Cloudinary cleanup failed (non-fatal):', e?.message);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}