import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser, canManageCourses } from '@/lib/auth';
import { courseSchema } from '@/lib/validations';
import { USE_MOCK_DATA, mockCourses, mockEnrollments } from '@/lib/mock-data';
import type { Course } from '@/types';

// GET /api/courses - List all published courses (or all for admin/instructor)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    
    // Use mock data if no database is connected
    if (USE_MOCK_DATA) {
      let courses = [...mockCourses];
      
      // Add enrollment counts
      courses = courses.map((course) => ({
        ...course,
        enrolled_count: mockEnrollments.filter((e) => e.course_id === course.id).length,
      }));
      
      // Filter by status for non-admin users
      if (!user || !canManageCourses(user.role)) {
        courses = courses.filter((c) => c.status === 'published');
      } else if (status !== 'all') {
        courses = courses.filter((c) => c.status === status);
      }
      
      return NextResponse.json({
        success: true,
        data: { courses },
      });
    }

    let sql = `
      SELECT 
        c.*,
        u.name as instructor_name,
        u.avatar_url as instructor_avatar,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
    `;
    
    const params: (string | number)[] = [];
    
    // Non-authenticated users or students only see published courses
    if (!user || !canManageCourses(user.role)) {
      sql += ' WHERE c.status = ?';
      params.push('published');
    } else if (status !== 'all') {
      sql += ' WHERE c.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY c.created_at DESC';
    
    const courses = await query<Course>(sql, params);
    
    return NextResponse.json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (admin/instructor only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (!canManageCourses(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const result = courseSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { title, description, unit, status } = result.data;

    // Mock mode - just return success
    if (USE_MOCK_DATA) {
      const newCourse: Course = {
        id: mockCourses.length + 1,
        title,
        description: description || '',
        instructor_id: user.userId,
        instructor_name: 'Demo Instructor',
        category: 'General',
        level: 'All Levels',
        thumbnail_url: null,
        status: status || 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      return NextResponse.json({
        success: true,
        data: { course: newCourse },
        message: 'Course created successfully (demo mode)',
      });
    }
    
    const insertResult = await execute(
      'INSERT INTO courses (title, description, instructor_id, unit, status) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, user.userId, unit || null, status]
    );
    
    const course = await query<Course>(
      'SELECT * FROM courses WHERE id = ?',
      [insertResult.insertId]
    );
    
    return NextResponse.json({
      success: true,
      data: { course: course[0] },
      message: 'Course created successfully',
    });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
