'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Plus, FileText, Video, Link as LinkIcon } from 'lucide-react';
import type { MaterialType } from '@/types';

interface ContentUploadFormProps {
  courseId: number;
  onSuccess: () => void;
}

export function ContentUploadForm({ courseId, onSuccess }: ContentUploadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('document');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          url: url || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload material');
      }

      // Reset form
      setTitle('');
      setType('document');
      setUrl('');
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'document':
        return 'https://example.com/document.pdf';
      case 'video':
        return 'https://youtube.com/watch?v=... or video URL';
      case 'link':
        return 'https://example.com/resource';
      default:
        return 'Enter URL';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Course Material</DialogTitle>
            <DialogDescription>
              Add a PDF document or video link to your course materials.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Chapter 1: Introduction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Content Type</Label>
              <Select value={type} onValueChange={(val) => setType(val as MaterialType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Document
                    </span>
                  </SelectItem>
                  <SelectItem value="video">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Link
                    </span>
                  </SelectItem>
                  <SelectItem value="link">
                    <span className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      External Link
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">
                {type === 'document' ? 'PDF URL' : type === 'video' ? 'Video URL' : 'Resource URL'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getTypeIcon()}
                </span>
                <Input
                  id="url"
                  type="url"
                  className="pl-10"
                  placeholder={getPlaceholder()}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {type === 'document' 
                  ? 'Paste a direct link to a PDF file (Google Drive, Dropbox, etc.)'
                  : type === 'video'
                  ? 'YouTube, Vimeo, or any video streaming URL'
                  : 'Any external resource URL'}
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
