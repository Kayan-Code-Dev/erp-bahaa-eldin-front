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
      console.log('🔌 WebSocket: المستخدم غير مسجل دخول - إيقاف الاتصال');
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

    if (setupRef.current) {
      console.log('🔌 WebSocket: الإعداد قيد التنفيذ بالفعل - تخطي');
      return;
    }

    let mounted = true;
    setupRef.current = true;

    const setupNotifications = async () => {
      try {
        console.log('🚀 WebSocket: بدء إعداد الاتصال...');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) {
          console.log('🔌 WebSocket: تم إلغاء الإعداد - المكون غير مثبت');
          return;
        }

        const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
        console.log(`🔌 WebSocket: حالة التفعيل = ${enableWebSocket ? 'مفعل' : 'معطل'}`);
        
        if (!enableWebSocket) {
          console.warn('⚠️ WebSocket: معطل في الإعدادات - الإشعارات الفورية غير متاحة');
          return;
        }

        let echo;
        try {
          console.log('🔌 WebSocket: محاولة تهيئة الاتصال...');
          echo = initializeEcho(loginData.token);
          console.log('✅ WebSocket: تم تهيئة Echo بنجاح');
        } catch (initError: any) {
          console.error('❌ WebSocket: فشل تهيئة الاتصال:', initError?.message || initError);
          if (import.meta.env.DEV) {
            console.warn('⚠️ WebSocket: سيتم المتابعة بدون إشعارات فورية');
          }
          return;
        }
        
        echoRef.current = echo;
        const adminId = loginData.user.id;
        console.log(`🔌 WebSocket: معرف المستخدم = ${adminId}`);

        const pusher = echo.connector.pusher;
        console.log('🔌 WebSocket: ربط أحداث الاتصال...');
        
        pusher.connection.bind('connected', () => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            console.log('✅ WebSocket: تم الاتصال بنجاح - الإشعارات الفورية مفعلة');
            console.log('📡 WebSocket: حالة الاتصال = متصل');
          });
        });

        pusher.connection.bind('disconnected', () => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            console.warn('⚠️ WebSocket: تم قطع الاتصال - الإشعارات الفورية غير متاحة');
            console.log('📡 WebSocket: حالة الاتصال = منقطع');
          });
        });

        pusher.connection.bind('error', (error: any) => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            console.error('❌ WebSocket: خطأ في الاتصال:', error);
            console.error('❌ WebSocket: تفاصيل الخطأ:', {
              error: error?.error || error,
              type: error?.type || 'unknown',
              data: error?.data || null,
            });
          });
        });

        pusher.connection.bind('state_change', (states: any) => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            console.log('🔄 WebSocket: تغيير حالة الاتصال:', {
              previous: states.previous,
              current: states.current,
            });
            if (states.current === 'connected') {
              warningShownRef.current = false;
            }
          });
        });

        // Channel name should be 'admin.{userId}' without 'private-' prefix
        // because echo.private() automatically adds 'private-' prefix
        const channelName = `admin.${adminId}`;
        console.log(`🔌 WebSocket: محاولة الاشتراك في القناة: ${channelName}`);
        console.log(`🔌 WebSocket: القناة الفعلية ستكون: private-${channelName}`);
        
        const channel = echo.private(channelName);

        // Listen to all events for debugging
        channel.listenToAll((eventName: string, data: any) => {
          console.log('🔍 WebSocket: حدث عام:', {
            eventName,
            data,
            channel: channelName,
          });
        });

        channel
          .subscribed(() => {
            requestAnimationFrame(() => {
              if (!mounted) return;
              console.log(`✅ WebSocket: تم الاشتراك في قناة الإشعارات بنجاح: ${channelName}`);
              console.log('📡 WebSocket: جاهز لاستقبال الإشعارات');
              
              // Verify channel subscription status
              const pusher = echo.connector.pusher;
              const subscribedChannels = pusher?.channels?.channels || {};
              console.log('🔍 WebSocket: القنوات المشترك فيها:', {
                channels: Object.keys(subscribedChannels),
                currentChannel: channelName,
                isSubscribed: !!subscribedChannels[channelName],
              });
            });
          })
          .error((error: any) => {
            requestAnimationFrame(() => {
              if (!mounted) return;
              console.error(`❌ WebSocket: فشل الاشتراك في القناة: ${channelName}`);
              console.error('❌ WebSocket: تفاصيل خطأ الاشتراك:', {
                type: error?.type || 'unknown',
                error: error?.error || error,
                status: error?.status || 'unknown',
                message: error?.message || error?.error || 'خطأ غير معروف',
                fullError: error,
              });
              
              const echo = echoRef.current;
              if (echo) {
                const pusher = echo.connector.pusher;
                const config = (pusher as any).config || {};
                console.error('❌ WebSocket: معلومات المصادقة:', {
                  authEndpoint: config.authEndpoint || config.auth?.endpoint || 'غير محدد',
                  wsHost: config.wsHost,
                  wsPort: config.wsPort,
                  wsPath: config.wsPath,
                  enabledTransports: config.enabledTransports,
                });
                
                const channelAuthorizer = (pusher as any).channelAuthorizer;
                if (channelAuthorizer) {
                  console.error('❌ WebSocket: معلومات Channel Authorizer:', {
                    endpoint: channelAuthorizer.endpoint || 'غير محدد',
                    headers: channelAuthorizer.headers || {},
                  });
                }
              }
              
              console.error('❌ WebSocket: ملاحظات:', {
                note1: '404 يعني أن الـ endpoint غير موجود في الباك اند',
                note2: 'الـ endpoint الافتراضي: /broadcasting/auth (ليس تحت /api/v1)',
                note3: 'تأكد من تفعيل BroadcastServiceProvider في Laravel',
                note4: 'إذا كان لديك endpoint مخصص، قم بتحديثه في echo.ts',
              });
            });
          });

        // Listen to both event name formats (with and without dot prefix)
        channel.listen('.admin.notification', (data: any) => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            
            try {
              const notificationTitle = data.title || 'إشعار جديد';
              const notificationMessage = data.message || '';
              
              console.log('🔔 إشعار جديد (.admin.notification):', {
                title: notificationTitle,
                message: notificationMessage,
                type: data.type || 'system',
                timestamp: data.timestamp || new Date().toISOString(),
                data: data.data || {},
              });
              
              addNotification({
                title: notificationTitle,
                message: notificationMessage,
                type: data.type || 'system',
                data: data.data || {},
                timestamp: data.timestamp || new Date().toISOString(),
              });

              if (invalidationTimeoutRef.current) {
                clearTimeout(invalidationTimeoutRef.current);
              }

              invalidationTimeoutRef.current = setTimeout(() => {
                if (!mounted) return;
                try {
                  queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
                  queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
                } catch {
                  // Ignore invalidation errors
                } finally {
                  invalidationTimeoutRef.current = null;
                }
              }, 300);
            } catch {
              // Ignore notification processing errors
            }
          });
        });

        // Also listen to 'admin.notification' (without dot prefix)
        channel.listen('admin.notification', (data: any) => {
          requestAnimationFrame(() => {
            if (!mounted) return;
            
            try {
              const notificationTitle = data.title || 'إشعار جديد';
              const notificationMessage = data.message || '';
              
              console.log('🔔 إشعار جديد (admin.notification):', {
                title: notificationTitle,
                message: notificationMessage,
                type: data.type || 'system',
                timestamp: data.timestamp || new Date().toISOString(),
                data: data.data || {},
              });
              
              addNotification({
                title: notificationTitle,
                message: notificationMessage,
                type: data.type || 'system',
                data: data.data || {},
                timestamp: data.timestamp || new Date().toISOString(),
              });

              if (invalidationTimeoutRef.current) {
                clearTimeout(invalidationTimeoutRef.current);
              }

              invalidationTimeoutRef.current = setTimeout(() => {
                if (!mounted) return;
                try {
                  queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
                  queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
                } catch {
                  // Ignore invalidation errors
                } finally {
                  invalidationTimeoutRef.current = null;
                }
              }, 300);
            } catch {
              // Ignore notification processing errors
            }
          });
        });

        channelRef.current = channel;
        console.log('✅ WebSocket: اكتمل الإعداد بنجاح');
      } catch (error: any) {
        console.error('❌ WebSocket: خطأ أثناء إعداد الاتصال:', error);
        console.error('❌ WebSocket: تفاصيل الخطأ:', {
          message: error?.message || 'خطأ غير معروف',
          stack: error?.stack || null,
          error: error,
        });
        if (import.meta.env.DEV) {
          console.warn('⚠️ WebSocket: سيتم المتابعة بدون إشعارات فورية');
        }
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
      setupRef.current = false;
      
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
    };
  }, [isAuthenticated, loginData?.token, loginData?.user?.id, addNotification, queryClient]);

  useEffect(() => {
    if (!isAuthenticated) {
      setupRef.current = false;
      
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
