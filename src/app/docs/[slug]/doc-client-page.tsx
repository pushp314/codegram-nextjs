
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bookmark, MessageCircle, Send, Heart, Share2, MoreVertical, Flag, ShieldBan, UserCheck, UserPlus, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { format, formatDistanceToNow } from 'date-fns';
import { toggleFollowAction, toggleDocumentLikeAction, toggleDocumentSaveAction, createDocumentCommentAction, type FullDocument } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

function slugify(text: string) {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export default function DocClientPage({ doc: initialDoc }: { doc: FullDocument }) {
  const [doc, setDoc] = useState(initialDoc);
  const [isScrolled, setIsScrolled] = useState(false);
  const [toc, setToc] = useState<{level: number, text: string, id: string}[]>([]);
  const { ref, inView } = useInView({ threshold: 0 });
  const [commentText, setCommentText] = useState('');

  
  const [isFollowPending, startFollowTransition] = useTransition();
  const [isLikePending, startLikeTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();
  const [isCommentPending, startCommentTransition] = useTransition();
  
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (doc) {
        const headings = Array.from(doc.content.matchAll(/^(#{2,4})\s+(.*)/gm)).map(match => {
            const level = match[1].length;
            const text = match[2];
            const id = slugify(text);
            return { level, text, id };
        });
        setToc(headings);
    }
  }, [doc]);


  useEffect(() => {
    setIsScrolled(!inView);
  }, [inView]);

  const handleAction = async (action: () => Promise<void>, startTransition: React.TransitionStartFunction, revalidate?: boolean) => {
    if (!session?.user) {
        router.push('/login');
        return;
    }
    startTransition(async () => {
        try {
            await action();
            if (revalidate) router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: error instanceof Error ? error.message : 'Could not perform action.',
            });
        }
    });
  };

  const handleFollow = () => handleAction(async () => {
    await toggleFollowAction(doc.author.id);
    setDoc(prev => ({...prev, isFollowed: !prev.isFollowed}));
    toast({ title: doc.isFollowed ? `Unfollowed ${doc.author.name}` : `Followed ${doc.author.name}` });
  }, startFollowTransition);

  const handleLike = () => handleAction(async () => {
      setDoc(prev => ({
          ...prev, 
          isLiked: !prev.isLiked,
          likes_count: prev.isLiked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
      await toggleDocumentLikeAction(doc.id);
  }, startLikeTransition);

  const handleSave = () => handleAction(async () => {
      setDoc(prev => ({
          ...prev,
          isSaved: !prev.isSaved,
          saves_count: prev.isSaved ? prev.saves_count - 1 : prev.saves_count + 1
      }));
      await toggleDocumentSaveAction(doc.id);
  }, startSaveTransition);

  const handleCommentSubmit = () => handleAction(async () => {
    await createDocumentCommentAction(doc.id, commentText);
    setCommentText('');
    toast({ title: "Comment posted!" });
  }, startCommentTransition, true);


  const SocialButton = ({ icon: Icon, children, tooltip, onClick, pending, active }: { icon: React.ElementType, children?: React.ReactNode, tooltip: string, onClick?: () => void, pending?: boolean, active?: boolean }) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size={isScrolled ? 'icon' : 'sm'} className={cn("flex items-center gap-2", active && 'text-primary')} onClick={onClick} disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" /> : <Icon className={cn("h-5 w-5", isScrolled ? "h-5 w-5" : "h-4 w-4", active && "fill-current")} />}
                    {!isScrolled && children}
                </Button>
            </TooltipTrigger>
            {isScrolled && <TooltipContent>{tooltip}</TooltipContent>}
        </Tooltip>
    </TooltipProvider>
  )

  const FollowButton = () => (
     <Button 
        onClick={handleFollow} 
        disabled={isFollowPending || doc.author.id === session?.user?.id}
        variant="secondary" 
        className="w-full sm:w-auto mt-4"
    >
        {isFollowPending ? <Loader2 className="animate-spin mr-2"/> : (doc.isFollowed ? <UserCheck className="mr-2" /> : <UserPlus className="mr-2" />)}
        {doc.isFollowed ? 'Following' : 'Follow'}
    </Button>
  );

  return (
    <TracingBeam className="px-6">
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-12">

        <div className="lg:w-3/4">
            <div className="prose prose-lg dark:prose-invert max-w-none bg-transparent">
                <h1>{doc.title}</h1>
                <p className="text-muted-foreground">Published on {format(new Date(doc.createdAt), 'MMMM d, yyyy')} • 5 min read</p>
            </div>
            
            <div ref={ref} className="h-px" /> 

            <motion.div
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                    'z-40 bg-card/50 backdrop-blur-sm',
                    isScrolled
                    ? 'fixed top-20 right-4 sm:right-8 rounded-full border p-1'
                    : 'sticky top-[68px] border-y my-6 rounded-lg'
                )}
            >
                <div className={cn("flex items-center", isScrolled ? "gap-1" : "justify-between px-2 py-2")}>
                    <div className={cn("flex items-center", isScrolled ? "gap-1" : "gap-1")}>
                        <SocialButton icon={Heart} tooltip={`Like (${doc.likes_count})`} onClick={handleLike} pending={isLikePending} active={doc.isLiked}>
                            {!isScrolled && <span>Like ({doc.likes_count})</span>}
                        </SocialButton>
                        <a href="#comments">
                            <SocialButton icon={MessageCircle} tooltip={`Comment (${doc.comments_count})`}>
                                {!isScrolled && <span>Comment ({doc.comments_count})</span>}
                            </SocialButton>
                        </a>
                    </div>
                    <div className={cn("flex items-center", isScrolled ? "gap-1" : "gap-1")}>
                        <SocialButton icon={Bookmark} tooltip="Save" onClick={handleSave} pending={isSavePending} active={doc.isSaved}/>
                        <SocialButton icon={Share2} tooltip="Share" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Flag className="mr-2"/> Report</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive"><ShieldBan className="mr-2"/> Block user</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.div>
            
            <aside className="my-6 lg:hidden">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Table of Contents</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-3 text-sm text-muted-foreground">
                            {toc.map(({level, text, id}) => (
                                <li key={id} style={{ paddingLeft: `${(level - 2) * 1}rem` }}>
                                    <a href={`#${id}`} className="hover:text-primary transition-colors">{text}</a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </aside>

          <article className="prose prose-lg dark:prose-invert max-w-none pt-6 bg-transparent">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({node, ...props}) => {
                        const id = slugify(props.children?.toString() || '');
                        return <h2 id={id} {...props} />;
                    },
                    h3: ({node, ...props}) => {
                        const id = slugify(props.children?.toString() || '');
                        return <h3 id={id} {...props} />;
                    },
                    h4: ({node, ...props}) => {
                        const id = slugify(props.children?.toString() || '');
                        return <h4 id={id} {...props} />;
                    },
                    code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            <div className="not-prose my-4">
                                <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]}/>
                            </div>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {doc.content}
            </ReactMarkdown>
          </article>
          
           <Separator className="my-12" />

            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={doc.author.image ?? undefined} data-ai-hint="developer" />
                            <AvatarFallback>{doc.author.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-bold text-lg">{doc.author.name}</p>
                            <p className="text-sm text-muted-foreground">@{doc.author.email?.split('@')[0]}</p>
                            <p className="text-sm text-muted-foreground mt-4">{doc.author.bio ?? 'A passionate developer and writer.'}</p>
                            <FollowButton />
                        </div>
                    </div>
                </CardContent>
            </Card>

          <Separator className="my-12" />

          <div id="comments">
            <h2 className="text-2xl font-bold mb-6">Comments ({doc.comments_count})</h2>
            <div className="space-y-6">
                {session?.user ? (
                <div className="flex gap-4">
                    <Avatar>
                         <AvatarImage src={session.user.image ?? undefined} />
                        <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea 
                            placeholder="Add a comment..." 
                            className="w-full bg-card/50 backdrop-blur-sm rounded-lg p-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none transition-shadow" 
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <Button 
                                onClick={handleCommentSubmit} 
                                disabled={isCommentPending || commentText.trim().length === 0}
                                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                                {isCommentPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
                ) : (
                    <div className='text-center text-muted-foreground'>
                        <Link href="/login" className='text-primary underline'>Log in</Link> to post a comment.
                    </div>
                )}
                <div className="space-y-8">
                    {doc.comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar>
                                <AvatarImage src={comment.author.image ?? undefined} />
                                <AvatarFallback>{comment.author.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <div className='flex items-baseline gap-2'>
                                    <p className='font-semibold'>{comment.author.name}</p>
                                    <p className='text-xs text-muted-foreground'>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                                </div>
                                <p className='text-sm text-muted-foreground'>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:w-1/4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-3 text-sm text-muted-foreground">
                        {toc.map(({level, text, id}) => (
                            <li key={id} style={{ paddingLeft: `${(level - 2) * 1}rem` }}>
                                <a href={`#${id}`} className="hover:text-primary transition-colors">{text}</a>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </aside>

      </div>
    </div>
    </TracingBeam>
  );
}
