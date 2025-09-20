
'use client';

import { Bookmark, Code, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getSavedSnippetsAction, getSavedDocumentsAction } from '../actions';
import type { Snippet, Document } from '@/lib/types';
import SnippetCard from '@/components/snippet-card';
import { DocCard } from '@/components/doc-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { useState, useCallback, useEffect } from 'react';

const ITEMS_PER_PAGE = 4;

function SnippetSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-xl bg-card/50">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-6 w-[250px] mt-4" />
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[120px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  );
}

function DocSkeleton() {
    return <Skeleton className="h-64 w-full" />;
}

function EmptyState({ type }: { type: 'snippets' | 'docs' }) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed mt-6 col-span-full">
      <CardHeader>
        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
          <Bookmark className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>No Saved {type === 'snippets' ? 'Snippets' : 'Documents'}</CardTitle>
        <CardDescription className="text-muted-foreground">You haven't saved any {type} yet. Start exploring to build your collection.</CardDescription>
      </CardHeader>
    </Card>
  );
}

function PaginatedSavedList({ userId, itemType }: { userId: string; itemType: 'snippets' | 'docs' }) {
    const [items, setItems] = useState<(Snippet | Document)[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const { toast } = useToast();
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });

    const fetcher = itemType === 'snippets' ? getSavedSnippetsAction : getSavedDocumentsAction;

    const loadMore = useCallback(async (currentPage: number) => {
        if (!hasMore || loading) return;
        setLoading(true);

        const result = await fetcher({ page: currentPage, limit: ITEMS_PER_PAGE, userId });
        
        if ('error' in result) {
            toast({ variant: 'destructive', title: `Error fetching saved ${itemType}`, description: result.error });
            setHasMore(false);
        } else {
            const newItems = (result.snippets || result.documents || []);
            setItems(prev => [...prev, ...newItems]);
            setPage(currentPage);
            setHasMore(result.hasMore);
        }
        setLoading(false);
    }, [hasMore, loading, fetcher, userId, toast, itemType]);

    useEffect(() => {
        loadMore(0);
    }, [loadMore]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore(page + 1);
        }
    }, [inView, hasMore, loading, page, loadMore]);

    const renderItems = () => {
        if (itemType === 'snippets') {
            return (items as Snippet[]).map(snippet => <SnippetCard key={snippet.id} snippet={snippet} />);
        }
        return (items as Document[]).map(doc => (
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
        ));
    };

    const gridClass = itemType === 'snippets' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    if (items.length === 0 && !loading) {
        return <EmptyState type={itemType} />;
    }

    return (
        <div className={`grid ${gridClass} gap-6 mt-6`}>
            {renderItems()}
            {loading && Array.from({ length: ITEMS_PER_PAGE / 2 }).map((_, i) => itemType === 'snippets' ? <SnippetSkeleton key={i} /> : <DocSkeleton key={i} />)}
            <div ref={ref} className="h-10 col-span-full" />
        </div>
    );
}

export default function SavedPage() {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    redirect('/login');
  }
  
  if (status === 'loading' || !session?.user?.id) {
    return ( // Or a full page skeleton
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
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
          <PaginatedSavedList userId={session.user.id} itemType="snippets" />
        </TabsContent>
        <TabsContent value="docs">
          <PaginatedSavedList userId={session.user.id} itemType="docs" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
