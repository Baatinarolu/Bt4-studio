import { NextRequest, NextResponse } from 'next/server';

// This endpoint is now deprecated.
// Telegram login is handled fully client-side in /auth/signin using Supabase.

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: false,
    error: "Telegram login now happens directly via Supabase. Please use the button on the sign-in page.",
  }, { status: 200 });
}
