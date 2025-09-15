
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Settings, Plus, Code, FileText, Bookmark, Bug } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnippetCard from '@/components/snippet-card';
import { mockSnippets } from '@/lib/mock-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;

  // Use the logged-in user's name for the sample snippets for a personal touch
  const userSnippets = mockSnippets.map((snippet, index) => ({
      ...snippet,
      id: (index + 1).toString(),
      author: {
        ...snippet.author,
        full_name: user.name ?? snippet.author.full_name,
        avatar_url: user.image ?? snippet.author.avatar_url,
        username: user.email?.split('@')[0] ?? snippet.author.username,
      }
  }));

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
                    <p className="font-bold text-xl">12</p>
                    <p className="text-xs text-muted-foreground">Snippets</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-xl">1.2k</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-xl">345</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                </div>
            </div>

            <Tabs defaultValue="snippets" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                    <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                    <TabsTrigger value="saved"><Bookmark className="mr-2 h-4 w-4" />Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="snippets" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userSnippets.map((snippet) => (
                            <SnippetCard key={snippet.id} snippet={snippet} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="docs">
                     <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed">
                        <CardHeader>
                        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>No Docs Yet</CardTitle>
                        <CardDescription className="text-muted-foreground">You haven't published any documentation yet.</CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="saved">
                     <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed">
                        <CardHeader>
                        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                            <Bookmark className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>No Saved Items</CardTitle>
                        <CardDescription className="text-muted-foreground">You haven't saved any snippets or docs yet.</CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
