
import { checkTokenValidity } from '../config';
import { fetchUserProfile } from '../user-profile';
import { storeYouTubeUser } from '../user-storage';
import { clearSession, saveSession } from './session';
import { AuthState } from '../types';
import { useToast } from '@/hooks/use-toast';

export class YouTubeAuthManager {
  private toastFunction: ReturnType<typeof useToast>['toast'];
  
  constructor(toastProvider: ReturnType<typeof useToast>) {
    this.toastFunction = toastProvider.toast;
  }

  async handleAuthSuccess(accessToken: string): Promise<AuthState> {
    console.log('Authentication successful, token received with length:', accessToken.length);
    
    try {
      // First, validate the token
      const tokenStatus = await checkTokenValidity(accessToken);
      if (!tokenStatus.isValid) {
        throw new Error(`Invalid token: ${tokenStatus.details}`);
      }
      
      // Then fetch the user profile
      let user = await this.fetchUserWithRetry(accessToken);
      if (!user) {
        throw new Error('Failed to fetch user profile');
      }
      
      // Store the authenticated user
      try {
        await storeYouTubeUser({
          youtube_user_id: user.id || `youtube_${Date.now()}`,
          name: user.name,
          email: user.email,
          picture: user.picture,
          access_token: accessToken
        });
      } catch (storeError) {
        console.error("Error storing user in Supabase:", storeError);
        // Continue even if storage fails
      }
      
      // Save the session locally
      saveSession(accessToken, user);
      
      // Show success toast
      this.toastFunction({
        title: "Successfully connected",
        description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
        variant: "default",
      });
      
      return {
        isSignedIn: true,
        accessToken,
        user
      };
    } catch (error) {
      console.error('Auth error in handleAuthSuccess:', error);
      clearSession();
      throw error;
    }
  }

  private async fetchUserWithRetry(accessToken: string, maxRetries = 2): Promise<any> {
    let attempt = 0;
    let lastError = null;
    
    while (attempt <= maxRetries) {
      try {
        console.log(`Fetching user profile attempt ${attempt + 1}/${maxRetries + 1}`);
        
        if (attempt > 0) {
          // Wait longer between retries
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
        
        const user = await fetchUserProfile(accessToken);
        if (user) {
          console.log('Successfully fetched user profile on attempt', attempt + 1);
          return user;
        }
      } catch (err) {
        lastError = err;
        console.error(`Error on attempt ${attempt + 1}:`, err);
        
        // Don't retry if token is invalid
        if (err instanceof Error && 
            (err.message.includes('Token rejected') || 
             err.message.includes('Invalid or expired'))) {
          break;
        }
      }
      
      attempt++;
    }
    
    if (lastError) throw lastError;
    return null;
  }
}
