import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { enrollmentSchema } from '@/lib/validations';
import { USE_MOCK_DATA, mockEnrollments, mockCourses, mockUsers } from '@/lib/mock-data';
import type { Enrollment } from '@/types';

// GET /api/enrollments - List user's enrollments (or all for admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use mock data if no database is connected
    if (USE_MOCK_DATA) {
      let enrollments = mockEnrollments.map((enrollment) => {
        const course = mockCourses.find((c) => c.id === enrollment.course_id);
        const enrolledUser = mockUsers.find((u) => u.id === enrollment.user_id);
        return {
          ...enrollment,
          course_title: course?.title || 'Unknown',
          course_unit: course?.category || '',
          user_name: enrolledUser?.name || 'Unknown',
          user_email: enrolledUser?.email || '',
          user_avatar: enrolledUser?.avatar_url || null,
        };
      });
      
      // Non-admins only see their own enrollments
      if (user.role !== 'admin') {
        enrollments = enrollments.filter((e) => e.user_id === user.userId);
      }
      
      return NextResponse.json({
        success: true,
        data: { enrollments },
      });
    }
    
    let sql = `
      SELECT 
        e.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar,
        c.title as course_title,
        c.unit as course_unit
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
    `;
    
    const params: number[] = [];
    
    // Non-admins only see their own enrollments
    if (user.role !== 'admin') {
      sql += ' WHERE e.user_id = ?';
      params.push(user.userId);
    }
    
    sql += ' ORDER BY e.enrolled_at DESC';
    
    const enrollments = await query<Enrollment>(sql, params);
    
    return NextResponse.json({
      success: true,
      data: { enrollments },
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const result = enrollmentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { course_id, status, payment_status } = result.data;

    // Mock mode - just return success
    if (USE_MOCK_DATA) {
      const existing = mockEnrollments.find(
        (e) => e.user_id === user.userId && e.course_id === course_id
      );
      
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Already enrolled in this course' },
          { status: 409 }
        );
      }
      
      const course = mockCourses.find((c) => c.id === course_id);
      const newEnrollment = {
        id: mockEnrollments.length + 1,
        user_id: user.userId,
        course_id,
        status: status || 'pending',
        progress: 0,
        enrolled_at: new Date(),
        completed_at: null,
        course_title: course?.title || 'Unknown',
        course_unit: course?.category || '',
      };
      
      return NextResponse.json({
        success: true,
        data: { enrollment: newEnrollment },
        message: 'Enrolled successfully (demo mode)',
      });
    }
    
    // Check if already enrolled
    const existing = await queryOne<Enrollment>(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user.userId, course_id]
    );
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }
    
    // Create enrollment
    const insertResult = await execute(
      'INSERT INTO enrollments (user_id, course_id, status, payment_status) VALUES (?, ?, ?, ?)',
      [user.userId, course_id, status || 'pending', payment_status || 'pending']
    );
    
    const enrollment = await queryOne<Enrollment>(
      `SELECT 
        e.*,
        c.title as course_title,
        c.unit as course_unit
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ?`,
      [insertResult.insertId]
    );
    
    return NextResponse.json({
      success: true,
      data: { enrollment },
      message: 'Enrolled successfully',
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
