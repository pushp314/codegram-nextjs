
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnippetCard from '@/components/snippet-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, FileText, Bookmark } from 'lucide-react';
import type { Snippet } from '@/lib/types';
import { getSnippetsAction } from '../actions';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

const SNIPPETS_PER_PAGE = 4;

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

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string}) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-96 border-dashed">
            <CardHeader>
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
        </Card>
    );
}

export default function ProfileTabs({ initialSnippets, authorId }: { initialSnippets: { snippets: Snippet[], hasMore: boolean }, authorId: string }) {
    const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets.snippets);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialSnippets.hasMore);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
    });

    const loadMoreSnippets = async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        const nextPage = page + 1;
        const { snippets: newSnippets, hasMore: newHasMore } = await getSnippetsAction({ page: nextPage, limit: SNIPPETS_PER_PAGE, authorId });
        
        setSnippets(prev => [...prev, ...newSnippets]);
        setPage(nextPage);
        setHasMore(newHasMore);
        setLoading(false);
    };

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMoreSnippets();
        }
    }, [inView, hasMore, loading]);


    return (
        <Tabs defaultValue="snippets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                <TabsTrigger value="saved"><Bookmark className="mr-2 h-4 w-4" />Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="snippets" className="mt-6">
                {snippets.length === 0 && !loading && (
                    <EmptyState 
                        icon={Code} 
                        title="No Snippets Yet" 
                        description="You haven't posted any snippets yet." 
                    />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {snippets.map((snippet) => (
                        <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                    {loading && (
                        <>
                            <SnippetSkeleton />
                            <SnippetSkeleton />
                        </>
                    )}
                </div>
                 <div ref={ref} className="h-10" />
            </TabsContent>
            <TabsContent value="docs">
                <EmptyState 
                    icon={FileText}
                    title="No Docs Yet"
                    description="You haven't published any documentation yet."
                />
            </TabsContent>
            <TabsContent value="saved">
                 <EmptyState 
                    icon={Bookmark}
                    title="No Saved Items"
                    description="You haven't saved any snippets or docs yet."
                />
            </TabsContent>
        </Tabs>
    )
}
