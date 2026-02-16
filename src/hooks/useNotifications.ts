import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/zustand-stores/auth.store';
import { useNotificationsStore } from '@/zustand-stores/notifications.store';
import { initializeEcho, disconnectEcho } from '@/lib/echo';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATIONS_KEY, UNREAD_COUNT_KEY } from '@/api/v2/notifications/notifications.hooks';

export function useNotifications() {
  const { isAuthenticated, loginData } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const echoRef = useRef<any>(null);
  const setupRef = useRef<boolean>(false);
  const warningShownRef = useRef<boolean>(false);
  const invalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !loginData?.token || !loginData?.user?.id) {
      // Disconnect if not authenticated
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.admin.notification');
        } catch {
          // Ignore errors during cleanup
        }
        channelRef.current = null;
      }
      disconnectEcho();
      echoRef.current = null;
      setupRef.current = false;
      warningShownRef.current = false;
      return;
    }

    // Prevent multiple setups
    if (setupRef.current) {
      return;
    }

    let mounted = true;
    setupRef.current = true;

    const setupNotifications = async () => {
      try {
        // Small delay to prevent rapid re-initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        // Check if WebSocket is enabled (optional - can be disabled if no backend)
        const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
        
        if (!enableWebSocket) {
          // WebSocket is disabled - app works normally without real-time notifications
          return;
        }

        // Initialize Echo connection
        // Wrap in try-catch to handle connection errors gracefully
        let echo;
        try {
          echo = initializeEcho(loginData.token);
        } catch (initError) {
          // If initialization fails, continue without WebSocket
          if (import.meta.env.DEV) {
            console.warn('WebSocket initialization skipped - app will work normally');
          }
          return;
        }
        
        echoRef.current = echo;
        const adminId = loginData.user.id;

        // Handle connection events BEFORE subscribing
        const pusher = echo.connector.pusher;
        
        pusher.connection.bind('connected', () => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            // WebSocket connected - notifications will work now
          });
        });

        pusher.connection.bind('disconnected', () => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            // WebSocket disconnected - app continues to work normally
          });
        });

        pusher.connection.bind('error', () => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            // Silently handle connection errors - WebSocket is optional
            // The app will work fine without it, just without real-time notifications
          });
        });

        pusher.connection.bind('state_change', (states: any) => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            
            // Reset warning flag when connected successfully
            if (states.current === 'connected') {
              warningShownRef.current = false;
            }
          });
        });

        // Subscribe to admin channel
        const channel = echo.private(`private-admin.${adminId}`);

        // Wait for subscription to be ready
        channel
          .subscribed(() => {
            requestAnimationFrame(() => {
              if (!mounted) return;
              // Successfully subscribed to notifications channel
            });
          })
          .error(() => {
            requestAnimationFrame(() => {
              if (!mounted) return;
              // Silently handle subscription errors - WebSocket is optional
              // The app will continue to work without real-time notifications
            });
          });

        // Listen for notifications
        channel.listen('.admin.notification', (data: any) => {
          // Use requestAnimationFrame to ensure async handling doesn't cause issues
          requestAnimationFrame(() => {
            if (!mounted) return;
            
            try {
              // Add to local store immediately (lightweight operation)
              addNotification({
                title: data.title || 'إشعار جديد',
                message: data.message || '',
                type: data.type || 'system',
                data: data.data || {},
                timestamp: data.timestamp || new Date().toISOString(),
              });

              // Debounce API invalidation to avoid multiple rapid calls
              // Clear existing timeout if there is one
              if (invalidationTimeoutRef.current) {
                clearTimeout(invalidationTimeoutRef.current);
              }

              // Schedule invalidation with debounce (wait 300ms for more notifications)
              invalidationTimeoutRef.current = setTimeout(() => {
                if (!mounted) return;
                try {
                  // Batch invalidations together
                  queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
                  queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
                } catch (error) {
                  // Silently handle invalidation errors
                } finally {
                  invalidationTimeoutRef.current = null;
                }
              }, 300);
            } catch (error) {
              // Silently handle notification processing errors
            }
          });
        });

        channelRef.current = channel;
      } catch (error: any) {
        // Silently handle setup errors - WebSocket is optional
        // The app will continue to work without real-time notifications
        // Only log in development mode for debugging
        if (import.meta.env.DEV) {
          console.warn('WebSocket notifications unavailable - app will work normally without real-time notifications');
        }
      }
    };

    setupNotifications();

    // Cleanup on unmount
    return () => {
      mounted = false;
      setupRef.current = false;
      
      // Clear any pending invalidation timeout
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
        invalidationTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.admin.notification');
        } catch {
          // Ignore errors during cleanup
        }
        channelRef.current = null;
      }
      // Don't disconnect Echo here as it might be used elsewhere
      // The disconnect will happen when user logs out
    };
  }, [isAuthenticated, loginData?.token, loginData?.user?.id, addNotification]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setupRef.current = false;
      
      // Clear any pending invalidation timeout
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
        invalidationTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.admin.notification');
        } catch {
          // Ignore errors during cleanup
        }
        channelRef.current = null;
      }
      disconnectEcho();
      echoRef.current = null;
    }
  }, [isAuthenticated]);
}
