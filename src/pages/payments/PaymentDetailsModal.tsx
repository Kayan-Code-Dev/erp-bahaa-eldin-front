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

const getClientName = (client: {
  first_name: string;
  middle_name: string;
  last_name: string;
}) => {
  return `${client.first_name} ${client.middle_name} ${client.last_name}`.trim();
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
                {payment.amount.toLocaleString()} ج.م
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
                  <Label className="text-muted-foreground">تاريخ الميلاد</Label>
                  <p className="font-medium">
                    {payment.order.client.date_of_birth}
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
                    {payment.order.total_price.toLocaleString()} ج.م
                  </p>
                </div>
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

