'use client';

import { use } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { CourseForm } from '@/components/forms/course-form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Course } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EditCoursePageProps {
  params: { id: string };
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useSWR<{ success: boolean; data: { course: Course } }>(
    `/api/courses/${id}`,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'instructor') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return null;
  }

  if (!data?.success || !data?.data?.course) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-muted-foreground">Course not found</p>
        <Link href="/admin/courses" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const course = data.data.course;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Link href="/admin/courses">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">
          Update course details for &quot;{course.title}&quot;
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border bg-card p-6">
        <CourseForm course={course} />
      </div>
    </div>
  );
}
