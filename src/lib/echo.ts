import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

let echoInstance: Echo<any> | null = null;
let currentToken: string | null = null;
let isConnecting = false;

export const initializeEcho = (token: string): Echo<any> => {
  if (echoInstance && currentToken === token && !isConnecting) {
    return echoInstance;
  }

  if (isConnecting && echoInstance) {
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
  const backendURL = import.meta.env.VITE_BACKEND_URL || '';
  const baseURL = backendURL.replace(/\/api\/v\d+$/, '') || '';
  
  let scheme = import.meta.env.VITE_REVERB_SCHEME;
  if (backendURL) {
    try {
      const url = new URL(backendURL);
      if (url.protocol === 'https:') {
        scheme = 'https';
      } else if (!scheme) {
        scheme = 'http';
      }
    } catch {
      scheme = scheme || 'http';
    }
  }
  scheme = scheme || 'http';
  const isSecure = scheme === 'https';
  const authEndpoint = `${baseURL}/broadcasting/auth`;

  console.log('🔌 WebSocket Config:', {
    backendURL,
    baseURL,
    scheme,
    isSecure,
    authEndpoint,
  });

  if (!appKey) {
    throw new Error('VITE_REVERB_APP_KEY is not defined. Please add it to your .env file.');
  }

  let wsHost: string;
  let wsPort: number;

  if (baseURL) {
    try {
      const url = new URL(baseURL);
      wsHost = url.hostname;
      wsPort = isSecure ? 8443 : 8080;
    } catch {
      wsHost = 'localhost';
      wsPort = 8080;
    }
  } else {
    wsHost = 'localhost';
    wsPort = 8080;
  }
  
  isConnecting = true;
  currentToken = token;
  
  try {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('WebSocket connection') ||
        message.includes('ws://localhost:8080') ||
        message.includes('wss://localhost:8080') ||
        message.includes('pusher') ||
        message.includes('failed:')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('WebSocket') ||
        message.includes('ws://') ||
        message.includes('wss://')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
    
    console.log = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('WebSocket connection') ||
        message.includes('ws://localhost:8080') ||
        message.includes('pusher')
      ) {
        return;
      }
      originalLog.apply(console, args);
    };
    
    console.log('🔌 WebSocket: إعدادات الاتصال:', {
      wsHost,
      wsPort,
      isSecure,
      authEndpoint,
      appKey: appKey.substring(0, 10) + '...',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
    });

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: wsHost,
      wsPort: wsPort,
      wssPort: wsPort,
      forceTLS: isSecure,
      enabledTransports: isSecure ? ['wss'] : ['ws'],
      disableStats: true,
      authEndpoint: authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      isConnecting = false;
    }, 3000);

    return echoInstance;
  } catch (error) {
    console.error = console.error || (() => {});
    console.warn = console.warn || (() => {});
    console.log = console.log || (() => {});
    isConnecting = false;
    currentToken = null;
    throw error;
  }
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
  isConnecting = false;
};
