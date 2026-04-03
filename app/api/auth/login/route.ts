import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie, sanitizeUser } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { USE_MOCK_DATA, mockUsers, DEMO_CREDENTIALS } from '@/lib/mock-data';
import type { UserWithPassword, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Use mock data if no database is connected
    if (USE_MOCK_DATA) {
      // Check demo credentials
      const demoUser = Object.values(DEMO_CREDENTIALS).find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!demoUser) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Create JWT token
      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set HTTP-only cookie
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        data: { user },
      });
    }

    // Database flow
    const user = await queryOne<UserWithPassword>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
