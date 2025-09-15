
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Plus, Code, FileText, Bookmark, Bug } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getSnippetsAction } from '../actions';
import ProfileTabs from './profile-tabs';
import prisma from '@/lib/db';

async function getProfileStats(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: { 
                    snippets: true,
                    followers: true,
                    following: true,
                }
            }
        }
    });
    return {
        snippets: user?._count.snippets ?? 0,
        followers: user?._count.followers ?? 0,
        following: user?._count.following ?? 0,
    }
}


export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { user } = session;
  const { snippets, followers, following } = await getProfileStats(user.id);
  const initialSnippets = await getSnippetsAction({ page: 0, limit: 4, authorId: user.id });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardHeader className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
              <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">@{user.email?.split('@')[0]}</p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
             <Button variant="outline" asChild className="flex-1 sm:flex-auto">
                <Link href="/settings"><Edit /> Edit Profile</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex-1 sm:flex-auto">
                  <Plus /> Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/snippets/create"><Code className="mr-2" />New Snippet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/docs/create"><FileText className="mr-2" />New Doc</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/bugs"><Bug className="mr-2" />Post a Bug</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
            <div className="mb-6 text-sm text-muted-foreground">
                <p>Developer, writer, and creator. Helping developers build amazing things.</p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 border-t border-b py-3 mb-6">
                <div className="text-center">
                    <p className="font-bold text-xl">{snippets}</p>
                    <p className="text-xs text-muted-foreground">Snippets</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-xl">{followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-xl">{following}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                </div>
            </div>
            
            <ProfileTabs initialSnippets={initialSnippets} authorId={user.id} />

        </CardContent>
      </Card>
    </div>
  );
}
