'use server';

import { rfidAccessDataReasoning } from '@/ai/flows/rfid-access-data-reasoning';
import type { CardData } from './types';
import { supabase } from './supabaseClient';

async function getAccessPermissionsTable(): Promise<string> {
  const { data, error } = await supabase.from('cards').select('card_uid,user_name,access_level,authorized_doors');
  
  if (error) {
    console.error('Error fetching cards from Supabase:', error);
    return '';
  }

  if (!data || data.length === 0) {
    return 'CardUID,UserName,AccessLevel,AuthorizedDoors';
  }

  // Convert to CSV format for the AI prompt
  const header = 'CardUID,UserName,AccessLevel,AuthorizedDoors';
  const rows = data.map(card => `${card.card_uid},${card.user_name},${card.access_level},"${card.authorized_doors.join(',')}"`);

  return [header, ...rows].join('\n');
}


export async function checkAccess(cardData: Pick<CardData, 'cardUID' | 'block1Data' | 'block2Data'>) {
  try {
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('*, profiles(user_name)')
      .eq('card_uid', cardData.cardUID)
      .single();

    if (fetchError || !card) {
      console.log(`Card ${cardData.cardUID} not found in database.`);
      return { 
        isAuthorized: false, 
        reason: 'Card not registered.',
        userName: 'Unknown',
        cardUID: cardData.cardUID,
      };
    }
    
    // The user name is nested in the profiles table
    const userName = (card.profiles as { user_name: string })?.user_name || 'Unknown';
    const fullCardData: CardData = {
        ...cardData,
        userName,
    }

    const accessPermissionsTable = await getAccessPermissionsTable();
    const result = await rfidAccessDataReasoning({
      cardUID: fullCardData.cardUID,
      block1Data: fullCardData.block1Data,
      block2Data: fullCardData.block2Data,
      accessPermissionsTable: accessPermissionsTable,
    });
    
    return { ...result, userName, cardUID: fullCardData.cardUID };

  } catch (error) {
    console.error('Error in AI reasoning:', error);
    return {
      isAuthorized: false,
      reason: 'System error during authorization check.',
      userName: 'Unknown',
      cardUID: cardData.cardUID,
    };
  }
}

export async function registerCard(cardData: Pick<CardData, 'cardUID' | 'userName'>, role: string) {
    
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting profiles:', countError);
      return { success: false, error: countError.message };
    }

    const nextUserNumber = (count ?? 0) + 1;
    const email = `teste${nextUserNumber}@email.com`;
    
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: email,
        password: 'password123', // Using a dummy password
    });

    if (authError || !user) {
        console.error('Error creating user:', authError);
        return { success: false, error: authError?.message || 'Failed to create a user.' };
    }
    
  try {
    // Step 1: Create a profile for the user, linked to the auth user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({ 
          id: user.id, // Link to the created auth user
          user_name: cardData.userName 
        })
      .select()
      .single();

    if (profileError) throw profileError;

    // Step 2: Register the card and associate it with the profile
    const { error: cardError } = await supabase.from('cards').insert({
      card_uid: cardData.cardUID,
      block_1_data: 'New User Data', // Mock data as per request
      block_2_data: `Role: ${role}`,   // Mock data as per request
      access_level: role,
      user_id: profile.id, // This is now the user's auth ID
      authorized_doors: role === 'Admin' ? ['All'] : ['Main-Entrance'], // Example logic
    });

    if (cardError) {
      // If card registration fails, roll back the profile and user creation
      await supabase.auth.admin.deleteUser(user.id);
      throw cardError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error registering card:', error);
    // If something fails after user creation, we must delete the user to avoid orphans
    if(user) {
        await supabase.auth.admin.deleteUser(user.id);
    }
    return { success: false, error: error.message };
  }
}
