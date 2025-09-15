
'use server';

import { Bookmark, Code, FileText } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSavedSnippetsAction, getSavedDocumentsAction } from '../actions';
import SnippetCard from '@/components/snippet-card';
import { DocCard } from '@/components/doc-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Snippet, Document } from '@/lib/types';


async function SavedSnippets({userId}: {userId: string}) {
  const { snippets } = await getSavedSnippetsAction({ page: 0, limit: 100, userId: userId });
  return (
    <>
      {snippets.length === 0 ? (
        <EmptyState type="snippets" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {snippets.map(snippet => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </>
  )
}

async function SavedDocuments({userId}: {userId: string}) {
    const { documents } = await getSavedDocumentsAction({ page: 0, limit: 100, userId: userId });
    return (
         <>
            {documents.length === 0 ? (
                <EmptyState type="docs" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {documents.map((doc, index) => (
                    <DocCard
                        key={doc.id}
                        title={doc.title}
                        tags={doc.tags}
                        image={`https://picsum.photos/seed/doc-${doc.id}/600/400`}
                        imageHint="tech background"
                        author={doc.author.name}
                        authorImage={doc.author.image}
                        authorImageHint="developer portrait"
                        link={`/docs/${doc.slug}`}
                    />
                ))}
                </div>
            )}
        </>
    )
}

function EmptyState({ type }: { type: 'snippets' | 'docs' }) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed mt-6">
          <CardHeader>
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No Saved {type === 'snippets' ? 'Snippets' : 'Documents'}</CardTitle>
            <CardDescription className="text-muted-foreground">You haven't saved any {type} yet. Start exploring to build your collection.</CardDescription>
          </CardHeader>
        </Card>
    )
}

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Bookmark className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">Saved Items</h1>
      </div>
      
       <Tabs defaultValue="snippets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
            </TabsList>
            <TabsContent value="snippets">
                <SavedSnippets userId={session.user.id} />
            </TabsContent>
            <TabsContent value="docs">
                <SavedDocuments userId={session.user.id} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
