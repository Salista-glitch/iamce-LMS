import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { courseMaterialSchema } from '@/lib/validations';
import type { Course, CourseMaterial } from '@/types';

// Helper to check if user is course instructor
async function isInstructorOfCourse(courseId: number, userId: number): Promise<boolean> {
  const course = await queryOne<Course>(
    'SELECT instructor_id FROM courses WHERE id = ?',
    [courseId]
  );
  return course?.instructor_id === userId;
}

// Helper to check if user is enrolled in course
async function isEnrolledInCourse(courseId: number, userId: number): Promise<boolean> {
  const enrollment = await queryOne<{ id: number }>(
    'SELECT id FROM enrollments WHERE course_id = ? AND user_id = ? AND status = ?',
    [courseId, userId, 'active']
  );
  return !!enrollment;
}

// GET /api/courses/[id]/materials - List course materials
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const courseId = parseInt(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check authorization - must be enrolled, instructor, or admin
    const isInstructor = await isInstructorOfCourse(courseId, user.userId);
    const isEnrolled = await isEnrolledInCourse(courseId, user.userId);
    const isAdmin = user.role === 'admin';

    if (!isInstructor && !isEnrolled && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this course' },
        { status: 403 }
      );
    }

    // Instructors and admins see all materials, students only see active ones
    const showInactive = isInstructor || isAdmin;
    
    const materials = await query<CourseMaterial>(
      `SELECT 
        cm.*,
        u.name as uploader_name,
        u.avatar_url as uploader_avatar
      FROM course_materials cm
      LEFT JOIN users u ON cm.uploaded_by = u.id
      WHERE cm.course_id = ? ${showInactive ? '' : 'AND cm.is_active = TRUE'}
      ORDER BY cm.sort_order ASC, cm.created_at DESC`,
      [courseId]
    );

    return NextResponse.json({
      success: true,
      data: { materials },
    });
  } catch (error) {
    console.error('Get materials error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/materials - Upload new material (instructor only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const courseId = parseInt(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is the instructor of this course or admin
    const isInstructor = await isInstructorOfCourse(courseId, user.userId);
    const isAdmin = user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the course instructor can upload materials' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = courseMaterialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, type, url, content, sort_order } = result.data;

    // Get current max sort_order for this course
    const maxOrder = await queryOne<{ max_order: number }>(
      'SELECT MAX(sort_order) as max_order FROM course_materials WHERE course_id = ?',
      [courseId]
    );
    const newSortOrder = sort_order ?? (maxOrder?.max_order ?? 0) + 1;

    const insertResult = await execute(
      `INSERT INTO course_materials (course_id, title, type, url, content, sort_order, uploaded_by, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [courseId, title, type, url || null, content || null, newSortOrder, user.userId]
    );

    // Update course file_count
    await execute(
      'UPDATE courses SET file_count = (SELECT COUNT(*) FROM course_materials WHERE course_id = ? AND is_active = TRUE) WHERE id = ?',
      [courseId, courseId]
    );

    const material = await queryOne<CourseMaterial>(
      `SELECT cm.*, u.name as uploader_name 
       FROM course_materials cm 
       LEFT JOIN users u ON cm.uploaded_by = u.id 
       WHERE cm.id = ?`,
      [insertResult.insertId]
    );

    return NextResponse.json({
      success: true,
      data: { material },
      message: 'Material uploaded successfully',
    });
  } catch (error) {
    console.error('Upload material error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
