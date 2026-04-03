import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { USE_MOCK_DATA, mockUsers } from '@/lib/mock-data';
import type { User } from '@/types';

export async function GET() {
  try {
    const payload = await getCurrentUser();
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use mock data if no database is connected
    if (USE_MOCK_DATA) {
      const user = mockUsers.find((u) => u.id === payload.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { user },
      });
    }

    // Get full user data from database
    const user = await queryOne<User>(
      'SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
