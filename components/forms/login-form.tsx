'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await login(data.email, data.password);
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        {/* Logo */}
<div className="flex flex-col items-center gap-4 mb-2">
  <div className="relative h-20 w-20"> {/* Adjusted size for better visual gravity */}
    <Image 
      src="/logo2.png" 
      alt="IAMCE Logo"
      fill // This fills the parent div while maintaining aspect ratio
      priority
      className="object-contain"
    />
  </div>
  <div className="text-center">
    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">IAMCE</h1>
    <p className="text-muted-foreground text-sm">Sign in to your account</p>
  </div>
</div>

        {/* Form Card */}
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="mb-3 text-center text-sm font-medium text-foreground">Demo Credentials</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
              <span className="font-medium text-primary">Admin:</span>
              <span className="text-muted-foreground">admin@learnthru.com / admin123</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
              <span className="font-medium text-primary">Student:</span>
              <span className="text-muted-foreground">stella@learnthru.com / student123</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
              <span className="font-medium text-primary">Instructor:</span>
              <span className="text-muted-foreground">instructor@learnthru.com / instructor123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
