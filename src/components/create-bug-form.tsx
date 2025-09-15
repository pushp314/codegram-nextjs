
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createBugAction } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CreateBugForm() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const { toast } = useToast();
    const { data: session } = useSession();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);


    const handlePost = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (content.length < 10) {
            toast({
                variant: 'destructive',
                title: 'Too short!',
                description: 'Your bug report must be at least 10 characters long.'
            });
            return;
        }
        
        setIsPending(true);
        try {
            await createBugAction(content);
            toast({
                title: 'Bug Reported!',
                description: 'Thanks for your contribution.',
            });
            setContent('');
            setOpen(false);
            // Manually trigger a router refresh to fetch new data on the server component
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to Report Bug',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        } finally {
            setIsPending(false);
        }
    }

  return (
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
            <Button onClick={handlePost} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin mr-2" />}
                Post
            </Button>
        </DialogContent>
    </Dialog>
  );
}
