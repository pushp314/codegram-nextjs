

'use server';

import { DocCard } from '@/components/doc-card';
import { FileText } from 'lucide-react';
import { getDocumentsAction } from '../actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SearchBar from './search-bar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DocsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const documents = await getDocumentsAction({ query });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
                <h1 className="font-headline text-3xl">Docs</h1>
                <p className="text-muted-foreground">Browse articles, tutorials, and more.</p>
            </div>
        </div>
        <Button asChild>
            <Link href="/docs/create">Create Document</Link>
        </Button>
      </div>

      <div className="mb-12 max-w-2xl">
          <SearchBar placeholder="Search for articles, tutorials, and more..." />
      </div>
      
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc, index) => (
            <DocCard 
              key={doc.id}
              title={doc.title}
              tags={doc.tags}
              image={`https://picsum.photos/seed/db-doc${index}/600/400`}
              imageHint="tech background"
              author={doc.author.name}
              authorImage={doc.author.image}
              authorImageHint="developer portrait"
              link={`/docs/${doc.slug}`}
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed col-span-full">
            <CardHeader>
                <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>No Documents Found</CardTitle>
                <CardDescription className="text-muted-foreground">
                    No documents matched your search. Be the first to create one!
                </CardDescription>
                <Button asChild className="mt-4">
                    <Link href="/docs/create">Create Document</Link>
                </Button>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
