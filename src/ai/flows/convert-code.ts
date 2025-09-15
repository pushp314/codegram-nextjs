'use server';

/**
 * @fileOverview An AI agent that converts code snippets from one language to another.
 *
 * - convertCode - A function that handles the code conversion process.
 * - ConvertCodeInput - The input type for the convertCode function.
 * - ConvertCodeOutput - The return type for the convertCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertCodeInputSchema = z.object({
    sourceCode: z.string().describe('The code snippet to be converted.'),
    sourceLanguage: z.string().describe('The programming language of the source code.'),
    targetLanguage: z.string().describe('The programming language to convert the code to.'),
});
export type ConvertCodeInput = z.infer<typeof ConvertCodeInputSchema>;

const ConvertCodeOutputSchema = z.object({
    convertedCode: z.string().describe('The converted code snippet.'),
});
export type ConvertCodeOutput = z.infer<typeof ConvertCodeOutputSchema>;

export async function convertCode(input: ConvertCodeInput): Promise<ConvertCodeOutput> {
  return convertCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertCodePrompt',
  input: {schema: ConvertCodeInputSchema},
  output: {schema: ConvertCodeOutputSchema},
  prompt: `You are an expert software engineer specializing in converting code from one language to another. Your task is to convert the following code snippet accurately and efficiently.

Convert the following {{{sourceLanguage}}} code to {{{targetLanguage}}}. Only provide the raw code as the output, without any additional explanations, comments, or formatting like markdown backticks.

Source Code ({{{sourceLanguage}}}):
\'\'\'
{{{sourceCode}}}
\'\'\'
`,
});

const convertCodeFlow = ai.defineFlow(
  {
    name: 'convertCodeFlow',
    inputSchema: ConvertCodeInputSchema,
    outputSchema: ConvertCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
