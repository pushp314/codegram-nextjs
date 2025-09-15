
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnippetCard from '@/components/snippet-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, FileText, Bookmark } from 'lucide-react';
import type { Snippet } from '@/lib/types';
import { getSnippetsAction, getSavedSnippetsAction } from '../actions';
import { useEffect, useState, useCallback, use } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

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

function SnippetList({ fetcher, authorId }: { fetcher: (params: { page: number; limit: number; userId: string; }) => Promise<{ snippets: Snippet[], hasMore: boolean }>, authorId: string }) {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });

    const loadMoreSnippets = useCallback(async (currentPage: number) => {
        if (!hasMore || loading) return;
        setLoading(true);
        const { snippets: newSnippets, hasMore: newHasMore } = await fetcher({ page: currentPage, limit: SNIPPETS_PER_PAGE, userId: authorId });
        setSnippets(prev => [...prev, ...newSnippets]);
        setPage(currentPage);
        setHasMore(newHasMore);
        setLoading(false);
    }, [hasMore, loading, fetcher, authorId]);
    
    useEffect(() => {
        setLoading(true);
        fetcher({ page: 0, limit: SNIPPETS_PER_PAGE, userId: authorId }).then(({ snippets, hasMore }) => {
            setSnippets(snippets);
            setHasMore(hasMore);
            setPage(0);
            setLoading(false);
        });
    }, [fetcher, authorId]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMoreSnippets(page + 1);
        }
    }, [inView, hasMore, loading, page, loadMoreSnippets]);

    return (
        <>
            {snippets.length === 0 && !loading && (
                <EmptyState icon={Bookmark} title="No Saved Items" description="You haven't saved any items yet." />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {snippets.map((snippet) => (
                    <SnippetCard key={`saved-${snippet.id}`} snippet={snippet} />
                ))}
                {loading && (
                    <>
                        <SnippetSkeleton />
                        <SnippetSkeleton />
                    </>
                )}
            </div>
            <div ref={ref} className="h-10" />
        </>
    );
}


export default function ProfileTabs({ initialSnippets, authorId }: { initialSnippets: { snippets: Snippet[], hasMore: boolean }, authorId: string }) {
    const { data: session } = useSession();
    const [userSnippets, setUserSnippets] = useState<Snippet[]>(initialSnippets.snippets);
    const [userSnippetsPage, setUserSnippetsPage] = useState(0);
    const [userSnippetsLoading, setUserSnippetsLoading] = useState(false);
    const [userSnippetsHasMore, setUserSnippetsHasMore] = useState(initialSnippets.hasMore);

    const { ref: userSnippetsRef, inView: userSnippetsInView } = useInView({ threshold: 0, rootMargin: '200px' });

    const loadMoreUserSnippets = useCallback(async () => {
        if (!userSnippetsHasMore || userSnippetsLoading) return;
        setUserSnippetsLoading(true);

        const nextPage = userSnippetsPage + 1;
        const { snippets: newSnippets, hasMore: newHasMore } = await getSnippetsAction({ page: nextPage, limit: SNIPPETS_PER_PAGE, authorId });
        
        setUserSnippets(prev => [...prev, ...newSnippets]);
        setUserSnippetsPage(nextPage);
        setUserSnippetsHasMore(newHasMore);
        setUserSnippetsLoading(false);
    }, [userSnippetsHasMore, userSnippetsLoading, userSnippetsPage, authorId]);
    
    useEffect(() => {
        if (userSnippetsInView) {
            loadMoreUserSnippets();
        }
    }, [userSnippetsInView, loadMoreUserSnippets]);

    const isCurrentUserProfile = session?.user?.id === authorId;

    const fetchSavedSnippets = useCallback(async (params: { page: number, limit: number, userId: string }) => {
        return getSavedSnippetsAction(params);
    }, []);

    return (
        <Tabs defaultValue="snippets" className="w-full">
            <TabsList className={cn("grid w-full", isCurrentUserProfile ? "grid-cols-3" : "grid-cols-2")}>
                <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                {isCurrentUserProfile && <TabsTrigger value="saved"><Bookmark className="mr-2 h-4 w-4" />Saved</TabsTrigger>}
            </TabsList>
            <TabsContent value="snippets" className="mt-6">
                {userSnippets.length === 0 && !userSnippetsLoading && (
                    <EmptyState 
                        icon={Code} 
                        title="No Snippets Yet" 
                        description="You haven't posted any snippets yet." 
                    />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userSnippets.map((snippet) => (
                        <SnippetCard key={`user-${snippet.id}`} snippet={snippet} />
                    ))}
                    {userSnippetsLoading && (
                        <>
                            <SnippetSkeleton />
                            <SnippetSkeleton />
                        </>
                    )}
                </div>
                 <div ref={userSnippetsRef} className="h-10" />
            </TabsContent>
            <TabsContent value="docs" className="mt-6">
                <EmptyState 
                    icon={FileText}
                    title="No Docs Yet"
                    description="You haven't published any documentation yet."
                />
            </TabsContent>
            {isCurrentUserProfile && (
                <TabsContent value="saved" className="mt-6">
                    <SnippetList fetcher={fetchSavedSnippets} authorId={authorId} />
                </TabsContent>
            )}
        </Tabs>
    )
}
