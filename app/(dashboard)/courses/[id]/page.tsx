'use client';

import { use } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Users,
  FileText,
  Clock,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { Course, CourseMaterial, Enrollment } from '@/types';
import { ContentUploadForm } from '@/components/dashboard/content-upload-form';
import { MaterialsList } from '@/components/dashboard/materials-list';
import { DiscussionRoom } from '@/components/dashboard/discussion-room';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CourseDetailPageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Fetch course details
  const { data: courseData, isLoading: courseLoading } = useSWR<{ 
    success: boolean; 
    data: { course: Course } 
  }>(
    `/api/courses/${id}`,
    fetcher
  );

  // Fetch course materials
  const { 
    data: materialsData, 
    isLoading: materialsLoading,
    mutate: refreshMaterials 
  } = useSWR<{ 
    success: boolean; 
    data: { materials: CourseMaterial[] } 
  }>(
    user ? `/api/courses/${id}/materials` : null,
    fetcher
  );

  // Check if user is enrolled
  const { data: enrollmentData } = useSWR<{
    success: boolean;
    data: { enrollments: Enrollment[] };
  }>(
    user ? '/api/enrollments' : null,
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

  if (authLoading || courseLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!courseData?.success || !courseData?.data?.course) {
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

  const course = courseData.data.course;
  const materials = materialsData?.data?.materials || [];
  const isInstructor = course.instructor_id === user.id || user.role === 'admin';
  const isEnrolled = enrollmentData?.data?.enrollments?.some(
    (e) => e.course_id === parseInt(id)
  ) || false;
  const canAccessCourse = isInstructor || isEnrolled || user.role === 'admin';

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
                <span>{materials.filter(m => m.is_active !== false).length} materials</span>
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
            {!canAccessCourse ? (
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={handleEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling && <Spinner className="mr-2 h-4 w-4" />}
                Enroll Now
              </Button>
            ) : (
              <Badge className="bg-white/20 text-white">
                {isInstructor ? 'Your Course' : 'Enrolled'}
              </Badge>
            )}
            {isInstructor && (
              <ContentUploadForm 
                courseId={parseInt(id)} 
                onSuccess={refreshMaterials} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      {canAccessCourse ? (
        <Tabs defaultValue="materials" className="w-full">
          <TabsList>
            <TabsTrigger value="materials" className="gap-2">
              <FileText className="h-4 w-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="discussions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-4">
            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Course Materials</h2>
                {isInstructor && (
                  <p className="text-sm text-muted-foreground">
                    {materials.filter(m => !m.is_active).length > 0 && 
                      `${materials.filter(m => !m.is_active).length} hidden`}
                  </p>
                )}
              </div>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <MaterialsList
                  materials={materials}
                  courseId={parseInt(id)}
                  isInstructor={isInstructor}
                  onUpdate={refreshMaterials}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-4">
            <DiscussionRoom 
              courseId={parseInt(id)} 
              isInstructor={isInstructor}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="rounded-xl border bg-card p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Enroll to Access Content</h3>
          <p className="mt-2 text-muted-foreground">
            Enroll in this course to access materials and discussions.
          </p>
          <Button className="mt-4" onClick={handleEnroll} disabled={isEnrolling}>
            {isEnrolling && <Spinner className="mr-2 h-4 w-4" />}
            Enroll Now
          </Button>
        </div>
      )}
    </div>
  );
}
