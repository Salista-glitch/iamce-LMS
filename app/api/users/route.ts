import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { USE_MOCK_DATA, mockUsers } from '@/lib/mock-data';
import type { User } from '@/types';

// GET /api/users - List all users (admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Use mock data if no database is connected
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        success: true,
        data: { users: mockUsers },
      });
    }
    
    const users = await query<User>(
      'SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    return NextResponse.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
