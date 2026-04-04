'use client';

import { FileText, Video, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import useSWR from 'swr';
import Link from 'next/link';
import type { CourseMaterial } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RecentMaterial extends CourseMaterial {
  course_title?: string;
  course_unit?: string;
}

export function RecentContent() {
  const { data, isLoading } = useSWR<{
    success: boolean;
    data: { materials: RecentMaterial[] };
  }>('/api/materials/recent?limit=5', fetcher);

  const materials = data?.data?.materials || [];

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openMaterial = (material: RecentMaterial) => {
    if (material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Recent Content</h3>
        <Link href="/my-courses">
          <Button variant="link" className="text-sm text-primary">
            View All
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-muted-foreground">No recent content</p>
          <p className="text-sm text-muted-foreground">
            Enroll in courses to see new materials here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-3 font-medium">Material</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Course</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Type</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Uploaded</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-sm max-w-[200px]">
                          {material.title}
                        </p>
                        {material.uploader_name && (
                          <p className="truncate text-xs text-muted-foreground">
                            by {material.uploader_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link 
                      href={`/courses/${material.course_id}`}
                      className="hover:underline"
                    >
                      <Badge variant="outline" className="font-normal">
                        {material.course_title || 'Unknown'}
                      </Badge>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm capitalize">
                    {material.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(material.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {material.url ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-2 text-primary"
                        onClick={() => openMaterial(material)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
