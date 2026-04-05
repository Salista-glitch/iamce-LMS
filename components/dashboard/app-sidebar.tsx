'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Video,
  Film,
  FolderOpen,
  Users,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const mainNavItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Classroom', href: '/courses', icon: GraduationCap },
  { title: 'My Courses', href: '/my-courses', icon: BookOpen },
  // { title: 'Live Lessons', href: '/live-lessons', icon: Video },
  // { title: 'Recorded Lessons', href: '/recorded', icon: Film },
  // { title: 'Video Library', href: '/library', icon: FolderOpen },
];

const adminNavItems = [
  { title: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Courses', href: '/admin/courses', icon: BookOpen },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || isAdmin;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center ">
            <Image
                        src="/logo2.png"
                        alt="Stack of books illustration"
                        width={180}
                        height={120}
                        className="object-contain"
                        priority
                      />
          </div>
          <span className="text-xl font-bold text-foreground">IAMCE</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'h-11 gap-3 rounded-lg px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      pathname === item.href &&
                        'bg-sidebar-accent text-sidebar-primary font-medium'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isInstructor && (
          <SidebarGroup className="mt-6">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administration
            </p>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                      className={cn(
                        'h-11 gap-3 rounded-lg px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        (pathname === item.href || pathname.startsWith(item.href + '/')) &&
                          'bg-sidebar-accent text-sidebar-primary font-medium'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Help Section */}
        <div className="mt-auto px-2 pt-8">
          <div className="rounded-xl bg-primary/10 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="mb-1 text-sm font-semibold text-foreground">Need help?</p>
            <p className="text-xs text-muted-foreground">
              Do you have any problem while using the IAMCE app?
            </p>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
