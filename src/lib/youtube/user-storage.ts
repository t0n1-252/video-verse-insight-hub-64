
import { supabase } from "@/integrations/supabase/client";

export interface YouTubeUserData {
  youtube_user_id: string;
  name: string;
  email: string;
  picture: string;
  access_token: string;
}

export async function storeYouTubeUser(userData: YouTubeUserData) {
  try {
    console.log('Storing YouTube user data in Supabase:', userData.youtube_user_id);
    
    const { data, error } = await supabase
      .from('youtube_users')
      .upsert({
        youtube_user_id: userData.youtube_user_id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        access_token: userData.access_token,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'youtube_user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing YouTube user:', error);
      throw error;
    }

    console.log('Successfully stored YouTube user data:', data);
    return data;
  } catch (error) {
    console.error('Failed to store YouTube user:', error);
    throw error;
  }
}

export async function getStoredYouTubeUser(youtubeUserId: string) {
  try {
    const { data, error } = await supabase
      .from('youtube_users')
      .select('*')
      .eq('youtube_user_id', youtubeUserId)
      .single();

    if (error) {
      console.error('Error fetching YouTube user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch YouTube user:', error);
    throw error;
  }
}
