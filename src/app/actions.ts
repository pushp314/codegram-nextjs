
'use server';

import {
  generateCodeSnippetFromDescription,
  type GenerateCodeSnippetInput,
} from '@/ai/flows/generate-code-snippet-from-description';
import { convertCode, type ConvertCodeInput } from '@/ai/flows/convert-code';
import { auth } from '@/lib/auth';
import type { Snippet, Document, Bug, User, DocumentComment } from '@/lib/types';
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
  revalidatePath('/profile');
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

export async function createBugAction(content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to report a bug.');
    }
    await prisma.bug.create({
        data: {
            content,
            authorId: session.user.id,
        }
    });
    revalidatePath('/bugs');
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
                id: like.id,
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
    revalidatePath(`/profile`);
    revalidatePath('/saved');
    revalidatePath('/community');
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
                id: save.id,
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
    revalidatePath(`/profile`);
    revalidatePath('/saved');
}


export async function toggleFollowAction(authorId: string) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
        throw new Error('You must be logged in to follow a user.');
    }

    if (currentUserId === authorId) {
        throw new Error('You cannot follow yourself.');
    }

    const existingFollow = await prisma.follows.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: authorId,
            },
        },
    });

    if (existingFollow) {
        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: authorId,
                },
            },
        });
    } else {
        await prisma.follows.create({
            data: {
                followerId: currentUserId,
                followingId: authorId,
            },
        });
    }

    revalidatePath(`/profile`);
    revalidatePath(`/docs`);
    revalidatePath('/community');
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


export async function getSavedSnippetsAction({ page = 0, limit = 4, userId }: { page: number; limit: number, userId: string }): Promise<{ snippets: Snippet[], hasMore: boolean }> {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId || currentUserId !== userId) {
    return { snippets: [], hasMore: false };
  }

  const saved = await prisma.save.findMany({
    where: { userId },
    select: { snippetId: true },
    orderBy: { createdAt: 'desc' },
    skip: page * limit,
    take: limit,
  });
  
  const snippetIds = saved.map(s => s.snippetId);

  const snippets = await prisma.snippet.findMany({
    where: {
      id: { in: snippetIds }
    },
    include: {
      author: true,
      _count: {
        select: { likes: true, comments: true, saves: true }
      }
    }
  });
  
  const totalSaved = await prisma.save.count({ where: { userId } });
  const hasMore = (page * limit) + limit < totalSaved;

  const userLikes = await prisma.like.findMany({
    where: { userId, snippetId: { in: snippetIds } },
    select: { snippetId: true }
  });
  const likedSnippetIds = userLikes.map(l => l.snippetId);
  
  const savedSnippetIds = await prisma.save.findMany({
      where: { userId, snippetId: { in: snippetIds } },
      select: { snippetId: true }
  });
  const bookmarkedSnippetIds = savedSnippetIds.map(s => s.snippetId);

  const snippetsWithData: Snippet[] = snippets.map(snippet => ({
    ...snippet,
    author: snippet.author,
    likes_count: snippet._count.likes,
    comments_count: snippet._count.comments,
    saves_count: snippet._count.saves,
    isLiked: likedSnippetIds.includes(snippet.id),
    isBookmarked: bookmarkedSnippetIds.includes(snippet.id),
    views_count: 1000 // Placeholder
  }));
  
  // Sort snippets by the order they were saved
  const sortedSnippets = snippetsWithData.sort((a, b) => snippetIds.indexOf(a.id) - snippetIds.indexOf(b.id));

  return { snippets: sortedSnippets, hasMore };
}


export async function getDocumentsAction(): Promise<Document[]> {
    const documents = await prisma.document.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: true,
            comments: {
                include: { author: true }
            },
        }
    });
    return documents.map(d => ({...d, likes_count: 0, saves_count: 0, comments_count: d.comments.length, isLiked: false, isSaved: false}));
}

export type FullDocument = Document & {
    isFollowed: boolean;
};

export async function getDocumentBySlugAction(slug: string): Promise<FullDocument | null> {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const document = await prisma.document.findUnique({
        where: {
            slug,
        },
        include: {
            author: true,
            _count: {
                select: { likes: true, saves: true, comments: true }
            },
            comments: {
                include: {
                    author: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
    });

    if (!document) {
        return null;
    }

    let isFollowed = false;
    let isLiked = false;
    let isSaved = false;

    if (currentUserId) {
        if (currentUserId !== document.author.id) {
            const follow = await prisma.follows.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: document.author.id,
                    },
                },
            });
            isFollowed = !!follow;
        }

        const like = await prisma.documentLike.findUnique({
            where: {
                userId_documentId: {
                    userId: currentUserId,
                    documentId: document.id,
                }
            }
        });
        isLiked = !!like;

        const save = await prisma.documentSave.findUnique({
            where: {
                userId_documentId: {
                    userId: currentUserId,
                    documentId: document.id,
                }
            }
        });
        isSaved = !!save;
    }

    return { 
        ...document,
        isFollowed,
        likes_count: document._count.likes,
        saves_count: document._count.saves,
        comments_count: document._count.comments,
        isLiked,
        isSaved
    };
}

export async function getBugsAction(): Promise<Bug[]> {
    const session = await auth();
    const userId = session?.user?.id;

    const bugs = await prisma.bug.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: true,
            _count: {
                select: { upvotes: true }
            }
        }
    });

    const bugIds = bugs.map(b => b.id);
    let userUpvotes: string[] = [];

    if (userId) {
        const upvotes = await prisma.bugUpvote.findMany({
            where: { userId: userId, bugId: { in: bugIds } },
            select: { bugId: true }
        });
        userUpvotes = upvotes.map(upvote => upvote.bugId);
    }
    
    return bugs.map(bug => ({
        ...bug,
        author: bug.author,
        upvotes_count: bug._count.upvotes,
        isUpvoted: userUpvotes.includes(bug.id),
        comments_count: 0 // Placeholder
    }));
}


export async function toggleBugUpvoteAction(bugId: string) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('You must be logged in to upvote a bug.');
    }

    const existingUpvote = await prisma.bugUpvote.findUnique({
        where: {
            userId_bugId: {
                userId,
                bugId,
            }
        },
    });

    if (existingUpvote) {
        await prisma.bugUpvote.delete({
            where: {
                id: existingUpvote.id,
            },
        });
    } else {
        await prisma.bugUpvote.create({
            data: {
                userId,
                bugId,
            },
        });
    }
    revalidatePath('/bugs');
}

export async function getUsersAction({ query }: { query?: string }): Promise<(User & { isFollowing: boolean, followersCount: number })[]> {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const users = await prisma.user.findMany({
        where: {
            NOT: {
                id: currentUserId,
            },
            name: {
                contains: query,
                mode: 'insensitive',
            }
        },
        include: {
            _count: {
                select: {
                    followers: true,
                }
            }
        }
    });

    if (!currentUserId) {
        return users.map(user => ({
            ...user,
            isFollowing: false,
            followersCount: user._count.followers
        }));
    }

    const following = await prisma.follows.findMany({
        where: {
            followerId: currentUserId,
            followingId: {
                in: users.map(u => u.id)
            }
        }
    });
    
    const followingIds = following.map(f => f.followingId);

    return users.map(user => ({
        ...user,
        isFollowing: followingIds.includes(user.id),
        followersCount: user._count.followers
    }));
}


export async function toggleDocumentLikeAction(documentId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to like a document.');
    }

    const like = await prisma.documentLike.findUnique({
        where: {
            userId_documentId: {
                userId,
                documentId,
            }
        }
    });

    const path = (await prisma.document.findUnique({where: {id: documentId}, select: {slug: true}}))?.slug;

    if (like) {
        await prisma.documentLike.delete({ where: { id: like.id } });
    } else {
        await prisma.documentLike.create({ data: { userId, documentId } });
    }

    if (path) revalidatePath(`/docs/${path}`);
}

export async function toggleDocumentSaveAction(documentId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to save a document.');
    }

    const save = await prisma.documentSave.findUnique({
        where: {
            userId_documentId: {
                userId,
                documentId,
            }
        }
    });

    const path = (await prisma.document.findUnique({where: {id: documentId}, select: {slug: true}}))?.slug;

    if (save) {
        await prisma.documentSave.delete({ where: { id: save.id } });
    } else {
        await prisma.documentSave.create({ data: { userId, documentId } });
    }

    if (path) revalidatePath(`/docs/${path}`);
}

export async function createDocumentCommentAction(documentId: string, content: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to comment.');
    }
    if (content.trim().length === 0) {
        throw new Error('Comment cannot be empty.');
    }

    await prisma.documentComment.create({
        data: {
            content,
            documentId,
            authorId: userId,
        }
    });
    
    const path = (await prisma.document.findUnique({where: {id: documentId}, select: {slug: true}}))?.slug;
    if (path) revalidatePath(`/docs/${path}`);
}
