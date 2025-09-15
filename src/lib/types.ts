

import type { User as PrismaUser, Snippet as PrismaSnippet } from '@prisma/client';

export type User = PrismaUser;

export type Snippet = Omit<PrismaSnippet, 'authorId'> & {
  author: PrismaUser;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number; // Still a placeholder
  isLiked: boolean;
  isBookmarked: boolean;
};


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
