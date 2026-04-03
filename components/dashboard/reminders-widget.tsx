'use client';

import { cn } from '@/lib/utils';

interface Reminder {
  id: number;
  title: string;
  date: string;
  type: 'test' | 'essay' | 'class' | 'assignment';
  course?: string;
}

interface RemindersWidgetProps {
  reminders: Reminder[];
}

const typeColors = {
  test: 'bg-primary',
  essay: 'bg-course-coral',
  class: 'bg-success',
  assignment: 'bg-warning',
};

export function RemindersWidget({ reminders }: RemindersWidgetProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold">Reminders</h3>
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-start gap-3">
            <div
              className={cn(
                'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
                typeColors[reminder.type]
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">
                {reminder.course && (
                  <span className="text-muted-foreground">{reminder.course} - </span>
                )}
                {reminder.title}
              </p>
              <p className="text-xs text-muted-foreground">{reminder.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
