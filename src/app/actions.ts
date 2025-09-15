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

export async function getSnippetsAction({ page = 0, limit = 3 }: { page: number; limit: number }): Promise<{ snippets: Snippet[], hasMore: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  
  const snippets = await prisma.snippet.findMany({
    skip: page * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: true,
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });

  const totalSnippets = await prisma.snippet.count();
  const hasMore = (page * limit) + limit < totalSnippets;

  const snippetsWithLikes = snippets.map(snippet => {
    // This is a placeholder. In a real app, you'd query the Like model.
    const typedSnippet: Snippet = {
        ...snippet,
        likes_count: snippet._count.likes,
        comments_count: snippet._count.comments,
        isLiked: false, // You would check if userId has liked this snippet
        isBookmarked: false, // You would check if userId has saved this snippet
        views_count: 1000 // Placeholder
    };
    return typedSnippet;
  });


  return { snippets: snippetsWithLikes, hasMore };
}
