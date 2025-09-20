
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
import { DocCard } from '@/components/doc-card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


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

function DocSkeleton() {
    return <Skeleton className="h-64 w-full" />;
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

function PaginatedList<T extends Snippet | Document>({ 
    fetcher, 
    userId,
    ItemComponent,
    SkeletonComponent,
    EmptyStateComponent,
    itemsPerPage,
    gridClass,
    initialItems,
    initialHasMore
}: {
    fetcher: (params: { page: number; limit: number; userId: string; authorId: string; }) => Promise<{ snippets?: Snippet[], documents?: Document[], hasMore: boolean } | { error: string }>,
    userId: string,
    ItemComponent: React.ComponentType<any>,
    SkeletonComponent: React.ComponentType,
    EmptyStateComponent: React.ReactNode,
    itemsPerPage: number,
    gridClass: string,
    initialItems?: T[],
    initialHasMore?: boolean
}) {
    const [items, setItems] = useState<T[]>(initialItems || []);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(!initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore ?? true);
    const { toast } = useToast();
    const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px', triggerOnce: false });

    const loadMore = useCallback(async (currentPage: number) => {
        if (!hasMore || loading) return;
        setLoading(true);

        const result = await fetcher({ page: currentPage, limit: itemsPerPage, userId: userId, authorId: userId });

        if ('error' in result) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: result.error });
            setHasMore(false);
        } else {
            const newItems = (result.snippets || result.documents || []) as T[];
            setItems(prev => [...prev, ...newItems]);
            setPage(currentPage);
            setHasMore(result.hasMore);
        }
        setLoading(false);
    }, [hasMore, loading, fetcher, itemsPerPage, userId, toast]);

    useEffect(() => {
        if (!initialItems) {
            loadMore(0);
        }
    }, [initialItems, loadMore]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore(page + 1);
        }
    }, [inView, hasMore, loading, page, loadMore]);
    
    if (items.length === 0 && !loading) {
        return <>{EmptyStateComponent}</>;
    }

    return (
        <>
            <div className={gridClass}>
                {items.map((item) => (
                    <ItemComponent key={item.id} {...{ [ItemComponent === SnippetCard ? 'snippet' : 'doc']: item }} />
                ))}
                {loading && Array.from({ length: itemsPerPage / 2 }).map((_, i) => <SkeletonComponent key={`skel-${i}`} />)}
            </div>
            <div ref={ref} className="h-10" />
        </>
    );
}

export default function ProfileTabs({ initialSnippets, initialDocuments, authorId, isCurrentUserProfile }: { initialSnippets?: { snippets: Snippet[], hasMore: boolean }, initialDocuments?: { documents: Document[], hasMore: boolean }, authorId: string, isCurrentUserProfile: boolean }) {
    
    const renderDocCard = (props: {doc: Document}) => (
        <DocCard 
            key={props.doc.id}
            title={props.doc.title}
            tags={props.doc.tags}
            image={`https://picsum.photos/seed/doc-${props.doc.id}/600/400`}
            imageHint="tech background"
            author={props.doc.author.name}
            authorImage={props.doc.author.image}
            authorImageHint="developer portrait"
            link={`/docs/${props.doc.slug}`}
        />
    )

    return (
        <Tabs defaultValue="snippets" className="w-full">
            <TabsList className={cn("grid w-full", isCurrentUserProfile ? "grid-cols-3" : "grid-cols-2")}>
                <TabsTrigger value="snippets"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                {isCurrentUserProfile && <TabsTrigger value="saved"><Bookmark className="mr-2 h-4 w-4" />Saved</TabsTrigger>}
            </TabsList>
            <TabsContent value="snippets" className="mt-6">
                <PaginatedList
                    fetcher={getSnippetsAction as any}
                    userId={authorId}
                    ItemComponent={SnippetCard}
                    SkeletonComponent={SnippetSkeleton}
                    EmptyStateComponent={<EmptyState icon={Code} title="No Snippets Yet" description="This user hasn't posted any snippets yet." />}
                    itemsPerPage={SNIPPETS_PER_PAGE}
                    gridClass="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initialItems={initialSnippets?.snippets}
                    initialHasMore={initialSnippets?.hasMore}
                />
            </TabsContent>
            <TabsContent value="docs" className="mt-6">
                <PaginatedList
                    fetcher={getDocumentsByAuthorAction as any}
                    userId={authorId}
                    ItemComponent={renderDocCard as any}
                    SkeletonComponent={DocSkeleton}
                    EmptyStateComponent={<EmptyState icon={FileText} title="No Docs Yet" description="This user hasn't posted any docs yet." />}
                    itemsPerPage={DOCS_PER_PAGE}
                    gridClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initialItems={initialDocuments?.documents}
                    initialHasMore={initialDocuments?.hasMore}
                />
            </TabsContent>
            {isCurrentUserProfile && (
                <TabsContent value="saved" className="mt-6">
                    <Tabs defaultValue="snippets-saved" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="snippets-saved"><Code className="mr-2 h-4 w-4" />Snippets</TabsTrigger>
                             <TabsTrigger value="docs-saved"><FileText className="mr-2 h-4 w-4" />Docs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="snippets-saved" className="mt-6">
                             <PaginatedList
                                fetcher={getSavedSnippetsAction as any}
                                userId={authorId}
                                ItemComponent={SnippetCard}
                                SkeletonComponent={SnippetSkeleton}
                                EmptyStateComponent={<EmptyState icon={Bookmark} title="No Saved Snippets" description="You haven't saved any snippets yet." />}
                                itemsPerPage={SNIPPETS_PER_PAGE}
                                gridClass="grid grid-cols-1 md:grid-cols-2 gap-6"
                            />
                        </TabsContent>
                        <TabsContent value="docs-saved" className="mt-6">
                              <PaginatedList
                                fetcher={getSavedDocumentsAction as any}
                                userId={authorId}
                                ItemComponent={renderDocCard as any}
                                SkeletonComponent={DocSkeleton}
                                EmptyStateComponent={<EmptyState icon={Bookmark} title="No Saved Docs" description="You haven't saved any documents yet." />}
                                itemsPerPage={DOCS_PER_PAGE}
                                gridClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            )}
        </Tabs>
    )
}
