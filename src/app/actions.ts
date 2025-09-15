'use server';

import {
  generateCodeSnippetFromDescription,
  type GenerateCodeSnippetInput,
} from '@/ai/flows/generate-code-snippet-from-description';
import { convertCode, type ConvertCodeInput } from '@/ai/flows/convert-code';
import { auth } from '@/lib/auth';
import type { Snippet } from '@/lib/types';
import prisma from '@/lib/db';


export async function generateSnippetAction(input: GenerateCodeSnippetInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to generate a snippet.');
  }
  return await generateCodeSnippetFromDescription(input);
}

export async function convertCodeAction(input: ConvertCodeInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to convert code.');
    }
    return await convertCode(input);
}

export async function getSnippetsAction({ page = 0, limit = 3, authorId }: { page: number; limit: number, authorId?: string }): Promise<{ snippets: Snippet[], hasMore: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  
  const whereClause = authorId ? { authorId } : {};

  const snippets = await prisma.snippet.findMany({
    where: whereClause,
    skip: page * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: true,
      _count: {
        select: { likes: true, comments: true, saves: true }
      }
    }
  });

  const totalSnippets = await prisma.snippet.count({ where: whereClause });
  const hasMore = (page * limit) + limit < totalSnippets;

  let userLikes: string[] = [];
  let userSaves: string[] = [];

  if (userId) {
    const likes = await prisma.like.findMany({
      where: { userId: userId, snippetId: { in: snippets.map(s => s.id) } },
      select: { snippetId: true }
    });
    userLikes = likes.map(like => like.snippetId);

    const saves = await prisma.save.findMany({
        where: { userId: userId, snippetId: { in: snippets.map(s => s.id) } },
        select: { snippetId: true }
    });
    userSaves = saves.map(save => save.snippetId);
  }


  const snippetsWithLikes: Snippet[] = snippets.map(snippet => {
    const typedSnippet: Snippet = {
        ...snippet,
        author: snippet.author,
        likes_count: snippet._count.likes,
        comments_count: snippet._count.comments,
        saves_count: snippet._count.saves,
        isLiked: userLikes.includes(snippet.id),
        isBookmarked: userSaves.includes(snippet.id),
        views_count: 1000 // Placeholder
    };
    return typedSnippet;
  });

  return { snippets: snippetsWithLikes, hasMore };
}