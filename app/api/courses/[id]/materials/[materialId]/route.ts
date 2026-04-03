import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { Course, CourseMaterial } from '@/types';

// Helper to check if user is course instructor
async function isInstructorOfCourse(courseId: number, userId: number): Promise<boolean> {
  const course = await queryOne<Course>(
    'SELECT instructor_id FROM courses WHERE id = ?',
    [courseId]
  );
  return course?.instructor_id === userId;
}

// GET /api/courses/[id]/materials/[materialId] - Get single material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const { id, materialId } = await params;
    
    const material = await queryOne<CourseMaterial>(
      `SELECT cm.*, u.name as uploader_name, u.avatar_url as uploader_avatar
       FROM course_materials cm
       LEFT JOIN users u ON cm.uploaded_by = u.id
       WHERE cm.id = ? AND cm.course_id = ?`,
      [parseInt(materialId), parseInt(id)]
    );

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { material },
    });
  } catch (error) {
    console.error('Get material error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id]/materials/[materialId] - Toggle visibility or update material
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, materialId } = await params;
    const courseId = parseInt(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isInstructor = await isInstructorOfCourse(courseId, user.userId);
    const isAdmin = user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the course instructor can modify materials' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_active, title, url } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (typeof is_active === 'boolean') {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(parseInt(materialId), courseId);

    await execute(
      `UPDATE course_materials SET ${updates.join(', ')} WHERE id = ? AND course_id = ?`,
      values
    );

    // Update course file_count
    await execute(
      'UPDATE courses SET file_count = (SELECT COUNT(*) FROM course_materials WHERE course_id = ? AND is_active = TRUE) WHERE id = ?',
      [courseId, courseId]
    );

    const material = await queryOne<CourseMaterial>(
      'SELECT * FROM course_materials WHERE id = ?',
      [parseInt(materialId)]
    );

    return NextResponse.json({
      success: true,
      data: { material },
      message: is_active === false ? 'Material removed' : 'Material updated',
    });
  } catch (error) {
    console.error('Update material error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/materials/[materialId] - Permanently delete material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, materialId } = await params;
    const courseId = parseInt(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const isInstructor = await isInstructorOfCourse(courseId, user.userId);
    const isAdmin = user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the course instructor can delete materials' },
        { status: 403 }
      );
    }

    await execute(
      'DELETE FROM course_materials WHERE id = ? AND course_id = ?',
      [parseInt(materialId), courseId]
    );

    // Update course file_count
    await execute(
      'UPDATE courses SET file_count = (SELECT COUNT(*) FROM course_materials WHERE course_id = ? AND is_active = TRUE) WHERE id = ?',
      [courseId, courseId]
    );

    return NextResponse.json({
      success: true,
      message: 'Material deleted permanently',
    });
  } catch (error) {
    console.error('Delete material error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
