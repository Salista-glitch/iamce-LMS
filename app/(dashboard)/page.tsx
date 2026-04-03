'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { CourseCard } from '@/components/dashboard/course-card';
import { CalendarWidget } from '@/components/dashboard/calendar-widget';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { RemindersWidget } from '@/components/dashboard/reminders-widget';
import { LessonsTable } from '@/components/dashboard/lessons-table';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

// Sample data - in production this would come from the API
const sampleCourses = [
  {
    id: 1,
    title: 'English - UNIT III',
    unit: 'Advanced Communication',
    fileCount: 10,
    instructorName: 'Leona Jimenez',
    enrolledAvatars: [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'Diana' },
    ],
    variant: 'blue' as const,
  },
  {
    id: 2,
    title: 'English - UNIT II',
    unit: 'Intermediate Grammar',
    fileCount: 12,
    instructorName: 'Cole Chandler',
    enrolledAvatars: [
      { name: 'Eve' },
      { name: 'Frank' },
    ],
    variant: 'lightBlue' as const,
  },
  {
    id: 3,
    title: 'UNIT I',
    unit: 'Introduction',
    fileCount: 18,
    instructorName: 'Cole Chandler',
    enrolledAvatars: [
      { name: 'Grace' },
      { name: 'Henry' },
      { name: 'Ivy' },
    ],
    variant: 'coral' as const,
  },
];

const sampleLessons = [
  {
    id: 1,
    className: 'A1',
    teacherName: 'Bernard Carr',
    members: [{ name: 'Alice' }, { name: 'Bob' }],
    startingDate: '12.07.2022',
    material: 'Download',
    paymentStatus: 'done' as const,
  },
  {
    id: 2,
    className: 'A1',
    teacherName: 'Henry Poole',
    members: [{ name: 'Charlie' }, { name: 'Diana' }, { name: 'Eve' }],
    startingDate: '17.07.2022',
    material: 'Download',
    paymentStatus: 'pending' as const,
  },
  {
    id: 3,
    className: 'A1',
    teacherName: 'Helena Lowe',
    members: [{ name: 'Frank' }, { name: 'Grace' }],
    startingDate: '22.07.2022',
    material: 'Download',
    paymentStatus: 'done' as const,
  },
];

const sampleReminders = [
  {
    id: 1,
    title: 'Vocabulary test',
    date: '12 Dec 2022, Friday',
    type: 'test' as const,
    course: 'Eng',
  },
  {
    id: 2,
    title: 'Essay',
    date: '12 Dec 2022, Friday',
    type: 'essay' as const,
    course: 'Eng',
  },
  {
    id: 3,
    title: 'Speaking Class',
    date: '12 Dec 2022, Friday',
    type: 'class' as const,
    course: 'Eng',
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner userName={user.name.split(' ')[0]} />

        {/* Classes Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Classes</h2>
            <Link href="/courses">
              <Button variant="link" className="gap-1 text-primary">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sampleCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>

        {/* Lessons Table */}
        <LessonsTable lessons={sampleLessons} />
      </div>

      {/* Right Sidebar */}
      <aside className="w-full space-y-6 lg:w-80">
        <ProfileCard user={user} />
        <CalendarWidget highlightedDates={[7, 19, 29]} />
        <RemindersWidget reminders={sampleReminders} />
      </aside>
    </div>
  );
}
