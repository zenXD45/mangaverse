// src/ai/flows/manga-summary-generation.ts
'use server';

/**
 * @fileOverview Generates summaries for manga chapters or volumes using AI.
 *
 * - generateMangaSummary - A function that generates a manga summary.
 * - MangaSummaryInput - The input type for the generateMangaSummary function.
 * - MangaSummaryOutput - The return type for the generateMangaSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MangaSummaryInputSchema = z.object({
  mangaTitle: z.string().describe('The title of the manga.'),
  chapterNumber: z.number().optional().describe('The chapter number to summarize. If omitted, summarize the entire manga.'),
  volumeNumber: z.number().optional().describe('The volume number to summarize.  If omitted, summarize the entire manga.'),
  plotDescription: z.string().describe('The plot description of the manga.'),
});
export type MangaSummaryInput = z.infer<typeof MangaSummaryInputSchema>;

const MangaSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the manga chapter or volume.'),
});
export type MangaSummaryOutput = z.infer<typeof MangaSummaryOutputSchema>;

export async function generateMangaSummary(input: MangaSummaryInput): Promise<MangaSummaryOutput> {
  return mangaSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mangaSummaryPrompt',
  input: {schema: MangaSummaryInputSchema},
  output: {schema: MangaSummaryOutputSchema},
  prompt: `You are a manga summarization expert.  Provide a concise and informative summary of the manga, chapter, or volume based on the provided information.\n\nManga Title: {{{mangaTitle}}}\nChapter Number: {{chapterNumber}}\nVolume Number: {{volumeNumber}}\nPlot Description: {{{plotDescription}}}\n\nSummary: `,
});

const mangaSummaryFlow = ai.defineFlow(
  {
    name: 'mangaSummaryFlow',
    inputSchema: MangaSummaryInputSchema,
    outputSchema: MangaSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
