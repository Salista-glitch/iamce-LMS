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
            New French speaking classes are available.{' '}
            <span className="hidden sm:inline">
              Etudier en France for B1 and B2 levels.{' '}
            </span>
            <a href="/courses" className="font-medium text-primary hover:underline">
              Learn more
            </a>
          </p>
          <Button className="mt-4 rounded-full px-6" size="lg">
            Buy Lesson
          </Button>
        </div>
        <div className="hidden lg:block">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/your%20online%20courses%20_%20e-Learning%20Dashboard%20Learnthru_%20Manage-Je37w51GgVJrxQLkIpwWoMRFy1kkCM.jpg"
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
