'use client';

import { FolderOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  title: string;
  unit?: string;
  fileCount: number;
  instructorName: string;
  instructorAvatar?: string;
  enrolledAvatars?: { name: string; avatar?: string }[];
  variant?: 'blue' | 'lightBlue' | 'coral';
  className?: string;
}

const variantStyles = {
  blue: 'bg-gradient-to-br from-primary to-primary/80',
  lightBlue: 'bg-gradient-to-br from-primary/70 to-primary/50',
  coral: 'bg-gradient-to-br from-course-coral to-course-coral/80',
};

export function CourseCard({
  title,
  unit,
  fileCount,
  instructorName,
  instructorAvatar,
  enrolledAvatars = [],
  variant = 'blue',
  className,
}: CourseCardProps) {
  return (
    <div
      className={cn(
        'group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-xl p-5 text-white shadow-md transition-transform hover:scale-[1.02]',
        variantStyles[variant],
        className
      )}
    >
      {/* Title and Unit */}
      <div>
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        {unit && <p className="mt-1 text-sm text-white/80">{unit}</p>}
      </div>

      {/* Enrolled Students */}
      <div className="my-4 flex -space-x-2">
        {enrolledAvatars.slice(0, 3).map((student, i) => (
          <Avatar key={i} className="h-8 w-8 border-2 border-white/30">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="bg-white/20 text-xs text-white">
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
        {enrolledAvatars.length > 3 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-xs font-medium">
            +{enrolledAvatars.length - 3}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/90">
          <FolderOpen className="h-4 w-4" />
          <span>{fileCount} Files</span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-white/30">
            <AvatarImage src={instructorAvatar} />
            <AvatarFallback className="bg-white/20 text-xs text-white">
              {instructorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-white/80">Teacher: {instructorName}</span>
        </div>
      </div>
    </div>
  );
}
