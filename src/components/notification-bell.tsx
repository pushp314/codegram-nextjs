
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getNotificationsAction, markNotificationsAsReadAction } from '@/app/actions';
import type { Notification, NotificationType } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

function getNotificationMessage(notification: Notification) {
    const originatorName = notification.originator.name || 'Someone';
    switch (notification.type) {
        case 'LIKE':
            return `${originatorName} liked your content.`;
        case 'COMMENT':
            return `${originatorName} commented on your content.`;
        case 'FOLLOW':
            return `${originatorName} started following you.`;
        default:
            return 'You have a new notification.';
    }
}

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'LIKE':
            return <Heart className="h-4 w-4 text-red-500" />;
        case 'COMMENT':
            return <MessageCircle className="h-4 w-4 text-blue-500" />;
        case 'FOLLOW':
            return <UserPlus className="h-4 w-4 text-green-500" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
}

export default function NotificationBell() {
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        if (session?.user?.id) {
            setIsLoading(true);
            const result = await getNotificationsAction(session.user.id);
            if (result) {
                setNotifications(result.notifications);
                setUnreadCount(result.unreadCount);
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [status, session?.user?.id]);
    
    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0 && session?.user?.id) {
            // Optimistically update UI
            const previouslyRead = notifications.filter(n => !n.read).map(n => n.id);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            
            // Mark as read on server
            await markNotificationsAsReadAction(session.user.id);
        }
    };
    
    if (status !== 'authenticated') {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary justify-center items-center text-xs text-primary-foreground">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 font-medium border-b">
                    Notifications
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 space-y-4">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center p-8">You have no notifications yet.</p>
                    ) : (
                        notifications.map((notification) => (
                            <Link 
                                href={notification.link || '#'} 
                                key={notification.id} 
                                className="block hover:bg-accent"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="p-4 flex items-start gap-3 border-b">
                                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1">
                                        <p className="text-sm">{getNotificationMessage(notification)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
