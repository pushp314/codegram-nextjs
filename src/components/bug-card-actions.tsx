
'use client';

import { ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { toggleBugUpvoteAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type BugCardActionsProps = {
    bugId: string;
    upvotes: number;
    isUpvoted: boolean;
    isLoggedIn: boolean;
};

export default function BugCardActions({ bugId, upvotes, isUpvoted, isLoggedIn }: BugCardActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleUpvote = () => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        startTransition(async () => {
            await toggleBugUpvoteAction(bugId);
        });
    }

    return (
        <div className="flex items-center gap-1">
            <Button 
                variant="ghost" 
                size="sm"
                onClick={handleUpvote}
                disabled={isPending}
                className="flex items-center gap-1 h-auto py-1 px-2 text-muted-foreground hover:text-primary"
            >
                <ThumbsUp className={cn("h-4 w-4", isUpvoted && "fill-primary text-primary")} />
                <span className="text-xs">{upvotes}</span>
            </Button>
        </div>
    );
}
