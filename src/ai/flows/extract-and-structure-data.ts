'use server';

/**
 * @fileOverview Extracts and structures data from uploaded documents using GenAI.
 *
 * - extractAndStructureData - A function that handles the data extraction and structuring process.
 * - ExtractAndStructureDataInput - The input type for the extractAndStructureData function.
 * - ExtractAndStructureDataOutput - The return type for the extractAndStructureData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAndStructureDataInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text extracted from the uploaded document.'),
  expectedStructure: z
    .string()
    .describe(
      'A description of the expected structure for the extracted data.'
    ),
});
export type ExtractAndStructureDataInput = z.infer<
  typeof ExtractAndStructureDataInputSchema
>;

const ExtractAndStructureDataOutputSchema = z.object({
  structuredData: z
    .string()
    .describe(
      'The extracted data, structured according to the expected format.'
    ),
});
export type ExtractAndStructureDataOutput = z.infer<
  typeof ExtractAndStructureDataOutputSchema
>;

export async function extractAndStructureData(
  input: ExtractAndStructureDataInput
): Promise<ExtractAndStructureDataOutput> {
  return extractAndStructureDataFlow(input);
}

const extractAndStructureDataPrompt = ai.definePrompt({
  name: 'extractAndStructureDataPrompt',
  input: {schema: ExtractAndStructureDataInputSchema},
  output: {schema: ExtractAndStructureDataOutputSchema},
  prompt: `You are an expert data extraction specialist.

  Your task is to extract data from the given document text and structure it according to the provided expected structure.

  Document Text: {{{documentText}}}

  Expected Structure: {{{expectedStructure}}}

  Please provide the extracted data in a structured format, suitable for populating a form.`,
});

const extractAndStructureDataFlow = ai.defineFlow(
  {
    name: 'extractAndStructureDataFlow',
    inputSchema: ExtractAndStructureDataInputSchema,
    outputSchema: ExtractAndStructureDataOutputSchema,
  },
  async input => {
    const {output} = await extractAndStructureDataPrompt(input);
    return output!;
  }
);
