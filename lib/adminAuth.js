import { NextResponse } from 'next/server';

const SECRET = process.env.ADMIN_API_SECRET;

export function requireAdmin(req) {
  if (!SECRET) return null; // no secret configured -> open (NOT recommended)
  const header = req.headers.get('x-admin-secret');
  if (header !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}