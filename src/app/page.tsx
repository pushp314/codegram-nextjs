
'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import SnippetCard from '@/components/snippet-card';
import SnippetGenerator from '@/components/snippet-generator';
import type { Snippet } from '@/lib/types';
import { getSnippetsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const SNIPPETS_PER_PAGE = 3;

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
  )
}

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const loadMoreSnippets = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const nextPage = page + 1;
    const { snippets: newSnippets, hasMore: newHasMore } = await getSnippetsAction({ page: nextPage, limit: SNIPPETS_PER_PAGE });
    
    setSnippets(prev => [...prev, ...newSnippets]);
    setPage(nextPage);
    setHasMore(newHasMore);
    setLoading(false);
  };
  
  const initialLoad = async () => {
    setLoading(true);
    const { snippets: initialSnippets, hasMore: initialHasMore } = await getSnippetsAction({ page: 0, limit: SNIPPETS_PER_PAGE });
    setSnippets(initialSnippets);
    setPage(0);
    setHasMore(initialHasMore);
    setLoading(false);
  }

  useEffect(() => {
    initialLoad();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreSnippets();
    }
  }, [inView, hasMore, loading]);


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2 lg:order-2">
        <div className="space-y-6">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
          
          {loading && (
            <>
              <SnippetSkeleton />
              <SnippetSkeleton />
              <SnippetSkeleton />
            </>
          )}

          <div ref={ref} className="h-10" />

           {!hasMore && snippets.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 text-muted-foreground">
                <span>You've reached the end! 🎉</span>
              </div>
            </div>
          )}
           {!hasMore && snippets.length === 0 && !loading && (
             <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 text-muted-foreground">
                <span>No snippets yet. Be the first to post!</span>
              </div>
            </div>
           )}
        </div>
      </div>
      <aside className="space-y-6 lg:col-span-1 lg:order-1">
        <SnippetGenerator />
      </aside>
    </div>
  );
}
