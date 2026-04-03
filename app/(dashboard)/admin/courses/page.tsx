'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import type { Course } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors = {
  published: 'border-success/50 bg-success/10 text-success',
  draft: 'border-warning/50 bg-warning/10 text-warning',
  archived: 'border-muted-foreground/30 bg-muted text-muted-foreground',
};

export default function AdminCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useSWR<{ success: boolean; data: { courses: Course[] } }>(
    '/api/courses?status=all',
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

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteCourse.id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/courses?status=all');
        setDeleteCourse(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

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

  const courses = data?.data?.courses || [];
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Create and manage courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
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

      {/* Courses Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{course.title}</p>
                    {course.unit && (
                      <p className="text-sm text-muted-foreground">{course.unit}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {course.instructor_name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[course.status]}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{course.enrolled_count || 0}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(course.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/courses/${course.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteCourse(course)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCourses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCourse} onOpenChange={() => setDeleteCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteCourse?.title}&quot;? This will also
              remove all enrollments and materials. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCourse(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Spinner className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
