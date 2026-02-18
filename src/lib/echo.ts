import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

let echoInstance: Echo<any> | null = null;
let currentToken: string | null = null;

export const initializeEcho = (token: string): Echo<any> => {
  if (echoInstance && currentToken === token) {
    return echoInstance;
  }

  if (echoInstance && currentToken !== token) {
    try {
      echoInstance.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    echoInstance = null;
  }

  const appKey = import.meta.env.VITE_REVERB_APP_KEY;
  if (!appKey) {
    throw new Error('VITE_REVERB_APP_KEY is not defined.');
  }

  const wsHost = import.meta.env.VITE_REVERB_HOST || 'api.dressnmore.it.com';
  const wsPort = Number(import.meta.env.VITE_REVERB_PORT) || 443;
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https';
  const isSecure = scheme === 'https';
  // In development, use relative path (proxied by Vite to avoid CORS)
  // In production, use the full URL
  const customAuthEndpoint = import.meta.env.VITE_REVERB_AUTH_ENDPOINT
    || 'https://api.dressnmore.it.com/broadcasting/custom-auth';
  const authEndpoint = import.meta.env.DEV
    ? '/broadcasting/custom-auth'
    : customAuthEndpoint;

  console.log('🔌 WebSocket Config:', {
    wsHost,
    wsPort,
    wssPort: wsPort,
    isSecure,
    forceTLS: isSecure,
    authEndpoint,
    enabledTransports: isSecure ? ['wss', 'ws'] : ['ws', 'wss'],
    appKey: appKey.substring(0, 10) + '...',
  });

  currentToken = token;

  // Enable Pusher logging in development for debugging
  if (import.meta.env.DEV) {
    Pusher.logToConsole = true;
  }

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: appKey,
    wsHost: wsHost,
    wsPort: wsPort,
    wssPort: wsPort,
    forceTLS: isSecure,
    enabledTransports: isSecure ? ['wss', 'ws'] : ['ws', 'wss'],
    disableStats: true,
    authEndpoint: authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

export const getEcho = (): Echo<any> | null => {
  return echoInstance;
};

export const disconnectEcho = (): void => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    echoInstance = null;
  }
  currentToken = null;
};
