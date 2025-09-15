

'use server';

import { DocCard } from '@/components/doc-card';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import { getDocumentsAction } from '../actions';
import type { Document } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default async function DocsPage() {
  const documents = await getDocumentsAction();

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
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for articles, tutorials, and more..." className="pl-10 h-12 text-base" />
          </div>
      </div>
      
      {documents.length > 0 ? (
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
        <div className="text-center py-16 border border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                There are no documents to display. Why not write the first one?
            </p>
            <Button asChild className="mt-6">
                <Link href="/docs/create">Create Document</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
