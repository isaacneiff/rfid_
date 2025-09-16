'use server';

import type { CardData } from './types';
import { supabase } from './supabaseClient';
import { revalidatePath } from 'next/cache';

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

export async function checkAccess(cardData: Pick<CardData, 'cardUID'>) {
    let result;
    try {
        const { data: card, error: fetchError } = await supabase
            .from('cards')
            .select(`
                card_uid,
                profiles (
                    user_name
                )
            `)
            .eq('card_uid', cardData.cardUID)
            .single();

        if (fetchError || !card) {
             result = {
                isAuthorized: false,
                reason: 'Card not registered.',
                userName: 'Unknown',
                cardUID: cardData.cardUID,
            };
        } else {
            const profile = Array.isArray(card.profiles) ? card.profiles[0] : card.profiles;
            const userName = profile?.user_name || 'Unknown User';
            result = {
                isAuthorized: true,
                reason: `Access granted for ${userName}.`,
                userName: userName,
                cardUID: cardData.cardUID,
            };
        }
        
        await logAccessAttempt(result);
        return result;

    } catch (error) {
        console.error('Error in checkAccess:', error);
        result = {
            isAuthorized: false,
            reason: 'System error during authorization check.',
            userName: 'Unknown',
            cardUID: cardData.cardUID,
        };
        // Log the attempt even if there's a system error
        await logAccessAttempt(result);
        return result;
    }
}

export async function registerCard(cardData: {userName: string, cardUID: string}, role: string) {
    
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

    revalidatePath('/');
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
