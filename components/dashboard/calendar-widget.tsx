'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarWidgetProps {
  highlightedDates?: number[];
  month?: number;
  year?: number;
}

export function CalendarWidget({
  highlightedDates = [7, 19, 29],
  month: initialMonth,
  year: initialYear,
}: CalendarWidgetProps) {
  const now = new Date();
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [year, setYear] = useState(initialYear ?? now.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Adjust to Monday start (0 = Mon, 6 = Sun)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  const days = [];
  const totalSlots = 42; // 6 rows x 7 days

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  // Next month days
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {monthNames[month]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.slice(0, 35).map((item, index) => {
          const isToday = isCurrentMonth && item.isCurrentMonth && item.day === today;
          const isHighlighted = item.isCurrentMonth && highlightedDates.includes(item.day);

          return (
            <button
              key={index}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
                !item.isCurrentMonth && 'text-muted-foreground/50',
                item.isCurrentMonth && 'text-foreground hover:bg-muted',
                isToday && 'bg-primary text-primary-foreground hover:bg-primary/90',
                isHighlighted && !isToday && 'bg-primary/10 text-primary font-medium'
              )}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
