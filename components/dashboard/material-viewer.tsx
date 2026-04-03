'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ExternalLink, 
  Download, 
  FileText, 
  Video,
  X
} from 'lucide-react';
import type { CourseMaterial } from '@/types';

interface MaterialViewerProps {
  material: CourseMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to detect if URL is a YouTube video
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Helper to get YouTube embed URL
function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URL(url).searchParams;
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Helper to detect if URL is a Vimeo video
function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

// Helper to get Vimeo embed URL
function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  const videoId = match ? match[1] : '';
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

// Helper to detect if URL is a PDF
function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.includes('/pdf');
}

// Helper to get Google Docs viewer URL for PDFs
function getPdfViewerUrl(url: string): string {
  // Use Google Docs viewer for external PDFs
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export function MaterialViewer({ material, open, onOpenChange }: MaterialViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!material) return null;

  const url = material.url || '';
  const isVideo = material.type === 'video';
  const isDocument = material.type === 'document';
  const isYouTube = isYouTubeUrl(url);
  const isVimeo = isVimeoUrl(url);
  const isPdf = isPdfUrl(url);

  const getEmbedUrl = () => {
    if (isYouTube) return getYouTubeEmbedUrl(url);
    if (isVimeo) return getVimeoEmbedUrl(url);
    if (isPdf || isDocument) return getPdfViewerUrl(url);
    return url;
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVideo ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <DialogTitle className="text-lg">{material.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenExternal}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              {(isPdf || isDocument) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenExternal}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Loading content...</p>
              </div>
            </div>
          )}
          
          {(isYouTube || isVimeo) ? (
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          ) : (isPdf || isDocument) ? (
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
            />
          ) : isVideo ? (
            <video
              src={url}
              controls
              className="w-full h-full object-contain"
              onLoadedData={() => setIsLoading(false)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Preview not available for this content type
              </p>
              <Button 
                onClick={handleOpenExternal} 
                className="mt-4 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Content
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
