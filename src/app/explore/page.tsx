
"use client";
import React, { useEffect, useState } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { getSnippetsAction } from "../actions";
import type { Snippet } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import SnippetPreviewCard from "@/components/snippet-preview-card";

export default function ExplorePage() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSnippets = async () => {
            setLoading(true);
            const { snippets: fetchedSnippets } = await getSnippetsAction({ page: 0, limit: 12 });
            setSnippets(fetchedSnippets);
            setLoading(false);
        };
        loadSnippets();
    }, []);

    const cards = snippets.map((snippet, index) => ({
        id: snippet.id,
        className: (index % 5 === 0 || index % 5 === 3) ? "md:col-span-2" : "col-span-1",
        thumbnail: <SnippetPreviewCard snippet={snippet} />,
        snippet: snippet,
    }));

    const skeletonCards = Array(12).fill(0).map((_, index) => ({
        id: `skeleton-${index}`,
        className: (index % 5 === 0 || index % 5 === 3) ? "md:col-span-2" : "col-span-1",
        thumbnail: <Skeleton className="w-full h-full min-h-[300px]" />,
        snippet: {} as Snippet,
    }));

    return (
        <div className="w-full">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl mb-4">Explore Snippets</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover a world of code. Click on any snippet to see the magic happen.
                </p>
            </div>
            {loading ? <LayoutGrid cards={skeletonCards} /> : <LayoutGrid cards={cards} />}
        </div>
    );
}
