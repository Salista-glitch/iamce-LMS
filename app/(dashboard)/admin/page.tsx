'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { User, Course, Enrollment } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: usersData } = useSWR<{ success: boolean; data: { users: User[] } }>(
    user?.role === 'admin' ? '/api/users' : null,
    fetcher
  );

  const { data: coursesData } = useSWR<{ success: boolean; data: { courses: Course[] } }>(
    '/api/courses?status=all',
    fetcher
  );

  const { data: enrollmentsData } = useSWR<{ success: boolean; data: { enrollments: Enrollment[] } }>(
    user?.role === 'admin' ? '/api/enrollments' : null,
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

  const users = usersData?.data?.users || [];
  const courses = coursesData?.data?.courses || [];
  const enrollments = enrollmentsData?.data?.enrollments || [];

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      href: '/admin/users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      href: '/admin/courses',
      color: 'text-course-coral',
      bgColor: 'bg-course-coral/10',
    },
    {
      title: 'Enrollments',
      value: enrollments.length,
      icon: GraduationCap,
      href: '/admin/enrollments',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Active Courses',
      value: courses.filter((c) => c.status === 'published').length,
      icon: TrendingUp,
      href: '/admin/courses',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your learning platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {u.role}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.instructor_name || 'Unknown instructor'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs capitalize ${
                      c.status === 'published'
                        ? 'bg-success/10 text-success'
                        : c.status === 'draft'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-sm text-muted-foreground">No courses found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
