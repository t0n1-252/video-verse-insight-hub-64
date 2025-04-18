
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
      const tokenStatus = await checkTokenValidity(accessToken);
      if (!tokenStatus.isValid) {
        throw new Error(`Invalid token: ${tokenStatus.details}`);
      }
      
      let user = await this.fetchUserWithRetry(accessToken);
      if (user) {
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
        }
        
        saveSession(accessToken, user);
        
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
      }
      throw new Error('Failed to fetch user profile after successful validation');
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  private async fetchUserWithRetry(accessToken: string, maxRetries = 3): Promise<any> {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
        
        const user = await fetchUserProfile(accessToken);
        if (user) return user;
      } catch (err) {
        lastError = err;
        if (err instanceof Error && 
            (err.message.includes('Token rejected') || 
             err.message.includes('Invalid or expired access token'))) {
          break;
        }
      }
    }
    
    if (lastError) throw lastError;
    return null;
  }
}
