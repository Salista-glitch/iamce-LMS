'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Send, 
  MoreVertical, 
  Flag, 
  Trash2, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import useSWR from 'swr';
import type { DiscussionMessage } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DiscussionRoomProps {
  courseId: number;
  isInstructor: boolean;
}

export function DiscussionRoom({ courseId, isInstructor }: DiscussionRoomProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<DiscussionMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Fetch messages with polling for real-time updates
  const { 
    data, 
    isLoading, 
    mutate: refreshMessages 
  } = useSWR<{
    success: boolean;
    data: { messages: DiscussionMessage[]; isInstructor: boolean };
  }>(
    `/api/courses/${courseId}/discussions`,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds for real-time feel
      revalidateOnFocus: true,
    }
  );

  const messages = data?.data?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  // Detect if user is scrolling up (to pause auto-scroll)
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('');
        setShouldAutoScroll(true);
        refreshMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFlagMessage = async (msg: DiscussionMessage) => {
    try {
      await fetch(`/api/courses/${courseId}/discussions/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_flagged: !msg.is_flagged }),
      });
      refreshMessages();
    } catch (error) {
      console.error('Failed to flag message:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      await fetch(`/api/courses/${courseId}/discussions/${messageToDelete.id}`, {
        method: 'DELETE',
      });
      refreshMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, DiscussionMessage[]>>((groups, msg) => {
    const date = formatDate(msg.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border bg-card">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Discussion Room</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {messages.filter(m => !m.is_deleted).length} messages
        </Badge>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start a discussion with your classmates and instructor
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 border-t" />
                  <span className="text-xs text-muted-foreground">{date}</span>
                  <div className="flex-1 border-t" />
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((msg) => {
                    const isOwn = msg.user_id === user?.id;
                    const isDeleted = msg.is_deleted;

                    if (isDeleted && !isInstructor) return null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} ${
                          isDeleted ? 'opacity-50' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.user_avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {msg.user_name?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-medium">{msg.user_name}</span>
                            {msg.user_role === 'instructor' && (
                              <Badge variant="secondary" className="text-xs">
                                Instructor
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>

                          <div className={`mt-1 flex items-start gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              } ${msg.is_flagged ? 'border-2 border-warning' : ''} ${
                                isDeleted ? 'line-through' : ''
                              }`}
                            >
                              {msg.is_flagged && (
                                <div className="mb-1 flex items-center gap-1 text-xs text-warning">
                                  <AlertTriangle className="h-3 w-3" />
                                  Flagged
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>

                            {/* Instructor actions */}
                            {isInstructor && !isDeleted && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                                  <DropdownMenuItem onClick={() => handleFlagMessage(msg)}>
                                    <Flag className="mr-2 h-4 w-4" />
                                    {msg.is_flagged ? 'Unflag' : 'Flag'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setMessageToDelete(msg);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !message.trim()}>
            {isSending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
