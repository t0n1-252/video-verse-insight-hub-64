
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

// Google API client global type declarations
declare global {
  interface Window {
    [key: string]: any; // Allow dynamic callback functions
    gapi: {
      load: (
        apiName: string,
        callback: {
          callback?: () => void;
          onerror?: (error: any) => void;
        } | (() => void)
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
        people?: {
          people: {
            get: (params: {
              resourceName: string;
              personFields: string;
            }) => Promise<any>;
          };
        };
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
          requestAccessToken: (params: {
            prompt?: string;
            hint?: string;
            state?: string;
            enable_serial_consent?: boolean;
          }) => void;
        };
      };
    };
  }
}
