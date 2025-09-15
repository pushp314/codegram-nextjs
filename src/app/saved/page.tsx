
'use server';

import { Bookmark } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSavedSnippetsAction } from '../actions';
import SnippetCard from '@/components/snippet-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { snippets } = await getSavedSnippetsAction({ page: 0, limit: 20, userId: session.user.id });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Bookmark className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">Saved Items</h1>
      </div>

      {snippets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed">
          <CardHeader>
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No Saved Items</CardTitle>
            <CardDescription className="text-muted-foreground">You haven't saved any snippets or docs yet. Start exploring to build your collection.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {snippets.map(snippet => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}
