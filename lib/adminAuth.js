import { NextResponse } from 'next/server';

export function requireAdmin(req) {
  const cookie = req.cookies.get('admin_session');

  if (cookie?.value !== 'authenticated') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}