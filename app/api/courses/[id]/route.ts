import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser, canManageCourses } from '@/lib/auth';
import { courseSchema } from '@/lib/validations';
import type { Course } from '@/types';

// GET /api/courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const course = await queryOne<Course>(
      `SELECT 
        c.*,
        u.name as instructor_name,
        u.avatar_url as instructor_avatar,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?`,
      [parseInt(id)]
    );
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course (admin/instructor only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    
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
    
    await execute(
      'UPDATE courses SET title = ?, description = ?, unit = ?, status = ? WHERE id = ?',
      [title, description || null, unit || null, status, parseInt(id)]
    );
    
    const course = await queryOne<Course>(
      'SELECT * FROM courses WHERE id = ?',
      [parseInt(id)]
    );
    
    return NextResponse.json({
      success: true,
      data: { course },
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    
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
    
    await execute('DELETE FROM courses WHERE id = ?', [parseInt(id)]);
    
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
