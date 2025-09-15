
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnippetCard from '@/components/snippet-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, FileText, Bookmark } from 'lucide-react';
import type { Snippet, Document } from '@/lib/types';
import { getSnippetsAction, getSavedSnippetsAction, getDocumentsByAuthorAction, getSavedDocumentsAction } from '../actions';
import { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { DocCard } from '@/components/doc-card';
import { cn } from '@/lib/utils';


const DOCS_PER_PAGE = 6;
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

    const loadMore = useCallback(async (currentPage: number) => {
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
            loadMore(page + 1);
        }
    }, [inView, hasMore, loading, page, loadMore]);

    return (
        <>
            {snippets.length === 0 && !loading && (
                <EmptyState icon={Bookmark} title="No Saved Snippets" description="You haven't saved any snippets yet." />
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

function DocList({ fetcher, authorId }: { fetcher: (params: { page: number; limit: number; authorId: string; userId: string; }) => Promise<{ documents: Document[], hasMore: boolean }>, authorId: string }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });

    const loadMore = useCallback(async (currentPage: number) => {
        if (!hasMore || loading) return;
        setLoading(true);
        const { documents: newDocs, hasMore: newHasMore } = await fetcher({ page: currentPage, limit: DOCS_PER_PAGE, authorId, userId: authorId });
        setDocuments(prev => [...prev, ...newDocs]);
        setPage(currentPage);
        setHasMore(newHasMore);
        setLoading(false);
    }, [hasMore, loading, fetcher, authorId]);

    useEffect(() => {
        setLoading(true);
        fetcher({ page: 0, limit: DOCS_PER_PAGE, authorId, userId: authorId }).then(({ documents, hasMore }) => {
            setDocuments(documents);
            setHasMore(hasMore);
            setPage(0);
            setLoading(false);
        });
    }, [fetcher, authorId]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore(page + 1);
        }
    }, [inView, hasMore, loading, page, loadMore]);

    return (
        <>
            {documents.length === 0 && !loading && (
                <EmptyState icon={FileText} title="No Saved Docs" description="You haven't saved any documents yet." />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />) }
            </div>
            <div ref={ref} className="h-10" />
        </>
    );
}

export default function ProfileTabs({ initialSnippets, initialDocuments, authorId }: { initialSnippets: { snippets: Snippet[], hasMore: boolean }, initialDocuments: { documents: Document[], hasMore: boolean }, authorId: string }) {
    const { data: session } = useSession();
    const [userSnippets, setUserSnippets] = useState<Snippet[]>(initialSnippets.snippets);
    const [userSnippetsPage, setUserSnippetsPage] = useState(0);
    const [userSnippetsLoading, setUserSnippetsLoading] = useState(false);
    const [userSnippetsHasMore, setUserSnippetsHasMore] = useState(initialSnippets.hasMore);
    const { ref: userSnippetsRef, inView: userSnippetsInView } = useInView({ threshold: 0, rootMargin: '200px' });

    const [userDocs, setUserDocs] = useState<Document[]>(initialDocuments.documents);
    const [userDocsPage, setUserDocsPage] = useState(0);
    const [userDocsLoading, setUserDocsLoading] = useState(false);
    const [userDocsHasMore, setUserDocsHasMore] = useState(initialDocuments.hasMore);
    const { ref: userDocsRef, inView: userDocsInView } = useInView({ threshold: 0, rootMargin: '200px' });
    
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

     const loadMoreUserDocs = useCallback(async () => {
        if (!userDocsHasMore || userDocsLoading) return;
        setUserDocsLoading(true);
        const nextPage = userDocsPage + 1;
        const { documents: newDocs, hasMore: newHasMore } = await getDocumentsByAuthorAction({ page: nextPage, limit: DOCS_PER_PAGE, authorId });
        setUserDocs(prev => [...prev, ...newDocs]);
        setUserDocsPage(nextPage);
        setUserDocsHasMore(newHasMore);
        setUserDocsLoading(false);
    }, [userDocsHasMore, userDocsLoading, userDocsPage, authorId]);

    useEffect(() => {
        if (userDocsInView) {
            loadMoreUserDocs();
        }
    }, [userDocsInView, loadMoreUserDocs]);


    const isCurrentUserProfile = session?.user?.id === authorId;

    const fetchSavedSnippets = useCallback(async (params: { page: number, limit: number, userId: string }) => {
        return getSavedSnippetsAction(params);
    }, []);

    const fetchSavedDocs = useCallback(async (params: { page: number, limit: number, userId: string }) => {
        return getSavedDocumentsAction(params);
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
                 {userDocs.length === 0 && !userDocsLoading && (
                    <EmptyState 
                        icon={FileText} 
                        title="No Docs Yet" 
                        description="You haven't posted any docs yet." 
                    />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userDocs.map((doc) => (
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
                    {userDocsLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />) }
                </div>
                 <div ref={userDocsRef} className="h-10" />
            </TabsContent>
            {isCurrentUserProfile && (
                <TabsContent value="saved" className="mt-6">
                    <Tabs defaultValue="snippets-saved" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="snippets-saved"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                             <TabsTrigger value="docs-saved"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="snippets-saved" className="mt-6">
                            <SnippetList fetcher={fetchSavedSnippets} authorId={authorId} />
                        </TabsContent>
                        <TabsContent value="docs-saved" className="mt-6">
                             <DocList fetcher={fetchSavedDocs as any} authorId={authorId} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            )}
        </Tabs>
    )
}
