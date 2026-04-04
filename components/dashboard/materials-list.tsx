'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Download,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Play,
} from 'lucide-react';
import { MaterialViewer } from '@/components/dashboard/material-viewer';
import type { CourseMaterial } from '@/types';

interface MaterialsListProps {
  materials: CourseMaterial[];
  courseId: number;
  isInstructor: boolean;
  onUpdate: () => void;
}

export function MaterialsList({ materials, courseId, isInstructor, onUpdate }: MaterialsListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<CourseMaterial | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [materialToView, setMaterialToView] = useState<CourseMaterial | null>(null);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-primary" />;
      case 'document':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-primary" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  const handleToggleVisibility = async (material: CourseMaterial) => {
    setLoadingId(material.id);
    try {
      await fetch(`/api/courses/${courseId}/materials/${material.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !material.is_active }),
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    setLoadingId(materialToDelete.id);
    try {
      await fetch(`/api/courses/${courseId}/materials/${materialToDelete.id}`, {
        method: 'DELETE',
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete material:', error);
    } finally {
      setLoadingId(null);
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  const openMaterial = (material: CourseMaterial) => {
    if (material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    }
  };

  const viewMaterial = (material: CourseMaterial) => {
    setMaterialToView(material);
    setViewerOpen(true);
  };

  // Filter active materials for students, show all for instructors
  const visibleMaterials = isInstructor 
    ? materials 
    : materials.filter(m => m.is_active);

  if (visibleMaterials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">No materials yet</p>
        <p className="text-sm text-muted-foreground">
          {isInstructor 
            ? 'Click "Add Content" to upload your first material.'
            : 'Course materials will appear here once uploaded.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {visibleMaterials.map((material) => (
          <div
            key={material.id}
            className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${
              !material.is_active ? 'bg-muted/30 opacity-60' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                {getMaterialIcon(material.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{material.title}</p>
                  {!material.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {material.type}
                  {material.uploader_name && ` - by ${material.uploader_name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loadingId === material.id ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  {/* View button - opens inline viewer */}
                  {material.url && (material.type === 'video' || material.type === 'document') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewMaterial(material)}
                      title="View"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Open in new tab button */}
                  {material.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openMaterial(material)}
                      title="Open in new tab"
                    >
                      {material.type === 'document' ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {/* Instructor actions */}
                  {isInstructor && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleVisibility(material)}>
                          {material.is_active ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Hide from students
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Show to students
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setMaterialToDelete(material);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &quot;{materialToDelete?.title}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Material Viewer Modal */}
      <MaterialViewer
        material={materialToView}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}
