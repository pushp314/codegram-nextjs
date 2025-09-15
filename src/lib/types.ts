

import type { User as PrismaUser, Snippet as PrismaSnippet, Document as PrismaDocument, Bug as PrismaBug, DocumentComment as PrismaDocumentComment, SnippetComment as PrismaSnippetComment, Notification as PrismaNotification, NotificationType, Component as PrismaComponent } from '@prisma/client';

// This is the user type returned from Prisma, but without sensitive fields
export type User = Omit<PrismaUser, 'emailVerified'>;
export type UserWithFollows = User & {
    followers: { follower: User }[];
    following: { following: User }[];
    _count: {
        snippets: number;
        documents: number;
        followers: number;
        following: number;
    }
}

export type SnippetComment = PrismaSnippetComment & { author: User };

export type Snippet = Omit<PrismaSnippet, 'authorId'> & {
  author: User;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number; // Still a placeholder
  isLiked: boolean;
  isBookmarked: boolean;
  comments: SnippetComment[];
};

export type FullDocument = Document & {
    isFollowed: boolean;
};

export type Document = Omit<PrismaDocument, 'authorId'> & {
    author: User;
    likes_count: number;
    saves_count: number;
    comments_count: number;
    isLiked: boolean;
    isSaved: boolean;
    comments: (DocumentComment & { author: User })[];
}

export type DocumentComment = PrismaDocumentComment;

export type Bug = Omit<PrismaBug, 'authorId'> & {
    author: User;
    upvotes_count: number;
    isUpvoted: boolean;
    comments_count: number;
}

export type Notification = Omit<PrismaNotification, 'recipientId' | 'originatorId'> & {
  recipient: User;
  originator: User;
}

export type { NotificationType };


export type Component = Omit<PrismaComponent, 'authorId'> & {
  author: User;
  likes_count: number; // Placeholder
  saves_count: number; // Placeholder
}
