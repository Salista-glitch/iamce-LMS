'use client';

import { use } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Play,
  Download,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Course } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CourseDetailPageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data, isLoading, error } = useSWR<{ success: boolean; data: { course: Course } }>(
    `/api/courses/${id}`,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: parseInt(id) }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/my-courses');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

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

  if (error || !data?.success || !data?.data?.course) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-muted-foreground">Course not found</p>
        <Link href="/courses" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const course = data.data.course;

  // Sample materials - in production these would come from the API
  const materials = [
    { id: 1, title: 'Introduction to the Course', type: 'video', duration: '15 min' },
    { id: 2, title: 'Chapter 1: Getting Started', type: 'document', pages: 12 },
    { id: 3, title: 'Practice Exercises', type: 'assignment', due: '3 days' },
    { id: 4, title: 'Chapter 2: Core Concepts', type: 'video', duration: '25 min' },
    { id: 5, title: 'Supplementary Reading', type: 'document', pages: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/courses">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Course Header */}
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
              {course.unit || 'Course'}
            </Badge>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-2 text-white/80">
              {course.description || 'Comprehensive course materials designed for Montessori learners.'}
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white/70" />
                <span>{course.enrolled_count || 0} students enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-white/70" />
                <span>{course.file_count} materials</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/70" />
                <span>Self-paced</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="mt-6 flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarImage src={course.instructor_avatar} />
                <AvatarFallback className="bg-white/20 text-white">
                  {course.instructor_name?.charAt(0) || 'I'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-white/70">Instructor</p>
                <p className="font-medium">{course.instructor_name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling && <Spinner className="mr-2 h-4 w-4" />}
              Enroll Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Preview Course
            </Button>
          </div>
        </div>
      </div>

      {/* Course Materials */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Course Materials</h2>
        </div>
        <div className="divide-y">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {material.type === 'video' ? (
                    <Play className="h-5 w-5 text-primary" />
                  ) : material.type === 'document' ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{material.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {material.type === 'video'
                      ? material.duration
                      : material.type === 'document'
                      ? `${material.pages} pages`
                      : `Due in ${material.due}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
