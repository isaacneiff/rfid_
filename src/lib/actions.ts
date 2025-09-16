'use server';

import { rfidAccessDataReasoning } from '@/ai/flows/rfid-access-data-reasoning';
import type { CardData } from './types';

// This is a mock access permissions table. In a real application,
// this would come from your Supabase database.
const accessPermissionsTable = `
  CardUID,UserName,AccessLevel,AuthorizedDoors
  39C3BB99,Jobit Joseph,Admin,All
  A1B2C3D4,Alice,User,Main-Entrance,Lab-1
  E5F6G7H8,Bob,Guest,Main-Entrance
`;

export async function checkAccess(cardData: CardData) {
  try {
    const result = await rfidAccessDataReasoning({
      cardUID: cardData.cardUID,
      block1Data: cardData.block1Data,
      block2Data: cardData.block2Data,
      accessPermissionsTable: accessPermissionsTable,
    });
    return result;
  } catch (error) {
    console.error('Error in AI reasoning:', error);
    return {
      isAuthorized: false,
      reason: 'System error during authorization check.',
    };
  }
}
