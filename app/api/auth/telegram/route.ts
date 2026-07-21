import { NextRequest, NextResponse } from 'next/server';

// Telegram login is NOT fully implemented yet in this Supabase-native version.
// This is a stub to prevent 404 errors.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[TELEGRAM AUTH] Received fake/demo data:', body);

    // For now, we reject and tell user to use Email/Password
    return NextResponse.json({
      success: false,
      error: 'Telegram login is not fully wired yet.',
      message: 'Please use the Email & Password tab to sign in or sign up. Telegram auth will be added soon.',
      fallback: true
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Telegram endpoint error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram auth endpoint is a stub. Use Email login for now.'
  });
}
