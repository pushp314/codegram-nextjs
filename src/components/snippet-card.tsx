
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
import { useState } from 'react';
import { explainCodeSnippet } from '@/ai/flows/explain-code-snippet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveComponent from './live-component';
import type { Snippet } from '@/lib/types';

type SnippetCardProps = {
  snippet: Snippet;
};

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const { author, title, code, language, likes_count } = snippet;

  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(likes_count);
  const [activeTab, setActiveTab] = useState('preview');

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
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const isComponent = language === 'jsx' || language === 'tsx' || language === 'html';

  const tabContentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <Card className="flex flex-col rounded-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar_url} alt={author.full_name} data-ai-hint="developer portrait" />
            <AvatarFallback>{author.full_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author.full_name}</p>
            <p className="text-sm text-muted-foreground">@{author.username}</p>
          </div>
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
            >
              <Heart className={isLiked ? 'fill-primary text-primary' : ''} />
            </Button>
          </motion.div>
           <span className="text-sm text-muted-foreground font-medium">{likes}</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Bookmark className="h-5 w-5" />
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
  );
}
