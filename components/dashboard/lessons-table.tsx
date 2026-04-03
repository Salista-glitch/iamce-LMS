'use client';

import { Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LessonRow {
  id: number;
  className: string;
  teacherName: string;
  teacherAvatar?: string;
  members: { name: string; avatar?: string }[];
  startingDate: string;
  material: string;
  paymentStatus: 'done' | 'pending';
}

interface LessonsTableProps {
  lessons: LessonRow[];
}

export function LessonsTable({ lessons }: LessonsTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Lessons</h3>
        <Button variant="link" className="text-sm text-primary">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-3 font-medium">Class</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Teacher Name</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Members</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Starting</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Material</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-b last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {lesson.className}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={lesson.teacherAvatar} />
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {lesson.teacherName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{lesson.teacherName}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex -space-x-2">
                    {lesson.members.slice(0, 3).map((member, i) => (
                      <Avatar key={i} className="h-7 w-7 border-2 border-card">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-muted text-xs">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {lesson.members.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                        +{lesson.members.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {lesson.startingDate}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary">
                    <Download className="h-4 w-4" />
                    {lesson.material}
                  </Button>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-normal',
                      lesson.paymentStatus === 'done'
                        ? 'border-success/50 bg-success/10 text-success'
                        : 'border-warning/50 bg-warning/10 text-warning'
                    )}
                  >
                    {lesson.paymentStatus === 'done' ? 'Done' : 'Pending'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
