
'use client';

import BugsFeed from '@/components/bugs-feed';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bug, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';


export default function BugsPage() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const { toast } = useToast();

    const handlePost = async () => {
        if (content.length < 10) {
            toast({
                variant: 'destructive',
                title: 'Too short!',
                description: 'Your bug report must be at least 10 characters long.'
            });
            return;
        }

        setIsPosting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: 'Bug Reported!',
            description: 'Thanks for your contribution.',
        });

        setIsPosting(false);
        setContent('');
        setOpen(false);
    }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="font-headline text-3xl mb-2 flex items-center"><Bug className="mr-3 h-8 w-8 text-primary" /> Bug Feed</h1>
            <p className="text-muted-foreground">Report issues, and track bugs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Post a Bug</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Report a Bug</DialogTitle>
                    <DialogDescription>
                        Describe the bug in detail. Keep it short and sweet (max 280 characters).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea 
                        placeholder="What's the issue?" 
                        maxLength={280} 
                        className="min-h-[100px]" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <Button onClick={handlePost} disabled={isPosting}>
                    {isPosting && <Loader2 className="animate-spin mr-2" />}
                    Post
                </Button>
            </DialogContent>
        </Dialog>
      </div>

       <div className="space-y-6">
        <BugsFeed />
      </div>

    </div>
  );
}
