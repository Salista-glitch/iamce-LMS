import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { CourseMaterial } from '@/types';

interface RecentMaterial extends CourseMaterial {
  course_title?: string;
  course_unit?: string;
}

// GET /api/materials/recent - Get recently uploaded materials for user's courses
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') || '10');
    const limit = !rawLimit || rawLimit < 1 ? 10 : rawLimit;
    // Get recent materials from courses the user is enrolled in, teaches, or all for admin
    let sql = `
      SELECT 
        cm.*,
        c.title as course_title,
        c.unit as course_unit,
        u.name as uploader_name
      FROM course_materials cm
      JOIN courses c ON cm.course_id = c.id
      LEFT JOIN users u ON cm.uploaded_by = u.id
      WHERE cm.is_active = TRUE
    `;

    const params: (number | string)[] = [];

    if (user.role === 'admin') {
      // Admin sees all recent materials
    } else if (user.role === 'instructor') {
      // Instructor sees materials from courses they teach OR are enrolled in
      sql += ` AND (
        c.instructor_id = ?
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.user_id = ? 
          AND e.status = 'active'
        )
      )`;
      params.push(user.userId, user.userId);
    } else {
      // Student sees materials from enrolled courses only
      sql += ` AND EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.course_id = c.id 
        AND e.user_id = ? 
        
      )`;
      params.push(user.userId);
    }

    sql += ` ORDER BY cm.created_at DESC LIMIT ${limit}`;

    const materials = await query<RecentMaterial>(sql, params);

    return NextResponse.json({
      success: true,
      data: { materials },
    });
  } catch (error) {
    console.error('Get recent materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
