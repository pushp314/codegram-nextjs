
'use server';

import {
  generateCodeSnippetFromDescription,
  type GenerateCodeSnippetInput,
} from '@/ai/flows/generate-code-snippet-from-description';
import { convertCode, type ConvertCodeInput } from '@/ai/flows/convert-code';
import { auth } from '@/lib/auth';
import type { Snippet, Document } from '@/lib/types';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}


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

export async function createSnippetAction(data: { title: string; description: string; code: string; language: string; }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a snippet.');
  }
  
  await prisma.snippet.create({
    data: {
      title: data.title,
      description: data.description,
      code: data.code,
      language: data.language,
      authorId: session.user.id,
    }
  });

  revalidatePath('/');
}

export async function createDocAction(data: { title: string; description: string; content: string; tags: string; }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to create a document.');
    }

    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const slug = slugify(data.title);

    await prisma.document.create({
        data: {
            title: data.title,
            slug: slug,
            description: data.description,
            content: data.content,
            tags: tagsArray,
            authorId: session.user.id,
        }
    });

    revalidatePath('/docs');
    return { slug };
}

export async function toggleLikeAction(snippetId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to like a snippet.');
    }

    const like = await prisma.like.findUnique({
        where: {
            userId_snippetId: {
                userId,
                snippetId,
            }
        }
    });

    if (like) {
        await prisma.like.delete({
            where: {
                userId_snippetId: {
                    userId,
                    snippetId,
                }
            }
        });
    } else {
        await prisma.like.create({
            data: {
                userId,
                snippetId,
            }
        });
    }
    revalidatePath('/');
    revalidatePath(`/explore`);
}

export async function toggleSaveAction(snippetId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to save a snippet.');
    }

    const save = await prisma.save.findUnique({
        where: {
            userId_snippetId: {
                userId,
                snippetId,
            }
        }
    });

    if (save) {
        await prisma.save.delete({
            where: {
                userId_snippetId: {
                    userId,
                    snippetId,
                }
            }
        });
    } else {
        await prisma.save.create({
            data: {
                userId,
                snippetId,
            }
        });
    }
    revalidatePath('/');
    revalidatePath(`/explore`);
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


export async function getDocumentsAction(): Promise<Document[]> {
    const documents = await prisma.document.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: true
        }
    });
    return documents;
}

export async function getDocumentBySlugAction(slug: string): Promise<Document | null> {
    const document = await prisma.document.findUnique({
        where: {
            slug,
        },
        include: {
            author: true,
        },
    });
    return document;
}
