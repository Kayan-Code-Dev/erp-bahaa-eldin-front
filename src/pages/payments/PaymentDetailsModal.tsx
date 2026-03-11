import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TPayment } from "@/api/v2/payments/payments.types";
import { formatDate } from "@/utils/formatDate";

type Props = {
  payment: TPayment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "معلق",
    paid: "مدفوع",
    canceled: "ملغي",
  };
  return statusMap[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return classMap[status] || "";
};

const getPaymentTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    initial: "مبدئي",
    fee: "رسوم",
    normal: "عادي",
  };
  return typeMap[type] || type;
};

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م`;
};

const getClientName = (
  client:
    | {
        name?: string;
        first_name?: string;
        middle_name?: string;
        last_name?: string;
      }
    | null
    | undefined
) => {
  if (!client) return "—";
  if (typeof client.name === "string" && client.name.trim()) return client.name.trim();
  const parts = [client.first_name, client.middle_name, client.last_name].filter(
    Boolean
  ) as string[];
  return parts.length ? parts.join(" ").trim() : "—";
};

export function PaymentDetailsModal({ payment, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تفاصيل الدفعة</DialogTitle>
          <DialogDescription>
            عرض جميع تفاصيل الدفعة رقم {payment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">رقم الدفعة</Label>
              <p className="font-medium">{payment.id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">رقم الطلب</Label>
              <p className="font-medium">{payment.order_id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">المبلغ</Label>
              <p className="font-medium text-lg">
                {formatMoney(payment.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">الحالة</Label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                  payment.status
                )}`}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">نوع الدفعة</Label>
              <p className="font-medium">
                {getPaymentTypeLabel(payment.payment_type)}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">تاريخ الدفع</Label>
              <p className="font-medium">{formatDate(payment.payment_date)}</p>
            </div>
          </div>

          {/* Client Information */}
          {payment.order?.client && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">معلومات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">اسم العميل</Label>
                  <p className="font-medium">
                    {getClientName(payment.order.client)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">الرقم القومي</Label>
                  <p className="font-medium">
                    {payment.order.client.national_id}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">مصدر العميل</Label>
                  <p className="font-medium">
                    {payment.order.client.source ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Information */}
          {payment.order && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">معلومات الطلب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">رقم الطلب</Label>
                  <p className="font-medium">{payment.order.id}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">إجمالي الطلب</Label>
                  <p className="font-medium">
                    {formatMoney(payment.order.total_price)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">حالة الطلب</Label>
                  <p className="font-medium">
                    {payment.order.status}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">إجمالي المدفوع</Label>
                  <p className="font-medium">
                    {formatMoney(payment.order.paid)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">المتبقي على الطلب</Label>
                  <p className="font-medium">
                    {formatMoney(payment.order.remaining)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">موعد الاستلام</Label>
                  <p className="font-medium">
                    {payment.order.delivery_date
                      ? formatDate(payment.order.delivery_date)
                      : "—"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">تاريخ المناسبة</Label>
                  <p className="font-medium">
                    {payment.order.occasion_datetime
                      ? formatDate(payment.order.occasion_datetime)
                      : "—"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">موعد الاسترجاع</Label>
                  <p className="font-medium">
                    {payment.order.visit_datetime
                      ? formatDate(payment.order.visit_datetime)
                      : "—"}
                  </p>
                </div>

                {payment.order.order_notes && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">ملاحظات الطلب</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {payment.order.order_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Information */}
          {payment.user && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">معلومات المستخدم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">اسم المستخدم</Label>
                  <p className="font-medium">{payment.user.name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                  <p className="font-medium">{payment.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cashbox Snapshot */}
          {(payment.cashbox_id != null ||
            payment.cashbox_balance_before != null ||
            payment.cashbox_balance_after != null ||
            payment.cashbox_snapshot_meta) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">معلومات الخزنة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">الصندوق</Label>
                  <p className="font-medium">
                    {payment.cashbox_snapshot_meta?.cashbox_name ??
                      (payment.cashbox_id != null
                        ? `#${payment.cashbox_id}`
                        : "—")}
                  </p>
                </div>

                {payment.cashbox_balance_before != null && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      الرصيد قبل الدفعة
                    </Label>
                    <p className="font-medium">
                      {formatMoney(payment.cashbox_balance_before)}
                    </p>
                  </div>
                )}

                {payment.cashbox_balance_after != null && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      الرصيد بعد الدفعة
                    </Label>
                    <p className="font-medium">
                      {formatMoney(payment.cashbox_balance_after)}
                    </p>
                  </div>
                )}

                {payment.cashbox_daily_income_total != null && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      إجمالي إيرادات اليوم للصندوق
                    </Label>
                    <p className="font-medium">
                      {formatMoney(payment.cashbox_daily_income_total)}
                    </p>
                  </div>
                )}

                {payment.cashbox_daily_expense_total != null && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      إجمالي مصروفات اليوم للصندوق
                    </Label>
                    <p className="font-medium">
                      {formatMoney(payment.cashbox_daily_expense_total)}
                    </p>
                  </div>
                )}

                {payment.cashbox_snapshot_meta && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        رصيد بداية اليوم
                      </Label>
                      <p className="font-medium">
                        {formatMoney(payment.cashbox_snapshot_meta.opening_balance)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        رصيد نهاية اليوم
                      </Label>
                      <p className="font-medium">
                        {formatMoney(payment.cashbox_snapshot_meta.closing_balance)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">صافي التغير</Label>
                      <p className="font-medium">
                        {formatMoney(payment.cashbox_snapshot_meta.net_change)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        عدد المعاملات في اليوم
                      </Label>
                      <p className="font-medium">
                        {payment.cashbox_snapshot_meta.transaction_count}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        عدد عكس المعاملات
                      </Label>
                      <p className="font-medium">
                        {payment.cashbox_snapshot_meta.reversal_count}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">الملاحظات</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">التواريخ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">تاريخ الإنشاء</Label>
                <p className="font-medium">{formatDate(payment.created_at)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">تاريخ التحديث</Label>
                <p className="font-medium">{formatDate(payment.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

