/// <reference types="vite/client" />

declare global {
  interface Window {
    Pusher: typeof import('pusher-js');
    Echo: typeof import('laravel-echo');
  }
}

export {};
