'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 border-4 border-muted">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-lg font-semibold">{user.name}</h3>
        <p className="text-sm capitalize text-muted-foreground">{user.role}</p>
        <Button variant="default" className="mt-4 rounded-full px-6" size="sm">
          Profile
        </Button>
      </div>
    </div>
  );
}
