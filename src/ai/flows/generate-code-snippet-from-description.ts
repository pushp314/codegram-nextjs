'use server';
/**
 * @fileOverview A code snippet generator AI agent.
 *
 * - generateCodeSnippetFromDescription - A function that handles the code snippet generation process.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippetFromDescription function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippetFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  description: z.string().describe('The description of the code snippet to generate.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippetFromDescription(
  input: GenerateCodeSnippetInput
): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetFromDescriptionPrompt',
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `You are an expert software engineer specializing in generating code snippets based on descriptions.

  Generate a code snippet based on the following description:

  Description: {{{description}}}
  `,
});

const generateCodeSnippetFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFromDescriptionFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
