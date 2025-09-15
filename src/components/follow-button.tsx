
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toggleFollowAction } from '@/app/actions';

type FollowButtonProps = {
    authorId: string;
    isFollowed: boolean;
    isLoggedIn: boolean;
};

export default function FollowButton({ authorId, isFollowed, isLoggedIn }: FollowButtonProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isFollowPending, startFollowTransition] = useTransition();
    const [followed, setFollowed] = useState(isFollowed);

    useEffect(() => {
        setFollowed(isFollowed);
    }, [isFollowed]);

    const handleFollow = () => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        startFollowTransition(async () => {
            try {
                await toggleFollowAction(authorId);
                setFollowed(prev => !prev);
                toast({
                    title: followed ? `Unfollowed user` : `Followed user`,
                });
            } catch (error) {
                console.error(error);
                toast({
                    variant: 'destructive',
                    title: 'Something went wrong',
                    description: error instanceof Error ? error.message : 'Could not update follow status.',
                });
            }
        });
    };

    return (
        <Button
            onClick={handleFollow}
            disabled={isFollowPending}
            variant={followed ? 'secondary' : 'default'}
            className="w-full"
        >
            {isFollowPending ? (
                <Loader2 className="animate-spin" />
            ) : followed ? (
                <>
                    <UserCheck className="mr-2 h-4 w-4" /> Following
                </>
            ) : (
                <>
                    <UserPlus className="mr-2 h-4 w-4" /> Follow
                </>
            )}
        </Button>
    );
}
