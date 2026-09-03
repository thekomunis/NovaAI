import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Cungsstore0000@';

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // Create a signed session token
    const crypto = await import('crypto');
    const secretKey = process.env.ADMIN_SECRET_KEY || adminPassword;
    const sessionToken = crypto
      .createHmac('sha256', secretKey)
      .update(adminPassword + Date.now().toString().slice(0, -5))
      .digest('hex');

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    // Also store the token server-side for validation
    cookieStore.set('admin_token_hash', crypto
      .createHmac('sha256', secretKey)
      .update(sessionToken)
      .digest('hex'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
