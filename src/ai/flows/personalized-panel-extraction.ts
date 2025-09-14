'use server';

/**
 * @fileOverview This flow personalizes manga panel extraction based on user preferences and reading history.
 *
 * @function personalizedPanelExtraction - Extracts and formats manga panels based on user preferences.
 * @typedef {Object} PersonalizedPanelExtractionInput - Input type for personalizedPanelExtraction function.
 * @typedef {Object} PersonalizedPanelExtractionOutput - Output type for personalizedPanelExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPanelExtractionInputSchema = z.object({
  mangaPageDataUri: z
    .string()
    .describe(
      "A manga page image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userPreferences: z
    .string()
    .describe('A description of the user reading preferences.'),
  readingHistory: z.string().describe('The user reading history.'),
});

export type PersonalizedPanelExtractionInput = z.infer<
  typeof PersonalizedPanelExtractionInputSchema
>;

const PersonalizedPanelExtractionOutputSchema = z.object({
  extractedPanels: z
    .array(z.string())
    .describe('An array of extracted manga panel data URIs.'),
});

export type PersonalizedPanelExtractionOutput = z.infer<
  typeof PersonalizedPanelExtractionOutputSchema
>;

export async function personalizedPanelExtraction(
  input: PersonalizedPanelExtractionInput
): Promise<PersonalizedPanelExtractionOutput> {
  return personalizedPanelExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedPanelExtractionPrompt',
  input: {schema: PersonalizedPanelExtractionInputSchema},
  output: {schema: PersonalizedPanelExtractionOutputSchema},
  prompt: `You are a manga panel extraction expert. You will extract manga panels from a given manga page image, based on the user's reading preferences and history.

User Preferences: {{{userPreferences}}}
Reading History: {{{readingHistory}}}
Manga Page: {{media url=mangaPageDataUri}}

Extract the panels from the manga page, and return them as a JSON array of data URIs.
`,
});

const personalizedPanelExtractionFlow = ai.defineFlow(
  {
    name: 'personalizedPanelExtractionFlow',
    inputSchema: PersonalizedPanelExtractionInputSchema,
    outputSchema: PersonalizedPanelExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
