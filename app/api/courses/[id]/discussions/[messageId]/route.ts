import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { Course, DiscussionMessage } from '@/types';

// Helper to check if user is course instructor
async function isInstructorOfCourse(courseId: number, userId: number): Promise<boolean> {
  const course = await queryOne<Course>(
    'SELECT instructor_id FROM courses WHERE id = ?',
    [courseId]
  );
  return course?.instructor_id === userId;
}

// PATCH /api/courses/[id]/discussions/[messageId] - Flag/unflag message (instructor only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, messageId } = await params;
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
        { success: false, error: 'Only instructors can flag messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_flagged } = body;

    if (typeof is_flagged !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_flagged must be a boolean' },
        { status: 400 }
      );
    }

    await execute(
      'UPDATE course_discussions SET is_flagged = ? WHERE id = ? AND course_id = ?',
      [is_flagged, parseInt(messageId), courseId]
    );

    const message = await queryOne<DiscussionMessage>(
      `SELECT d.*, u.name as user_name, u.avatar_url as user_avatar, u.role as user_role
       FROM course_discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [parseInt(messageId)]
    );

    return NextResponse.json({
      success: true,
      data: { message },
      message: is_flagged ? 'Message flagged' : 'Message unflagged',
    });
  } catch (error) {
    console.error('Flag message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/discussions/[messageId] - Delete message (instructor only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, messageId } = await params;
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
        { success: false, error: 'Only instructors can delete messages' },
        { status: 403 }
      );
    }

    // Soft delete
    await execute(
      'UPDATE course_discussions SET is_deleted = TRUE WHERE id = ? AND course_id = ?',
      [parseInt(messageId), courseId]
    );

    return NextResponse.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
