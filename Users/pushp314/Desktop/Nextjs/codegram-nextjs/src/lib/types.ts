
import type { User as PrismaUser, Snippet as PrismaSnippet, Document as PrismaDocument, Bug as PrismaBug, DocumentComment as PrismaDocumentComment } from '@prisma/client';

// This is the user type returned from Prisma, but without sensitive fields
export type User = Omit<PrismaUser, 'emailVerified'>;

export type Snippet = Omit<PrismaSnippet, 'authorId'> & {
  author: User;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number; // Still a placeholder
  isLiked: boolean;
  isBookmarked: boolean;
};

export type Document = Omit<PrismaDocument, 'authorId'> & {
    author: User;
    likes_count: number;
    saves_count: number;
    comments_count: number;
    isLiked: boolean;
    isSaved: boolean;
    comments: DocumentComment[];
}

export type DocumentComment = PrismaDocumentComment & {
    author: User;
};

export type Bug = Omit<PrismaBug, 'authorId'> & {
    author: User;
    upvotes_count: number;
    isUpvoted: boolean;
    comments_count: number;
}


export interface Component {
  slug: string;
  name: string;
  description: string;
  image: string;
  imageHint: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    avatarHint: string;
  };
  stats: {
    likes: string;
    saves: string;
  };
  code: string;
}
