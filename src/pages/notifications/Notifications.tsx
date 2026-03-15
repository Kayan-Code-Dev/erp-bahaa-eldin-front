import { useState, memo, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  useGetNotificationsQueryOptions,
  useMarkNotificationAsReadMutationOptions,
  useMarkAllNotificationsAsReadMutationOptions,
} from '@/api/v2/notifications/notifications.hooks';
import { Notification } from '@/api/v2/notifications/notifications.types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { normalizeNotificationActionUrl } from '@/utils/notificationActionUrl';
import { getOrderTypeLabel } from '@/api/v2/orders/order.utils';

const PER_PAGE = 15;

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
    'SupplierOrder': 'أمر توريد',
    'supplier_order': 'أمر توريد',
    'Order': 'الطلب',
    'order': 'الطلب',
    'Payment': 'دفعة',
    'payment': 'دفعة',
    'Expense': 'مصروف',
    'expense': 'مصروف',
    'Return': 'إرجاع',
    'return': 'إرجاع',
    'system': 'نظام',
    'alert': 'تنبيه',
    'info': 'معلومة',
    'warning': 'تحذير',
  };
  return typeMap[type] || type;
};

const amountMetadataKeys = new Set(['amount', 'order_paid', 'order_remaining', 'total_price', 'total_amount', 'payment_amount']);

function formatMetadataValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (key === 'order_type') return getOrderTypeLabel(value as 'rent' | 'buy' | 'tailoring' | 'mixed' | 'unknown');
  if (amountMetadataKeys.has(key)) {
    const n = Number(value);
    if (!Number.isNaN(n)) return `${n.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
  }
  return String(value);
}

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'created': 'تم إنشاء الطلب',
    'paid': 'مدفوع',
    'partially_paid': 'مدفوع جزئياً',
    'canceled': 'ملغي',
    'delivered': 'تم تسليم الطلب',
    'returned': 'مرتجع',
    'overdue': 'متأخر',
    'pending': 'قيد الانتظار',
  };
  return statusMap[status] || status;
};

const getStatusVariant = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'partially_paid':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'canceled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'returned':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'overdue':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'created':
    case 'delivered':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

const NotificationListItem = memo(function NotificationListItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}) {
  const navigate = useNavigate();
  const isRead = !!notification.read_at;
  const priority = notification.priority || 'normal';

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(notification.created_at), {
      addSuffix: true,
      locale: ar,
    });
  }, [notification.created_at]);

  const orderStatus = useMemo(() => {
    const metadata = notification.metadata as Record<string, any> | undefined;
    if (!metadata) return null;
    return (metadata.status || metadata.new_status || metadata.newStatus || null) as string | null;
  }, [notification.metadata]);

  const orderType = useMemo(() => {
    const metadata = notification.metadata as Record<string, any> | undefined;
    return (metadata?.order_type ?? null) as string | null;
  }, [notification.metadata]);

  const metadataEntries = useMemo(() => {
    if (!notification.metadata) return [];
    return Object.entries(notification.metadata).filter(
      ([key]) =>
        key !== 'order_id' &&
        key !== 'client_id' &&
        key !== 'status' &&
        key !== 'new_status' &&
        key !== 'old_status'
    );
  }, [notification.metadata]);

  const metadataKeyLabels: Record<string, string> = {
    total_price: 'المبلغ الإجمالي',
    amount: 'المبلغ',
    order_paid: 'المدفوع',
    order_remaining: 'المتبقي',
    order_type: 'النوع',
    payment_id: 'رقم الدفعة',
    reference_id: 'رقم المرجع',
    supplier_id: 'رقم المورد',
    total_amount: 'الإجمالي',
    clothes_count: 'عدد الأصناف',
    payment_amount: 'المدفوع',
    supplier_order_id: 'رقم أمر التوريد',
  };

  const isPaymentReference = useMemo(() => {
    const rt = notification.reference_type ?? '';
    return rt.includes('Payment') || rt === 'payment';
  }, [notification.reference_type]);

  const typeLabel = useMemo(() => {
    return getNotificationTypeLabel(notification.type);
  }, [notification.type]);

  const referenceTypeDisplay = useMemo(() => {
    const rt = notification.reference_type ?? '';
    return rt.replace(/^App\\Models\\/i, '') || '';
  }, [notification.reference_type]);

  const handleClick = useCallback(() => {
    if (!isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url || notification.metadata?.supplier_id != null) {
      navigate(normalizeNotificationActionUrl(notification.action_url, notification.metadata));
    }
  }, [isRead, notification.id, notification.action_url, notification.metadata, onMarkAsRead, navigate]);

  const handleMarkAsReadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);

  return (
    <div
      dir="rtl"
      className={cn(
        'relative group px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer border-b last:border-b-0',
        !isRead && 'bg-accent/30'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Read/Unread Indicator */}
        <button
          onClick={handleMarkAsReadClick}
          className="mt-1 shrink-0"
          aria-label={isRead ? 'تم القراءة' : 'تحديد كمقروء'}
        >
          {isRead ? (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-primary" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-visible">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                'text-sm font-medium line-clamp-1',
                !isRead && 'font-semibold'
              )}
            >
              {notification.title?.trim()
                ? notification.title
                : (notification.reference_type?.includes('SupplierOrder') || notification.type?.toLowerCase().includes('supplier'))
                  ? 'أمر توريد جديد'
                  : 'إشعار'}
            </h4>
          </div>

          {orderType && (
            <div className="mb-2 w-full py-2 px-3 rounded-lg bg-sky-100 dark:bg-sky-950/50 border border-sky-300/60 dark:border-sky-700/50 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-sky-700 dark:text-sky-300">النوع</span>
              <span className="text-sm font-bold text-sky-800 dark:text-sky-200 shrink-0">
                {getOrderTypeLabel(orderType as 'rent' | 'buy' | 'tailoring' | 'mixed' | 'unknown')}
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* Metadata Display */}
          {metadataEntries.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {metadataEntries.map(([key, value]) => {
                const label = metadataKeyLabels[key] || key;
                const displayValue = formatMetadataValue(key, value);

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
          {(notification.reference_type || notification.reference_id) && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isPaymentReference && notification.reference_id ? (
                <div className="py-1.5 px-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300/60 dark:border-emerald-700/50">
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    دفعة #{notification.reference_id}
                  </span>
                </div>
              ) : (
                <>
                  {referenceTypeDisplay && (
                    <div className="py-1.5 px-3 rounded-lg bg-violet-100 dark:bg-violet-950/50 border border-violet-300/60 dark:border-violet-700/50">
                      <span className="text-sm font-bold text-violet-800 dark:text-violet-200">
                        نوع المرجع: {getNotificationTypeLabel(referenceTypeDisplay) || referenceTypeDisplay}
                      </span>
                    </div>
                  )}
                  {notification.reference_id != null && (
                    <div className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300/60 dark:border-slate-600/50">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        الرقم: {notification.reference_id}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Order Status Badge */}
              {orderStatus && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    getStatusVariant(orderStatus)
                  )}
                >
                  {getStatusLabel(orderStatus)}
                </span>
              )}

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
              <span className="text-xs text-muted-foreground" title={new Date(notification.created_at).toLocaleString('ar-SA')}>
                {timeAgo}
              </span>
            </div>

            {/* Action Button */}
            {(notification.action_url || notification.metadata?.supplier_id != null) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(normalizeNotificationActionUrl(notification.action_url, notification.metadata));
                }}
              >
                عرض
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function Notifications() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const unreadOnly = tab === 'unread';

  const { data, isPending, isError } = useQuery(
    useGetNotificationsQueryOptions({
      page,
      per_page: PER_PAGE,
      unread_only: unreadOnly,
    })
  );

  const markAsReadMutation = useMutation(
    useMarkNotificationAsReadMutationOptions()
  );
  const markAllAsReadMutation = useMutation(
    useMarkAllNotificationsAsReadMutationOptions()
  );
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id, {
      onSuccess: () => {
        toast.success('تم تحديد الإشعار كمقروء');
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('تم تحديد جميع الإشعارات كمقروءة');
      },
    });
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  return (
    <div dir="rtl" className="container mx-auto p-4">
      <Tabs value={tab} onValueChange={(v) => {
        setTab(v as 'all' | 'unread');
        setPage(1);
      }}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex w-full items-start justify-between gap-6">
              <TabsList className="shrink-0">
                <TabsTrigger value="all">
                  الكل ({data?.meta.total || 0})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  غير المقروء ({data?.meta.unread || 0})
                </TabsTrigger>
              </TabsList>
              <div className="min-w-0 shrink-0 text-right">
                <CardTitle dir="rtl" className="text-lg font-semibold">
                  الإشعارات
                </CardTitle>
                <CardDescription className="mt-1">
                  {data?.meta.total
                    ? `إجمالي الإشعارات: ${data.meta.total} (مقروء: ${data.meta.read}، غير مقروء: ${data.meta.unread})`
                    : 'لا توجد إشعارات'}
                </CardDescription>
                {data && data.meta.unread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 me-2" />
                    تحديد الكل كمقروء
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="all" className="mt-0">
              {isPending ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    حدث خطأ في جلب الإشعارات
                  </p>
                </div>
              ) : !data || data.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {unreadOnly
                      ? 'لا توجد إشعارات غير مقروءة'
                      : 'لا توجد إشعارات'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0 rounded-lg border">
                  {data.data.map((notification) => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              {isPending ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    حدث خطأ في جلب الإشعارات
                  </p>
                </div>
              ) : !data || data.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد إشعارات غير مقروءة
                  </p>
                </div>
              ) : (
                <div className="space-y-0 rounded-lg border">
                  {data.data.map((notification) => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>

          {data && data.total > 0 && (
            <CardFooter className="flex flex-nowrap items-center justify-between gap-4 border-t pt-4">
              <div className="text-sm text-muted-foreground text-right shrink-0">
                عرض {data.data.length} من {data.total} إشعار
              </div>
              <Pagination className="shrink-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNextPage();
                      }}
                      aria-disabled={page === data.total_pages || isPending}
                      className={
                        page === data.total_pages || isPending
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                  <PaginationItem className="font-medium">
                    صفحة {page} من {data.total_pages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePreviousPage();
                      }}
                      aria-disabled={page === 1}
                      className={
                        page === 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      </Tabs>
    </div>
  );
}

export default Notifications;
