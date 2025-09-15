
'use server';

import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
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
import { getSnippetsAction, getDocumentsByAuthorAction, getUserProfile } from '@/app/actions';
import ProfileTabs from './profile-tabs';
import UserListDialog from '@/components/user-list-dialog';
import FollowButton from '@/components/follow-button';

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const profileUserId = params.userId;

  const profileUser = await getUserProfile(profileUserId);

  if (!profileUser) {
    notFound();
  }
  
  const isCurrentUserProfile = currentUserId === profileUser.id;

  const initialSnippets = await getSnippetsAction({ page: 0, limit: 4, authorId: profileUser.id });
  const initialDocuments = await getDocumentsByAuthorAction({ page: 0, limit: 4, authorId: profileUser.id });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardHeader className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={profileUser.image ?? undefined} alt={profileUser.name ?? ''} />
              <AvatarFallback className="text-4xl">{profileUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <CardTitle className="font-headline text-3xl">{profileUser.name}</CardTitle>
              <p className="text-muted-foreground">@{profileUser.email?.split('@')[0]}</p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
             {isCurrentUserProfile ? (
                 <>
                    <Button variant="outline" asChild className="flex-1 sm:flex-auto">
                        <Link href="/settings"><Edit /> Edit Profile</Link>
                    </Button>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="flex-1 sm-flex-auto">
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
                </>
             ) : (
                <FollowButton authorId={profileUser.id} isFollowed={profileUser.isFollowing} isLoggedIn={!!currentUserId} />
             )}
          </div>
        </CardHeader>
        <CardContent>
            <div className="mb-6 text-sm text-muted-foreground">
                <p>{profileUser.bio ?? 'A passionate developer and writer.'}</p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 border-t border-b py-3 mb-6">
                <div className="text-center">
                    <p className="font-bold text-xl">{profileUser._count.snippets}</p>
                    <p className="text-xs text-muted-foreground">Snippets</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-xl">{profileUser._count.documents}</p>
                    <p className="text-xs text-muted-foreground">Docs</p>
                </div>

                <UserListDialog title="Followers" users={profileUser.followers.map(f => f.follower)} trigger={
                     <div className="text-center cursor-pointer">
                        <p className="font-bold text-xl">{profileUser._count.followers}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                } />
                
                <UserListDialog title="Following" users={profileUser.following.map(f => f.following)} trigger={
                    <div className="text-center cursor-pointer">
                        <p className="font-bold text-xl">{profileUser._count.following}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                } />

            </div>
            
            <ProfileTabs 
                initialSnippets={initialSnippets} 
                initialDocuments={initialDocuments} 
                authorId={profileUser.id}
                isCurrentUserProfile={isCurrentUserProfile}
            />

        </CardContent>
      </Card>
    </div>
  );
}
