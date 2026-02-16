import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally
(window as any).Pusher = Pusher;

let echoInstance: Echo<any> | null = null;
let currentToken: string | null = null;
let isConnecting = false;

export const initializeEcho = (token: string): Echo<any> => {
  // If we already have an instance with the same token, return it
  if (echoInstance && currentToken === token && !isConnecting) {
    return echoInstance;
  }

  // If we're already connecting, wait a bit and return existing instance
  if (isConnecting && echoInstance) {
    return echoInstance;
  }

  // Dispose existing instance if token changed
  if (echoInstance && currentToken !== token) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    echoInstance = null;
  }

  // Validate required environment variables
  const appKey = import.meta.env.VITE_REVERB_APP_KEY;
  const wsHost = import.meta.env.VITE_REVERB_HOST;
  const wsPort = import.meta.env.VITE_REVERB_PORT;

  if (!appKey) {
    throw new Error(
      'VITE_REVERB_APP_KEY is not defined. Please add it to your .env file.'
    );
  }

  if (!wsHost) {
    throw new Error(
      'VITE_REVERB_HOST is not defined. Please add it to your .env file.'
    );
  }

  if (!wsPort) {
    throw new Error(
      'VITE_REVERB_PORT is not defined. Please add it to your .env file.'
    );
  }

  // Get base URL without /api/v1 suffix for broadcasting auth
  const baseURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/v\d+$/, '') || '';
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const isSecure = scheme === 'https';
  const wsPortNum = Number(wsPort);
  
  // Silently initialize WebSocket connection
  // No logging to keep console clean - WebSocket is optional
  
  isConnecting = true;
  currentToken = token;
  
  try {
    // Suppress Pusher console errors by overriding console methods BEFORE creating Echo
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Override console methods to suppress WebSocket errors
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Filter out WebSocket connection errors
      if (
        message.includes('WebSocket connection') ||
        message.includes('ws://localhost:8080') ||
        message.includes('wss://localhost:8080') ||
        message.includes('pusher') ||
        message.includes('failed:')
      ) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Filter out WebSocket warnings
      if (
        message.includes('WebSocket') ||
        message.includes('ws://') ||
        message.includes('wss://')
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };
    
    // Also suppress console.log for WebSocket messages
    console.log = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('WebSocket connection') ||
        message.includes('ws://localhost:8080') ||
        message.includes('pusher')
      ) {
        return; // Suppress these logs
      }
      originalLog.apply(console, args);
    };
    
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: wsHost,
      wsPort: wsPortNum,
      wssPort: wsPortNum,
      forceTLS: isSecure,
      enabledTransports: isSecure ? ['wss'] : ['ws'],
      disableStats: true,
      authEndpoint: `${baseURL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Restore console methods after Echo is created
    // Pusher connects asynchronously, so we need to keep suppression active longer
    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      isConnecting = false;
    }, 3000);

    return echoInstance;
  } catch (error) {
    // Restore console methods on error
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
    } catch (e) {
      // Ignore disconnect errors
    }
    echoInstance = null;
  }
  currentToken = null;
  isConnecting = false;
};
