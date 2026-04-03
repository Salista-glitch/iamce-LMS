import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { discussionMessageSchema } from '@/lib/validations';
import { USE_MOCK_DATA, mockCourses, mockEnrollments, mockDiscussionMessages, mockUsers } from '@/lib/mock-data';
import type { Course, DiscussionMessage } from '@/types';

// Helper to check if user is course instructor
async function isInstructorOfCourse(courseId: number, userId: number): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.instructor_id === userId;
  }
  const course = await queryOne<Course>(
    'SELECT instructor_id FROM courses WHERE id = ?',
    [courseId]
  );
  return course?.instructor_id === userId;
}

// Helper to check if user is enrolled in course
async function isEnrolledInCourse(courseId: number, userId: number): Promise<boolean> {
  if (USE_MOCK_DATA) {
    return mockEnrollments.some(
      (e) => e.course_id === courseId && e.user_id === userId && e.status === 'active'
    );
  }
  const enrollment = await queryOne<{ id: number }>(
    'SELECT id FROM enrollments WHERE course_id = ? AND user_id = ? AND status = ?',
    [courseId, userId, 'active']
  );
  return !!enrollment;
}

// GET /api/courses/[id]/discussions - List discussion messages
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

    // Get messages - don't show deleted messages unless admin/instructor
    const showDeleted = isInstructor || isAdmin;

    if (USE_MOCK_DATA) {
      let messages = mockDiscussionMessages.filter((m) => m.course_id === courseId);
      if (!showDeleted) {
        messages = messages.filter((m) => !m.is_deleted);
      }
      messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return NextResponse.json({
        success: true,
        data: { 
          messages,
          isInstructor: isInstructor || isAdmin
        },
      });
    }
    
    const messages = await query<DiscussionMessage>(
      `SELECT 
        d.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        u.role as user_role
      FROM course_discussions d
      JOIN users u ON d.user_id = u.id
      WHERE d.course_id = ? ${showDeleted ? '' : 'AND d.is_deleted = FALSE'}
      ORDER BY d.created_at ASC`,
      [courseId]
    );

    return NextResponse.json({
      success: true,
      data: { 
        messages,
        isInstructor: isInstructor || isAdmin
      },
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/discussions - Send a message
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

    // Check authorization
    const isInstructor = await isInstructorOfCourse(courseId, user.userId);
    const isEnrolled = await isEnrolledInCourse(courseId, user.userId);
    const isAdmin = user.role === 'admin';

    if (!isInstructor && !isEnrolled && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You must be enrolled or an instructor to post messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = discussionMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { message } = result.data;

    if (USE_MOCK_DATA) {
      const userInfo = mockUsers.find((u) => u.id === user.userId);
      const newMessage: DiscussionMessage = {
        id: mockDiscussionMessages.length + 1,
        course_id: courseId,
        user_id: user.userId,
        message,
        is_flagged: false,
        is_deleted: false,
        created_at: new Date(),
        user_name: userInfo?.name,
        user_avatar: userInfo?.avatar_url,
        user_role: userInfo?.role,
      };
      mockDiscussionMessages.push(newMessage);
      return NextResponse.json({
        success: true,
        data: { message: newMessage },
      });
    }

    const insertResult = await execute(
      `INSERT INTO course_discussions (course_id, user_id, message) VALUES (?, ?, ?)`,
      [courseId, user.userId, message]
    );

    const newMessage = await queryOne<DiscussionMessage>(
      `SELECT 
        d.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        u.role as user_role
      FROM course_discussions d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?`,
      [insertResult.insertId]
    );

    return NextResponse.json({
      success: true,
      data: { message: newMessage },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
