'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WelcomeBannerProps {
  userName: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            New Low-Resource Classroom modules are now available.{' '}
            <span className="hidden sm:inline">
              Learn to build your own Montessori environment using local materials.{' '}
            </span>
            <a href="/courses" className="font-medium text-primary hover:underline">
              Learn more
            </a>
          </p>
          <Button className="mt-4 rounded-full px-6" size="lg">
            Explore Module
          </Button>
        </div>
        <div className="hidden lg:block">
          <Image
            src="/logo2.png"
            alt="Stack of books illustration"
            width={180}
            height={120}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
