
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { addSnippetCommentAction, getSnippetCommentsAction } from '@/app/actions';
import type { Snippet, SnippetComment } from '@/lib/types';

interface SnippetDetailSheetProps {
  snippet: Snippet;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SnippetDetailSheet({ snippet, isOpen, onOpenChange }: SnippetDetailSheetProps) {
  const [comments, setComments] = useState<SnippetComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const [isCommentPending, startCommentTransition] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const fetchComments = async () => {
    setIsLoadingComments(true);
    const result = await getSnippetCommentsAction(snippet.id);
    if (result) {
      setComments(result);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch comments.' });
    }
    setIsLoadingComments(false);
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, snippet.id]);


  const handleCommentSubmit = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    startCommentTransition(async () => {
      try {
        await addSnippetCommentAction(snippet.id, commentText);
        setCommentText('');
        toast({ title: 'Comment posted!' });
        await fetchComments(); // Refetch comments to show the new one
        router.refresh(); // Revalidate the page to update comment count on cards
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: error instanceof Error ? error.message : 'Could not post comment.',
        });
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">{snippet.title}</SheetTitle>
          <SheetDescription>{snippet.description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={snippet.author.image ?? undefined} alt={snippet.author.name ?? ''} />
              <AvatarFallback>{snippet.author.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{snippet.author.name}</p>
              <p className="text-xs text-muted-foreground">@{snippet.author.email?.split('@')[0]}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="font-semibold mb-4">Comments</h3>
          <div className="space-y-6">
            {session?.user ? (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    className="w-full bg-card/50 backdrop-blur-sm rounded-lg p-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none transition-shadow"
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={isCommentPending || commentText.trim().length === 0}
                      className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                      size="sm"
                    >
                      {isCommentPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary underline">Log in</Link> to post a comment.
              </div>
            )}

            <div className="space-y-4">
              {isLoadingComments ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.image ?? undefined} />
                      <AvatarFallback>{comment.author.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
               {!isLoadingComments && comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground pt-4">No comments yet. Be the first to say something!</p>
               )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CommentSkeleton() {
    return (
        <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    )
}
