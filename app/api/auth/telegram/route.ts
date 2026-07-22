import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyTelegramAuth, getTelegramEmail, getTelegramPassword } from '@/lib/telegram-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

// Admin client (service role) - can create users securely
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const telegramData = await req.json();

    // Basic validation
    if (!telegramData || !telegramData.id || !telegramData.hash) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 400 });
    }

    // 1. Verify the data came from Telegram
    const isValid = verifyTelegramAuth(telegramData, TELEGRAM_BOT_TOKEN);
    if (!isValid) {
      console.error('Telegram auth hash verification failed');
      return NextResponse.json({ error: 'Telegram authentication failed (invalid signature)' }, { status: 401 });
    }

    const telegramId = Number(telegramData.id);
    const email = getTelegramEmail(telegramId);
    const password = getTelegramPassword(telegramId, TELEGRAM_BOT_TOKEN);

    // 2. Build user metadata
    const displayName = 
      [telegramData.first_name, telegramData.last_name].filter(Boolean).join(' ') ||
      telegramData.username ||
      `tg_${telegramId}`;

    const avatar = telegramData.photo_url || null;

    // 3. Create or get the user in Supabase Auth
    // First try to sign in
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    let userId: string;

    if (signInError) {
      // User doesn't exist — create it
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto-confirm for Telegram users
        user_metadata: {
          username: telegramData.username || `tg_${telegramId}`,
          display_name: displayName,
          telegram_id: telegramId.toString(),
          avatar: avatar,
          provider: 'telegram',
        },
      });

      if (createError) {
        console.error('Failed to create Telegram user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = createData.user.id;

      // Sign in after creation
      const { data: newSignIn, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (newSignInError || !newSignIn.session) {
        return NextResponse.json({ error: 'Failed to sign in after creation' }, { status: 500 });
      }

      // Return session tokens so client can set them
      return NextResponse.json({
        success: true,
        session: newSignIn.session,
        user: {
          id: userId,
          email,
          telegram_id: telegramId,
          display_name: displayName,
          avatar,
        },
      });
    }

    // Already existed — return the session
    userId = signInData.user.id;

    // Update profile if needed + FORCE ADMIN for baatinarolu@gmail.com
    const isAdminEmail = email === 'baatinarolu@gmail.com';
    await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      username: telegramData.username || `tg_${telegramId}`,
      display_name: displayName,
      avatar: avatar,
      telegram_id: telegramId.toString(),
      role: isAdminEmail ? 'ADMIN' : 'BUYER',
    }, { onConflict: 'id' });

    return NextResponse.json({
      success: true,
      session: signInData.session,
      user: {
        id: userId,
        email,
        telegram_id: telegramId,
        display_name: displayName,
        avatar,
      },
    });

  } catch (error: any) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ 
      error: 'Telegram authentication failed', 
      details: error.message 
    }, { status: 500 });
  }
}
