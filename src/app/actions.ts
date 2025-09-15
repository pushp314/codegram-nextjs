'use server';

import {
  generateCodeSnippetFromDescription,
  type GenerateCodeSnippetInput,
} from '@/ai/flows/generate-code-snippet-from-description';
import { convertCode, type ConvertCodeInput } from '@/ai/flows/convert-code';
import { auth } from '@/lib/auth';
import { mockSnippets } from '@/lib/mock-data';
import { Snippet } from '@/lib/types';


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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const sortedSnippets = [...mockSnippets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  
  const pageData = sortedSnippets.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedSnippets.length;

  return { snippets: pageData, hasMore };
}
