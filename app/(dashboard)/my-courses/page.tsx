'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ArrowRight, GraduationCap, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Enrollment, Course } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors = {
  pending: 'border-warning/50 bg-warning/10 text-warning',
  active: 'border-primary/50 bg-primary/10 text-primary',
  completed: 'border-success/50 bg-success/10 text-success',
  dropped: 'border-destructive/50 bg-destructive/10 text-destructive',
};

export default function MyCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch user's enrollments (for students)
  const { data: enrollmentData, isLoading: enrollmentsLoading } = useSWR<{ 
    success: boolean; 
    data: { enrollments: Enrollment[] } 
  }>(
    user ? '/api/enrollments' : null,
    fetcher
  );

  // Fetch instructor's courses
  const { data: coursesData, isLoading: coursesLoading } = useSWR<{
    success: boolean;
    data: { courses: Course[] };
  }>(
    user && (user.role === 'instructor' || user.role === 'admin') 
      ? `/api/courses?instructor=${user.id}` 
      : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || enrollmentsLoading || coursesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const enrollments = enrollmentData?.data?.enrollments || [];
  const taughtCourses = coursesData?.data?.courses?.filter(
    (c) => c.instructor_id === user.id
  ) || [];
  const isInstructor = user.role === 'instructor' || user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          {isInstructor 
            ? 'Manage your courses and track student enrollments'
            : 'Track your enrolled courses and progress'}
        </p>
      </div>

      {isInstructor ? (
        <Tabs defaultValue="teaching" className="w-full">
          <TabsList>
            <TabsTrigger value="teaching" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Teaching ({taughtCourses.length})
            </TabsTrigger>
            <TabsTrigger value="enrolled" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Enrolled ({enrollments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teaching" className="mt-4">
            <TaughtCoursesList courses={taughtCourses} />
          </TabsContent>

          <TabsContent value="enrolled" className="mt-4">
            <EnrollmentsList enrollments={enrollments} />
          </TabsContent>
        </Tabs>
      ) : (
        <EnrollmentsList enrollments={enrollments} />
      )}
    </div>
  );
}

function EnrollmentsList({ enrollments }: { enrollments: Enrollment[] }) {
  if (enrollments.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">No enrolled courses</p>
        <p className="text-sm text-muted-foreground">Start learning by enrolling in a course</p>
        <Link href="/courses" className="mt-4">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.id}
          className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
        >
          {/* Course Header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 text-white">
            <h3 className="font-semibold">{enrollment.course_title}</h3>
            {enrollment.course_unit && (
              <p className="text-sm text-white/70">{enrollment.course_unit}</p>
            )}
          </div>

          {/* Course Body */}
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Badge
                variant="outline"
                className={statusColors[enrollment.status] || statusColors.pending}
              >
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {enrollment.progress}% complete
              </span>
            </div>

            <Progress value={enrollment.progress} className="mb-4 h-2" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </span>
              <Link href={`/courses/${enrollment.course_id}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaughtCoursesList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
        <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">No courses yet</p>
        <p className="text-sm text-muted-foreground">Create your first course to get started</p>
        <Link href="/admin/courses" className="mt-4">
          <Button>Create Course</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
        >
          {/* Course Header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 text-white">
            <h3 className="font-semibold">{course.title}</h3>
            {course.unit && (
              <p className="text-sm text-white/70">{course.unit}</p>
            )}
          </div>

          {/* Course Body */}
          <div className="p-4">
            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolled_count || 0} students</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{course.file_count || 0} materials</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {course.status}
              </Badge>
              <Link href={`/courses/${course.id}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  Manage
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
