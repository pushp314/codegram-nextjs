
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Heart, MessageCircle, Wand2, Code, Eye } from 'lucide-react';
import CodeBlock from './code-block';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useTransition } from 'react';
import { explainCodeSnippet } from '@/ai/flows/explain-code-snippet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveComponent from './live-component';
import type { Snippet } from '@/lib/types';
import { toggleLikeAction, toggleSaveAction } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SnippetDetailSheet } from './snippet-detail-sheet';
import Link from 'next/link';

type SnippetCardProps = {
  snippet: Snippet;
};

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const { author, title, code, language, likes_count, comments_count, isLiked, isBookmarked, id } = snippet;

  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('preview');
  
  const [isLikePending, startLikeTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();

  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  
  const { data: session } = useSession();
  const router = useRouter();


  const handleExplainCode = async () => {
    if (explanation) {
      return;
    }

    setIsLoadingExplanation(true);
    try {
      const result = await explainCodeSnippet({ code, language });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Explanation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setDialogOpen(false);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleLike = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    startLikeTransition(async () => {
      await toggleLikeAction(id);
    });
  };
  
  const handleSave = () => {
    if (!session) {
      router.push('/login');
      return;
    }
     startSaveTransition(async () => {
      await toggleSaveAction(id);
    });
  };

  const isComponent = language === 'jsx' || language === 'tsx' || language === 'html';

  const tabContentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const authorName = author?.name ?? 'Anonymous';
  const authorEmail = author?.email?.split('@')[0] ?? 'anonymous';
  const authorImage = author?.image ?? undefined;

  return (
    <>
    <Card className="flex flex-col rounded-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.id}`} className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10">
                <AvatarImage src={authorImage} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold group-hover:text-primary transition-colors">{authorName}</p>
                <p className="text-sm text-muted-foreground">@{authorEmail}</p>
            </div>
          </Link>
        </div>
         <CardTitle className="font-headline text-xl pt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="min-h-[250px] rounded-md border">
          {isComponent ? (
             <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
                <TabsTrigger value="code"><Code className="mr-2 h-4 w-4" />Code</TabsTrigger>
              </TabsList>
               <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'preview' && (
                        <div className="mt-0 rounded-b-md bg-background/50">
                            <div className="h-[400px] max-h-[400px] overflow-auto">
                                <LiveComponent code={code} language={language} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'code' && (
                         <div className="mt-0">
                            <CodeBlock code={code} language={language} />
                        </div>
                    )}
                 </motion.div>
              </AnimatePresence>
            </Tabs>
          ) : (
            <CodeBlock code={code} language={language} />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <motion.div whileTap={{ scale: 1.2, rotate: 10 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={handleLike}
              disabled={isLikePending}
            >
              <Heart className={isLiked ? 'fill-primary text-primary' : ''} />
            </Button>
          </motion.div>
           <span className="text-sm text-muted-foreground font-medium">{likes_count}</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => setIsDetailSheetOpen(true)}>
            <MessageCircle className="h-5 w-5" />
          </Button>
           <span className="text-sm text-muted-foreground font-medium">{comments_count}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary"
            onClick={handleSave}
            disabled={isSavePending}
            >
            <Bookmark className={isBookmarked ? 'fill-primary text-primary' : ''} />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={handleExplainCode}
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>AI Code Explanation</DialogTitle>
                <DialogDescription>
                  Here is a breakdown of the code snippet, explained by AI.
                </DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto pr-4">
                {isLoadingExplanation ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: explanation.replace(/\n/g, '<br />'),
                    }}
                  ></p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Badge variant="secondary">{language}</Badge>
      </CardFooter>
    </Card>
    <SnippetDetailSheet
        snippet={snippet}
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
    />
    </>
  );
}
