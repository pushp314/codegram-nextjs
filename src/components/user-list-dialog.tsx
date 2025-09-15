
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import FollowButton from './follow-button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { User } from '@/lib/types';

interface UserListDialogProps {
    users: User[];
    title: string;
    trigger: React.ReactNode;
}

export default function UserListDialog({ users, title, trigger }: UserListDialogProps) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {users.length > 0 ? (
                        users.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group">
                                    <Avatar>
                                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
                                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold group-hover:text-primary transition-colors">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{user.email?.split('@')[0]}</p>
                                    </div>
                                </Link>
                                {currentUserId && user.id !== currentUserId && (
                                    <FollowButton
                                        authorId={user.id}
                                        // This is a limitation: we don't know the follow status of these users
                                        // A more complex solution would be needed to show this accurately
                                        isFollowed={false} 
                                        isLoggedIn={!!currentUserId}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No users to display.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
