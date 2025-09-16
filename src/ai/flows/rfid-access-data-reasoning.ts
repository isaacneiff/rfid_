'use server';
/**
 * @fileOverview This file defines a Genkit flow for reasoning about RFID access data.
 *
 * It takes RFID card data as input and validates it against access and permission tables
 * using AI reasoning to ensure only authorized personnel are granted access.
 *
 * @fileOverview This file defines a Genkit flow for reasoning about RFID access data.
 *
 * It takes RFID card data as input and validates it against access and permission tables
 * using AI reasoning to ensure only authorized personnel are granted access.
 *
 * - rfidAccessDataReasoning - A function that handles the RFID access data reasoning process.
 * - RfidAccessDataReasoningInput - The input type for the rfidAccessDataReasoning function.
 * - RfidAccessDataReasoningOutput - The return type for the rfidAccessDataReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RfidAccessDataReasoningInputSchema = z.object({
  cardUID: z.string().describe('The unique identifier of the RFID card.'),
  block1Data: z.string().describe('Data from block 1 of the RFID card.'),
  block2Data: z.string().describe('Data from block 2 of the RFID card.'),
  accessPermissionsTable: z
    .string()
    .describe('A table containing the valid RFID card UIDs and associated access permissions.'),
});
export type RfidAccessDataReasoningInput = z.infer<typeof RfidAccessDataReasoningInputSchema>;

const RfidAccessDataReasoningOutputSchema = z.object({
  isAuthorized: z.boolean().describe('Whether the RFID card is authorized to access the system.'),
  reason: z.string().describe('The reason for the authorization decision.'),
});
export type RfidAccessDataReasoningOutput = z.infer<typeof RfidAccessDataReasoningOutputSchema>;

export async function rfidAccessDataReasoning(input: RfidAccessDataReasoningInput): Promise<RfidAccessDataReasoningOutput> {
  return rfidAccessDataReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rfidAccessDataReasoningPrompt',
  input: {schema: RfidAccessDataReasoningInputSchema},
  output: {schema: RfidAccessDataReasoningOutputSchema},
  prompt: `You are an access control system expert. You are provided with data from an RFID card and an access permissions table.

  Based on the card's UID, block 1 data, block 2 data, and the access permissions table, determine if the card is authorized to access the system.

  Card UID: {{{cardUID}}}
  Block 1 Data: {{{block1Data}}}
  Block 2 Data: {{{block2Data}}}
  Access Permissions Table: {{{accessPermissionsTable}}}

  Respond with the authorization decision (isAuthorized) and the reason for the decision (reason).  Make sure you use the data in the Access Permissions Table to make your decision.
  `,
});

const rfidAccessDataReasoningFlow = ai.defineFlow(
  {
    name: 'rfidAccessDataReasoningFlow',
    inputSchema: RfidAccessDataReasoningInputSchema,
    outputSchema: RfidAccessDataReasoningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
