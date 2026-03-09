import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TTransaction } from "@/api/v2/transactions/transactions.types";
import { formatDateTime } from "@/utils/formatDate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TTransaction | null;
};

const formatMoney = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م`;
};

const getCategoryLabel = (category: TTransaction["category"]) => {
  switch (category) {
    case "payment":
      return "دفعة عميل";
    case "expense":
      return "مصروف";
    case "salary_expense":
      return "راتب / رواتب";
    case "receivable_payment":
      return "تحصيل مستحقات";
    default:
      return category;
  }
};

export function CashboxTransactionDetailsModal({
  open,
  onOpenChange,
  transaction,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الحركة المالية</DialogTitle>
        </DialogHeader>

        {transaction ? (
          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">رقم الحركة</Label>
                <p className="font-medium">#{transaction.id}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">التاريخ</Label>
                <p className="font-medium">
                  {formatDateTime(transaction.created_at)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">الصندوق</Label>
                <p className="font-medium">
                  {transaction.cashbox?.name ?? `#${transaction.cashbox_id}`}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">نوع الحركة</Label>
                <p className="font-medium">
                  {transaction.type === "income" ? "إيراد" : "مصروف"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">التصنيف</Label>
                <p className="font-medium">
                  {getCategoryLabel(transaction.category)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">المبلغ</Label>
                <p className="font-medium">{formatMoney(transaction.amount)}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">الرصيد قبل الحركة</Label>
                <p className="font-medium">
                  {formatMoney(transaction.cashbox_balance_before)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">الرصيد بعد الحركة</Label>
                <p className="font-medium">
                  {formatMoney(transaction.balance_after)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">الوصف</Label>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {transaction.description || "—"}
              </p>
            </div>

            {transaction.metadata &&
              Object.keys(transaction.metadata).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    البيانات الإضافية
                  </Label>
                  {/* عرض ذكي لبعض الحقول الشائعة، مع إمكانية الرجوع إلى JSON خام إذا لزم */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {"supplier_id" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          رقم المورد
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as { supplier_id?: number })
                              .supplier_id
                          }
                        </p>
                      </div>
                    )}
                    {"order_number" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          رقم طلب المورد
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as { order_number?: string })
                              .order_number
                          }
                        </p>
                      </div>
                    )}
                    {"total_amount" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          إجمالي الطلب
                        </span>
                        <p className="font-medium">
                          {formatMoney(
                            (transaction.metadata as { total_amount?: string })
                              .total_amount
                          )}
                        </p>
                      </div>
                    )}
                    {"order_id" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          رقم الفاتورة
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as { order_id?: number })
                              .order_id
                          }
                        </p>
                      </div>
                    )}
                    {"payment_method" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          وسيلة الدفع
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as {
                              payment_method?: string;
                            }).payment_method
                          }
                        </p>
                      </div>
                    )}
                    {"period" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">فترة الراتب</span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as { period?: string })
                              .period
                          }
                        </p>
                      </div>
                    )}
                    {"employee_id" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          رقم الموظف
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as { employee_id?: number })
                              .employee_id
                          }
                        </p>
                      </div>
                    )}
                    {"employee_code" in transaction.metadata && (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground">
                          كود الموظف
                        </span>
                        <p className="font-medium">
                          {
                            (transaction.metadata as {
                              employee_code?: string;
                            }).employee_code
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  {/* إذا كانت هناك مفاتيح أخرى غير معروفة، نعرض JSON خام في الأسفل */}
                  {Object.keys(transaction.metadata).some(
                    (k) =>
                      ![
                        "supplier_id",
                        "order_number",
                        "total_amount",
                        "order_id",
                        "payment_method",
                        "period",
                        "employee_id",
                        "employee_code",
                      ].includes(k)
                  ) && (
                    <pre className="mt-2 rounded-md bg-muted p-3 text-xs text-foreground overflow-x-auto">
                      {JSON.stringify(transaction.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}

            {transaction.creator && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">المستخدم</Label>
                <p className="text-sm text-foreground">
                  {transaction.creator.name}
                  {transaction.creator.email
                    ? ` (${transaction.creator.email})`
                    : ""}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            لا توجد بيانات لعرضها.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
