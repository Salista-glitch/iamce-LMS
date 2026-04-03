'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { CourseForm } from '@/components/forms/course-form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function NewCoursePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'instructor') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return null;
  }

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
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Add a new course for students to enroll in
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border bg-card p-6">
        <CourseForm />
      </div>
    </div>
  );
}
