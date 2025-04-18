
export const initializeAndPrepareGapi = async (accessToken: string): Promise<void> => {
  if (!window.gapi) {
    throw new Error('Google API client not available - please check if it loaded correctly');
  }
  
  if (!window.gapi.client) {
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: () => {
          try {
            window.gapi.client.init({
              apiKey: '', // No API key needed for OAuth flow
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
            }).then(() => {
              resolve();
            }).catch((err: any) => {
              reject(err);
            });
          } catch (err) {
            reject(err);
          }
        },
        onerror: (err) => {
          console.error('Error loading GAPI client:', err);
          reject(err);
        }
      });
    });
  }
  
  window.gapi.client.setToken({ access_token: accessToken });
};

export const loadYouTubeAPI = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    window.gapi.client.load('youtube', 'v3', () => {
      console.log('YouTube API loaded successfully');
      resolve();
    });
  });
};
