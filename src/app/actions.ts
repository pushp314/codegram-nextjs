

'use server';

import {
  generateCodeSnippetFromDescription,
  type GenerateCodeSnippetInput,
} from '@/ai/flows/generate-code-snippet-from-description';
import { convertCode, type ConvertCodeInput } from '@/ai/flows/convert-code';
import { auth } from '@/lib/auth';
import type { Snippet, Document, Bug, User, DocumentComment, SnippetComment, Notification, Component, UserWithFollows } from '@/lib/types';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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


export async function updateSnippetAction(snippetId: string, data: { title: string; description: string; code: string; language: string; }) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to update a snippet.');
    }

    const snippet = await prisma.snippet.findUnique({
        where: { id: snippetId },
        select: { authorId: true },
    });

    if (!snippet || snippet.authorId !== userId) {
        throw new Error('You are not authorized to update this snippet.');
    }

    await prisma.snippet.update({
        where: { id: snippetId },
        data,
    });

    revalidatePath('/');
    revalidatePath(`/snippets/${snippetId}`);
    revalidatePath(`/profile/${userId}`);
}

export async function deleteSnippetAction(snippetId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to delete a snippet.');
    }

    const snippet = await prisma.snippet.findUnique({
        where: { id: snippetId },
        select: { authorId: true },
    });

    if (!snippet || snippet.authorId !== userId) {
        throw new Error('You are not authorized to delete this snippet.');
    }

    await prisma.snippet.delete({
        where: { id: snippetId },
    });

    revalidatePath('/');
    revalidatePath(`/profile/${userId}`);
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
    revalidatePath(`/profile/${session.user.id}`);
    return { slug };
}

export async function updateDocumentAction(docId: string, data: { title: string; description: string; content: string; tags: string; }) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to update a document.');
    }
    
    const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { authorId: true },
    });

    if (!document || document.authorId !== userId) {
        throw new Error('You are not authorized to update this document.');
    }

    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const newSlug = slugify(data.title);
    
    await prisma.document.update({
        where: { id: docId },
        data: {
            title: data.title,
            slug: newSlug,
            description: data.description,
            content: data.content,
            tags: tagsArray,
        },
    });

    revalidatePath('/docs');
    revalidatePath(`/docs/${newSlug}`);
    revalidatePath(`/profile/${userId}`);
    return { slug: newSlug };
}

export async function deleteDocumentAction(docId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to delete a document.');
    }
    
    const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { authorId: true },
    });

    if (!document || document.authorId !== userId) {
        throw new Error('You are not authorized to delete this document.');
    }

    await prisma.document.delete({
        where: { id: docId },
    });

    revalidatePath('/docs');
    revalidatePath(`/profile/${userId}`);
    // Redirect after deletion, handled on client
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

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId }, select: { authorId: true } });
    if (!snippet) return;

    if (like) {
        await prisma.like.delete({
            where: { id: like.id, }
        });
    } else {
        await prisma.like.create({
            data: { userId, snippetId, }
        });

        // Create notification if not liking own snippet
        if (userId !== snippet.authorId) {
            await prisma.notification.create({
                data: {
                    recipientId: snippet.authorId,
                    originatorId: userId,
                    type: 'LIKE',
                    link: `/snippets/${snippetId}`
                }
            });
        }
    }
    revalidatePath('/');
    revalidatePath(`/explore`);
    revalidatePath(`/profile/${snippet.authorId}`);
    revalidatePath('/saved');
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

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId }, select: { authorId: true } });

    if (save) {
        await prisma.save.delete({ where: { id: save.id, } });
    } else {
        await prisma.save.create({ data: { userId, snippetId, } });
    }
    revalidatePath('/');
    revalidatePath(`/explore`);
    if(snippet?.authorId) revalidatePath(`/profile/${snippet.authorId}`);
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
        
        // Create notification
        await prisma.notification.create({
            data: {
                recipientId: authorId,
                originatorId: currentUserId,
                type: 'FOLLOW'
            }
        });
    }

    revalidatePath(`/profile/${authorId}`);
    revalidatePath(`/profile/${currentUserId}`);
    revalidatePath(`/docs`);
    revalidatePath('/community');
}

export async function getSnippetById(id: string) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: { author: true }
    });
    return snippet;
  } catch (error) {
    console.error('[getSnippetById Error]', error);
    return null;
  }
}

export async function getSnippetsAction({ page = 0, limit = 3, authorId }: { page: number; limit: number, authorId?: string }): Promise<{ snippets: Snippet[], hasMore: boolean } | { error: string }> {
  try {
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
        },
        comments: {
          take: 2,
          orderBy: {
              createdAt: 'desc'
          },
          include: {
              author: true
          }
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
          views_count: 1000, // Placeholder
          comments: snippet.comments.map(c => ({...c, author: c.author}))
      };
      return typedSnippet;
    });

    return { snippets: snippetsWithLikes, hasMore };
  } catch (error) {
    console.error('[getSnippetsAction Error]', error);
    return { error: 'Failed to fetch snippets.' };
  }
}


export async function getSavedSnippetsAction({ page = 0, limit = 4, userId }: { page: number; limit: number, userId: string }): Promise<{ snippets: Snippet[], hasMore: boolean } | { error: string }> {
  try {
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
        },
        comments: {
          take: 2,
          orderBy: {
              createdAt: 'desc'
          },
          include: {
              author: true
          }
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
      views_count: 1000, // Placeholder
      comments: snippet.comments.map(c => ({...c, author: c.author})),
    }));
    
    const sortedSnippets = snippetsWithData.sort((a, b) => snippetIds.indexOf(a.id) - snippetIds.indexOf(b.id));

    return { snippets: sortedSnippets, hasMore };
  } catch (error) {
    console.error('[getSavedSnippetsAction Error]', error);
    return { error: 'Failed to fetch saved snippets.' };
  }
}


export async function getDocumentsAction({ query }: { query?: string }): Promise<Document[] | null> {
    try {
        const whereClause = query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ]
        } : {};

        const documents = await prisma.document.findMany({
            where: whereClause,
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
        return documents.map(d => ({...d, likes_count: 0, saves_count: 0, comments_count: d.comments.length, isLiked: false, isSaved: false, comments: d.comments.map(c => ({...c, author: c.author})) }));
    } catch (error) {
        console.error('[getDocumentsAction Error]', error);
        return null;
    }
}

export type FullDocument = Document & {
    isFollowed: boolean;
};

export async function getDocumentBySlugAction(slug: string): Promise<FullDocument | null> {
    try {
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
            isSaved,
            comments: document.comments.map(c => ({...c, author: c.author}))
        };
    } catch (error) {
        console.error('[getDocumentBySlugAction Error]', error);
        return null;
    }
}

export async function getBugsAction(): Promise<Bug[] | null> {
    try {
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
    } catch (error) {
        console.error('[getBugsAction Error]', error);
        return null;
    }
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

export async function getUsersAction({ query }: { query?: string }): Promise<(User & { isFollowing: boolean, followersCount: number })[] | null> {
    try {
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
    } catch (error) {
        console.error('[getUsersAction Error]', error);
        return null;
    }
}


export async function toggleDocumentLikeAction(documentId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('You must be logged in to like a document.');

    const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { authorId: true, slug: true } });
    if (!doc) throw new Error('Document not found');

    const like = await prisma.documentLike.findUnique({ where: { userId_documentId: { userId, documentId } } });

    if (like) {
        await prisma.documentLike.delete({ where: { id: like.id } });
    } else {
        await prisma.documentLike.create({ data: { userId, documentId } });
        if (userId !== doc.authorId) {
            await prisma.notification.create({
                data: {
                    recipientId: doc.authorId,
                    originatorId: userId,
                    type: 'LIKE',
                    link: `/docs/${doc.slug}`
                }
            });
        }
    }

    if (doc.slug) revalidatePath(`/docs/${doc.slug}`);
}

export async function toggleDocumentSaveAction(documentId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('You must be logged in to save a document.');

    const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { slug: true } });
    if (!doc) throw new Error('Document not found');

    const save = await prisma.documentSave.findUnique({ where: { userId_documentId: { userId, documentId } } });

    if (save) {
        await prisma.documentSave.delete({ where: { id: save.id } });
    } else {
        await prisma.documentSave.create({ data: { userId, documentId } });
    }

    if (doc.slug) revalidatePath(`/docs/${doc.slug}`);
    revalidatePath('/saved');
}

export async function createDocumentCommentAction(documentId: string, content: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('You must be logged in to comment.');
    if (content.trim().length === 0) throw new Error('Comment cannot be empty.');

    const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { authorId: true, slug: true } });
    if (!doc) throw new Error('Document not found');

    await prisma.documentComment.create({
        data: { content, documentId, authorId: userId }
    });
    
    if (userId !== doc.authorId) {
        await prisma.notification.create({
            data: {
                recipientId: doc.authorId,
                originatorId: userId,
                type: 'COMMENT',
                link: `/docs/${doc.slug}`
            }
        });
    }
    
    if (doc.slug) revalidatePath(`/docs/${doc.slug}`);
}

export async function getSnippetCommentsAction(snippetId: string): Promise<SnippetComment[] | null> {
    try {
        const comments = await prisma.snippetComment.findMany({
            where: {
                snippetId,
            },
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return comments.map(c => ({...c, author: c.author}));
    } catch (error) {
        console.error('[getSnippetCommentsAction Error]', error);
        return null;
    }
}

export async function addSnippetCommentAction(snippetId: string, content: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('You must be logged in to comment.');
    if (content.trim().length === 0) throw new Error('Comment cannot be empty.');

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId }, select: { authorId: true } });
    if (!snippet) throw new Error('Snippet not found');

    await prisma.snippetComment.create({
        data: { content, snippetId, authorId: userId }
    });
    
    if (userId !== snippet.authorId) {
        await prisma.notification.create({
            data: {
                recipientId: snippet.authorId,
                originatorId: userId,
                type: 'COMMENT',
                link: `/snippets/${snippetId}`
            }
        });
    }
    
    revalidatePath('/');
    revalidatePath(`/explore`);
    revalidatePath(`/profile/${snippet.authorId}`);
    revalidatePath('/saved');
    revalidatePath(`/snippets/${snippetId}`);
}

export async function getDocumentCommentsAction(documentId: string): Promise<DocumentComment[] | null> {
    try {
        const comments = await prisma.documentComment.findMany({
            where: {
                documentId,
            },
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return comments.map(c => ({...c, author: c.author}));
    } catch (error) {
        console.error('[getDocumentCommentsAction Error]', error);
        return null;
    }
}


export async function getDocumentsByAuthorAction({ page = 0, limit = 4, authorId }: { page: number; limit: number, authorId: string }): Promise<{ documents: Document[], hasMore: boolean } | { error: string }> {
  try {
    const documents = await prisma.document.findMany({
      where: { authorId },
      skip: page * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: true,
        _count: {
          select: { likes: true, saves: true, comments: true }
        },
      }
    });

    const totalDocs = await prisma.document.count({ where: { authorId } });
    const hasMore = (page * limit) + limit < totalDocs;
    
    const docsWithData: Document[] = documents.map(doc => ({
      ...doc,
      author: doc.author,
      likes_count: doc._count.likes,
      saves_count: doc._count.saves,
      comments_count: doc._count.comments,
      isLiked: false, // This data is not available in this context
      isSaved: false, // This data is not available in this context
      comments: []
    }));

    return { documents: docsWithData, hasMore };
  } catch (error) {
    console.error('[getDocumentsByAuthorAction Error]', error);
    return { error: 'Failed to fetch documents.' };
  }
}


export async function getSavedDocumentsAction({ page = 0, limit = 4, userId }: { page: number; limit: number, userId: string }): Promise<{ documents: Document[], hasMore: boolean } | { error: string }> {
  try {
    const saved = await prisma.documentSave.findMany({
      where: { userId },
      select: { documentId: true },
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });

    const docIds = saved.map(s => s.documentId);

    const documents = await prisma.document.findMany({
      where: { id: { in: docIds } },
      include: {
        author: true,
        _count: {
          select: { likes: true, saves: true, comments: true }
        },
      }
    });

    const totalSaved = await prisma.documentSave.count({ where: { userId } });
    const hasMore = (page * limit) + limit < totalSaved;

    const docsWithData: Document[] = documents.map(doc => ({
      ...doc,
      author: doc.author,
      likes_count: doc._count.likes,
      saves_count: doc._count.saves,
      comments_count: doc._count.comments,
      isLiked: false, // Placeholder
      isSaved: true, // It's a saved doc
      comments: []
    }));
    
    const sortedDocs = docsWithData.sort((a, b) => docIds.indexOf(a.id) - docIds.indexOf(b.id));

    return { documents: sortedDocs, hasMore };
  } catch (error) {
    console.error('[getSavedDocumentsAction Error]', error);
    return { error: 'Failed to fetch saved documents.' };
  }
}

export async function getNotificationsAction(userId: string): Promise<{ notifications: Notification[], unreadCount: number } | null> {
    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: userId },
            include: { originator: true, recipient: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const unreadCount = await prisma.notification.count({
            where: { recipientId: userId, read: false },
        });
        return { notifications: notifications as Notification[], unreadCount };
    } catch (error) {
        console.error('[getNotificationsAction Error]', error);
        return null;
    }
}

export async function markNotificationsAsReadAction(userId: string) {
    await prisma.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true },
    });
    revalidatePath('/any'); // A generic path to trigger revalidation
}

export async function createComponentAction(data: { name: string; description: string; code: string; }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to create a component.');
    }
    const slug = slugify(data.name);

    await prisma.component.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            code: data.code,
            authorId: session.user.id,
        }
    });

    revalidatePath('/components');
    return { slug };
}

export async function getUserProfile(userId: string): Promise<(UserWithFollows & { isFollowing: boolean }) | null> {
    try {
        const session = await auth();
        const currentUserId = session?.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                followers: {
                    select: { follower: true }
                },
                following: {
                    select: { following: true }
                },
                _count: {
                    select: {
                        snippets: true,
                        documents: true,
                        followers: true,
                        following: true,
                    }
                }
            }
        });

        if (!user) {
            return null;
        }

        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
            const follow = await prisma.follows.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: userId,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return { ...user, isFollowing };
    } catch (error) {
        console.error('[getUserProfile Error]', error);
        return null;
    }
}

export async function updateUserProfileAction(data: { name: string; bio: string; }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to update your profile.');
    }
    
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: data.name,
            bio: data.bio,
        }
    });

    revalidatePath(`/profile/${session.user.id}`);
    revalidatePath('/settings');
}
