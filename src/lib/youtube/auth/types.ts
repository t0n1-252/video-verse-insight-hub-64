
import { AuthState } from '../types';

export interface YouTubeAuthHookResult extends AuthState {
  isInitializing: boolean;
  error: Error | null;
  credentialsConfigured: boolean;
  profileFetchError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface TokenState {
  accessToken: string | null;
  timestamp: number | null;
}
