import { memo, useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCircle2, Circle, ExternalLink, X } from 'lucide-react';
import { useNotificationsStore } from '@/zustand-stores/notifications.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    data?: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      reference_type?: string;
      reference_id?: number;
      action_url?: string;
      metadata?: Record<string, any>;
    };
    timestamp: string;
    read: boolean;
  };
  onActionClick?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  normal: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Translate notification types to Arabic
const getNotificationTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'order_status': 'حالة الطلب',
    'order_created': 'طلب جديد',
    'order_updated': 'تحديث الطلب',
    'payment_received': 'استلام دفعة',
    'delivery_scheduled': 'جدولة التسليم',
    'return_processed': 'معالجة الإرجاع',
    'expense_approved': 'موافقة على مصروف',
    'expense_rejected': 'رفض مصروف',
    'system': 'نظام',
    'alert': 'تنبيه',
    'info': 'معلومة',
    'warning': 'تحذير',
  };
  return typeMap[type] || type;
};

export const NotificationItem = memo(function NotificationItem({
  notification,
  onActionClick,
}: NotificationItemProps) {
  const { markAsRead, removeNotification } = useNotificationsStore();

  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  }, [notification.id, markAsRead]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  }, [notification.id, removeNotification]);

  const handleClick = useCallback(() => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (onActionClick && notification.data?.action_url) {
      onActionClick();
    }
  }, [notification.read, notification.id, notification.data?.action_url, markAsRead, onActionClick]);

  const priority = notification.data?.priority || 'normal';
  
  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(notification.timestamp), {
      addSuffix: true,
      locale: ar,
    });
  }, [notification.timestamp]);

  const metadataEntries = useMemo(() => {
    if (!notification.data?.metadata) return [];
    return Object.entries(notification.data.metadata)
      .filter(([key]) => key !== 'order_id' && key !== 'client_id');
  }, [notification.data?.metadata]);

  const typeLabel = useMemo(() => {
    return getNotificationTypeLabel(notification.type);
  }, [notification.type]);

  const referenceTypeDisplay = useMemo(() => {
    return notification.data?.reference_type?.replace(/^App\\Models\\/, '') || '';
  }, [notification.data?.reference_type]);

  return (
    <div
      className={cn(
        'relative group px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer',
        !notification.read && 'bg-accent/30'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Read/Unread Indicator */}
        <button
          onClick={handleMarkAsRead}
          className="mt-1 shrink-0"
          aria-label={notification.read ? 'تم القراءة' : 'تحديد كمقروء'}
        >
          {notification.read ? (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Circle className="h-4 w-4 text-primary" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                'text-sm font-medium line-clamp-1',
                !notification.read && 'font-semibold'
              )}
            >
              {notification.title}
            </h4>
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 hover:bg-destructive/10 rounded"
              aria-label="حذف الإشعار"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* Metadata Display */}
          {metadataEntries.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {metadataEntries.map(([key, value]) => {
                // Translate common metadata keys to Arabic
                const keyLabels: Record<string, string> = {
                  status: 'الحالة',
                  total_price: 'المبلغ الإجمالي',
                  amount: 'المبلغ',
                  reference_id: 'رقم المرجع',
                };
                
                const label = keyLabels[key] || key;
                const displayValue = value !== null && value !== undefined ? String(value) : '-';
                
                return (
                  <span
                    key={key}
                    className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    <span className="font-medium">{label}:</span> {displayValue}
                  </span>
                );
              })}
            </div>
          )}

          {/* Reference Info */}
          {(notification.data?.reference_type || notification.data?.reference_id) && (
            <div className="mb-2 text-xs text-muted-foreground">
              {referenceTypeDisplay && (
                <span className="mr-2">
                  النوع: {referenceTypeDisplay}
                </span>
              )}
              {notification.data.reference_id && (
                <span>الرقم: {notification.data.reference_id}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Badge */}
              {priority && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal
                  )}
                >
                  {priority === 'urgent'
                    ? 'عاجل'
                    : priority === 'high'
                    ? 'مهم'
                    : priority === 'low'
                    ? 'منخفض'
                    : 'عادي'}
                </span>
              )}

              {/* Type Badge */}
              {notification.type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {typeLabel}
                </span>
              )}

              {/* Time */}
              <span className="text-xs text-muted-foreground" title={new Date(notification.timestamp).toLocaleString('ar-SA')}>
                {timeAgo}
              </span>
            </div>

            {/* Action Button */}
            {notification.data?.action_url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick?.();
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                عرض
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
