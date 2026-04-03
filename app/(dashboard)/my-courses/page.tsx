'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Enrollment } from '@/types';

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

  const { data, isLoading } = useSWR<{ success: boolean; data: { enrollments: Enrollment[] } }>(
    '/api/enrollments',
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const enrollments = data?.data?.enrollments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Track your enrolled courses and progress</p>
      </div>

      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">No enrolled courses</p>
          <p className="text-sm text-muted-foreground">Start learning by enrolling in a course</p>
          <Link href="/courses" className="mt-4">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
