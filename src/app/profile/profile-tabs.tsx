
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnippetCard from '@/components/snippet-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, FileText, Bookmark } from 'lucide-react';
import type { Snippet } from '@/lib/types';
import { getSnippetsAction, getSavedSnippetsAction } from '../actions';
import { useEffect, useState, useCallback } from 'react';
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
    const [activeTab, setActiveTab] = useState('snippets');

    const [userSnippets, setUserSnippets] = useState<Snippet[]>(initialSnippets.snippets);
    const [userSnippetsPage, setUserSnippetsPage] = useState(0);
    const [userSnippetsLoading, setUserSnippetsLoading] = useState(false);
    const [userSnippetsHasMore, setUserSnippetsHasMore] = useState(initialSnippets.hasMore);

    const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
    const [savedSnippetsPage, setSavedSnippetsPage] = useState(0);
    const [savedSnippetsLoading, setSavedSnippetsLoading] = useState(false);
    const [savedSnippetsHasMore, setSavedSnippetsHasMore] = useState(true);


    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
    });

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
    
    const loadMoreSavedSnippets = useCallback(async () => {
        if (!savedSnippetsHasMore || savedSnippetsLoading) return;
        setSavedSnippetsLoading(true);

        const nextPage = savedSnippetsPage + 1;
        const { snippets: newSnippets, hasMore: newHasMore } = await getSavedSnippetsAction({ page: nextPage, limit: SNIPPETS_PER_PAGE, userId: authorId });
        
        setSavedSnippets(prev => [...prev, ...newSnippets]);
        setSavedSnippetsPage(nextPage);
        setSavedSnippetsHasMore(newHasMore);
        setSavedSnippetsLoading(false);
    }, [savedSnippetsHasMore, savedSnippetsLoading, savedSnippetsPage, authorId]);


    useEffect(() => {
        if (inView) {
            if(activeTab === 'snippets') {
                loadMoreUserSnippets();
            } else if (activeTab === 'saved') {
                loadMoreSavedSnippets();
            }
        }
    }, [inView, activeTab, loadMoreUserSnippets, loadMoreSavedSnippets]);

    useEffect(() => {
        if (activeTab === 'saved' && savedSnippets.length === 0) {
            getSavedSnippetsAction({ page: 0, limit: SNIPPETS_PER_PAGE, userId: authorId })
                .then(({ snippets, hasMore }) => {
                    setSavedSnippets(snippets);
                    setSavedSnippetsHasMore(hasMore);
                    setSavedSnippetsPage(0);
                });
        }
    }, [activeTab, savedSnippets.length, authorId]);


    return (
        <Tabs defaultValue="snippets" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                <TabsTrigger value="saved"><Bookmark className="mr-2 h-4 w-4" />Saved</TabsTrigger>
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
                 <div ref={ref} className="h-10" />
            </TabsContent>
            <TabsContent value="docs">
                <EmptyState 
                    icon={FileText}
                    title="No Docs Yet"
                    description="You haven't published any documentation yet."
                />
            </TabsContent>
            <TabsContent value="saved" className="mt-6">
                 {savedSnippets.length === 0 && !savedSnippetsLoading && (
                    <EmptyState 
                        icon={Bookmark}
                        title="No Saved Items"
                        description="You haven't saved any snippets or docs yet."
                    />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {savedSnippets.map((snippet) => (
                        <SnippetCard key={`saved-${snippet.id}`} snippet={snippet} />
                    ))}
                    {savedSnippetsLoading && (
                        <>
                            <SnippetSkeleton />
                            <SnippetSkeleton />
                        </>
                    )}
                </div>
                 <div ref={ref} className="h-10" />
            </TabsContent>
        </Tabs>
    )
}
