'use server';

import { rfidAccessDataReasoning } from '@/ai/flows/rfid-access-data-reasoning';
import type { CardData } from './types';
import { supabase } from './supabaseClient';
import { revalidatePath } from 'next/cache';

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
  const rows = data.map(card => `${card.card_uid},${card.user_name},${card.access_level},"${Array.isArray(card.authorized_doors) ? card.authorized_doors.join(',') : ''}"`);

  return [header, ...rows].join('\n');
}

async function logAccessAttempt(result: { cardUID: string; userName: string; isAuthorized: boolean; reason: string; }) {
    const { error } = await supabase.from('access_logs').insert({
        card_uid: result.cardUID,
        user_name: result.userName,
        status: result.isAuthorized ? 'Granted' : 'Denied',
        reason: result.reason,
    });

    if (error) {
        console.error('Error logging access attempt:', error);
    } else {
        // Revalidate the path to show the new log entry in the table
        revalidatePath('/');
    }
}

export async function checkAccess(cardData: Pick<CardData, 'cardUID' | 'block1Data' | 'block2Data'>) {
    let result;
    try {
        const { data: card, error: fetchError } = await supabase
            .from('cards')
            .select(`
                *,
                profiles (
                    user_name
                )
            `)
            .eq('card_uid', cardData.cardUID)
            .single();

        if (fetchError || !card) {
            console.log(`Card ${cardData.cardUID} not found in database. Error:`, fetchError?.message);
            result = {
                isAuthorized: false,
                reason: 'Card not registered.',
                userName: 'Unknown',
                cardUID: cardData.cardUID,
            };
        } else {
            // Supabase returns an array for relationships, even for a single one.
            const profile = Array.isArray(card.profiles) ? card.profiles[0] : card.profiles;
            const userName = profile?.user_name || 'Unknown';
            
            const accessPermissionsTable = await getAccessPermissionsTable();
            const aiResult = await rfidAccessDataReasoning({
                cardUID: cardData.cardUID,
                block1Data: cardData.block1Data,
                block2Data: cardData.block2Data,
                accessPermissionsTable: accessPermissionsTable,
            });
            result = { ...aiResult, userName, cardUID: cardData.cardUID };
        }

        await logAccessAttempt(result);
        return result;

    } catch (error) {
        console.error('Error in AI reasoning or logging:', error);
        result = {
            isAuthorized: false,
            reason: 'System error during authorization check.',
            userName: 'Unknown',
            cardUID: cardData.cardUID,
        };
        await logAccessAttempt(result);
        return result;
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
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: 'password123', // Using a dummy password
    });

    if (authError || !authData.user) {
        console.error('Error creating user:', authError);
        return { success: false, error: authError?.message || 'Failed to create a user. Sign-ups might be disabled or the email is invalid.' };
    }
    
    const { user } = authData;

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
      block_1_data: 'New User Data',
      block_2_data: `Role: ${role}`,
      access_level: role,
      user_id: profile.id, 
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
        try { await supabase.auth.admin.deleteUser(user.id); } catch (e) {}
    }
    return { success: false, error: error.message };
  }
}

export async function getAccessLog() {
    const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching access log:', error);
        return [];
    }

    return data;
}
