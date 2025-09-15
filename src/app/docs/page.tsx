

'use server';

import { DocCard } from '@/components/doc-card';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import { getDocumentsAction } from '../actions';
import type { Document } from '@/lib/types';


async function getAndMergeDocs(): Promise<Omit<React.ComponentProps<typeof DocCard>, 'key'>[]> {
  const documents: Document[] = await getDocumentsAction();
  
  const placeholderDocs = [
    {
      title: 'Advanced CSS Grid Techniques',
      slug: 'advanced-css-grid-techniques',
      description: 'Explore powerful features of CSS Grid to create complex, responsive layouts with maintainable code.',
      tags: ['CSS', 'Layout', 'Web Design'],
      image: 'https://picsum.photos/seed/doc2/600/400',
      imageHint: 'geometric pattern',
      author: { name: 'Ben Carter', image: 'https://picsum.photos/seed/ben/40/40' },
      authorImageHint: 'man portrait',
    },
    {
      title: 'Building a REST API with Node.js',
      slug: 'building-a-rest-api-with-nodejs',
      description: 'Learn to build a robust REST API from scratch using Node.js, Express, and best practices.',
      tags: ['Node.js', 'API', 'Backend'],
      image: 'https://picsum.photos/seed/doc3/600/400',
      imageHint: 'server racks',
      author: { name: 'Grace Hopper', image: 'https://picsum.photos/seed/grace/40/40' },
      authorImageHint: 'woman developer',
    },
  ];

  const dbDocs = documents.map((doc, index) => ({
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    tags: doc.tags,
    image: `https://picsum.photos/seed/db-doc${index}/600/400`,
    imageHint: 'tech background',
    author: { name: doc.author.name || 'Unknown', image: doc.author.image || `https://picsum.photos/seed/db-author${index}/40/40` },
    authorImageHint: 'developer portrait',
  }));

  const combinedDocs = [...dbDocs, ...placeholderDocs];

  const uniqueDocs = Array.from(new Map(combinedDocs.map(doc => [doc.slug, doc])).values());

  return uniqueDocs.map(doc => ({
    title: doc.title,
    tags: doc.tags,
    image: doc.image,
    imageHint: doc.imageHint,
    author: doc.author.name,
    authorImage: doc.author.image,
    authorImageHint: doc.authorImageHint,
    link: `/docs/${doc.slug}`
  }));
}


export default async function DocsPage() {
  const allDocs = await getAndMergeDocs();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
       <div className="flex items-center gap-4 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl">Docs</h1>
      </div>

        <div className="mb-12 max-w-2xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for articles, tutorials, and more..." className="pl-10 h-12 text-base" />
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allDocs.map((doc, index) => (
          <DocCard 
            key={index}
            title={doc.title}
            tags={doc.tags}
            image={doc.image}
            imageHint={doc.imageHint}
            author={doc.author}
            authorImage={doc.authorImage}
            authorImageHint={doc.authorImageHint}
            link={doc.link}
          />
        ))}
      </div>
    </div>
  );
}
