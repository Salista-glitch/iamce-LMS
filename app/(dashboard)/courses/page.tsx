'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { CourseCard } from '@/components/dashboard/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Course } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const courseVariants = ['blue', 'lightBlue', 'coral'] as const;

export default function CoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSWR<{ success: boolean; data: { courses: Course[] } }>(
    '/api/courses',
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

  const courses = data?.data?.courses || [];
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const canManageCourses = user.role === 'admin' || user.role === 'instructor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Browse available courses</p>
        </div>
        {canManageCourses && (
          <Link href="/admin/courses/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
          <p className="text-lg font-medium text-muted-foreground">No courses found</p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try a different search term' : 'Check back later for new courses'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course, index) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <CourseCard
                title={course.title}
                unit={course.unit}
                fileCount={course.file_count}
                instructorName={course.instructor_name || 'Unknown'}
                instructorAvatar={course.instructor_avatar}
                enrolledAvatars={[]}
                variant={courseVariants[index % courseVariants.length]}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
