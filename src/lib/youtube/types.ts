
// Type definitions for YouTube auth
export interface AuthState {
  isSignedIn: boolean;
  accessToken: string | null;
  user: {
    name: string;
    email: string;
    picture: string;
  } | null;
}

// Add global type declarations for the Google API client
declare global {
  interface Window {
    [key: string]: any; // Allow dynamic callback functions
    gapi: {
      load: (
        apiName: string,
        callback: () => void
      ) => void;
      client: {
        init: (config: {
          apiKey?: string;
          clientId?: string;
          scope?: string;
          discoveryDocs?: string[];
        }) => Promise<void>;
        setToken: (token: { access_token: string } | null) => void;
        setApiKey: (apiKey: string) => void;
        youtube: any;
        load: (apiName: string, version: string, callback: () => void) => void;
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            redirect_uri?: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => any;
        };
      };
    };
  }
}
