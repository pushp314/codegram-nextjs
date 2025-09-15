
import type { User as PrismaUser, Snippet as PrismaSnippet } from '@prisma/client';

export type User = PrismaUser;

export type Snippet = PrismaSnippet & {
  author: PrismaUser;
  _count?: {
    likes: number;
    comments: number;
    saves: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
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
