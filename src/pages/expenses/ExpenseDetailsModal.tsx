import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ExpenseCategories,
  TExpense,
} from "@/api/v2/expenses/expenses.types";
import { formatDate } from "@/utils/formatDate";

const getStatusLabel = (status: TExpense["status"]) => {
  const map: Record<TExpense["status"], string> = {
    pending: "معلق",
    approved: "معتمد",
    paid: "مدفوع",
    cancelled: "ملغي",
  };
  return map[status] || status;
};

const getStatusBadgeClass = (status: TExpense["status"]) => {
  const map: Record<TExpense["status"], string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return map[status];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: TExpense | null;
};

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م`;
};

export function ExpenseDetailsModal({
  open,
  onOpenChange,
  expense,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل المصروف</DialogTitle>
        </DialogHeader>
        {expense ? (
          <div className="space-y-5" dir="rtl">
            <div className="modal-section">
              <p className="modal-section-title">معلومات المصروف</p>
              <div className="space-y-0">
                <div className="modal-detail-row">
                  <span className="modal-detail-label">رقم المصروف</span>
                  <span className="modal-detail-value">#{expense.id}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">الحالة</span>
                  <Badge
                    className={getStatusBadgeClass(expense.status)}
                    variant="secondary"
                  >
                    {getStatusLabel(expense.status)}
                  </Badge>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">المبلغ</span>
                  <span className="modal-detail-value">
                    {formatMoney(expense.amount)}
                  </span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">تاريخ المصروف</span>
                  <span className="modal-detail-value">{formatDate(expense.expense_date)}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">الفرع</span>
                  <span className="modal-detail-value">{expense.branch?.name ?? "-"}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">الصندوق</span>
                  <span className="modal-detail-value">{expense.cashbox?.name ?? "-"}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">المورد</span>
                  <span className="modal-detail-value">{expense.vendor}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">رقم المرجع</span>
                  <span className="modal-detail-value">{expense.reference_number}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">الفئة</span>
                  <span className="modal-detail-value">
                    {ExpenseCategories.find((c) => c.id === expense.category)?.name ?? "-"}
                  </span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">تاريخ الإنشاء</span>
                  <span className="modal-detail-value">{formatDate(expense.created_at)}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">تاريخ آخر تحديث</span>
                  <span className="modal-detail-value">{formatDate(expense.updated_at)}</span>
                </div>
                {expense.paid_at && (
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">تاريخ الدفع</span>
                    <span className="modal-detail-value">
                      {formatDate(expense.paid_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-section">
              <p className="modal-section-title">الوصف</p>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {expense.description || "-"}
              </p>
            </div>

            {expense.notes && (
              <div className="modal-section">
                <p className="modal-section-title">الملاحظات</p>
                <p className="text-sm whitespace-pre-wrap text-foreground">{expense.notes}</p>
              </div>
            )}

            <div className="modal-section">
              <p className="modal-section-title">المستخدمون</p>
              <div className="space-y-1 text-sm text-foreground">
                <p>
                  <span className="font-medium">أنشئ بواسطة: </span>
                  {expense.creator?.name} ({expense.creator?.email})
                </p>
                {expense.approver && (
                  <p>
                    <span className="font-medium">تمت الموافقة بواسطة: </span>
                    {expense.approver.name} ({expense.approver.email})
                  </p>
                )}
              </div>
            </div>

            {(expense.cashbox_balance_before != null ||
              expense.cashbox_balance_after != null ||
              expense.cashbox_snapshot_meta) && (
              <div className="modal-section">
                <p className="modal-section-title">معلومات الخزنة</p>
                <div className="space-y-0">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">الصندوق</span>
                    <span className="modal-detail-value">
                      {expense.cashbox?.name ?? "—"}
                    </span>
                  </div>

                  {expense.cashbox_balance_before != null && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">
                        الرصيد قبل المصروف
                      </span>
                      <span className="modal-detail-value">
                        {formatMoney(expense.cashbox_balance_before)}
                      </span>
                    </div>
                  )}

                  {expense.cashbox_balance_after != null && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">
                        الرصيد بعد المصروف
                      </span>
                      <span className="modal-detail-value">
                        {formatMoney(expense.cashbox_balance_after)}
                      </span>
                    </div>
                  )}

                  {expense.cashbox_daily_income_total != null && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">
                        إجمالي إيرادات اليوم للصندوق
                      </span>
                      <span className="modal-detail-value">
                        {formatMoney(expense.cashbox_daily_income_total)}
                      </span>
                    </div>
                  )}

                  {expense.cashbox_daily_expense_total != null && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">
                        إجمالي مصروفات اليوم للصندوق
                      </span>
                      <span className="modal-detail-value">
                        {formatMoney(expense.cashbox_daily_expense_total)}
                      </span>
                    </div>
                  )}

                  {expense.cashbox_snapshot_meta && (
                    <>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">
                          رصيد بداية اليوم
                        </span>
                        <span className="modal-detail-value">
                          {formatMoney(
                            expense.cashbox_snapshot_meta.opening_balance
                          )}
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">
                          رصيد نهاية اليوم
                        </span>
                        <span className="modal-detail-value">
                          {formatMoney(
                            expense.cashbox_snapshot_meta.closing_balance
                          )}
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">
                          صافي التغير
                        </span>
                        <span className="modal-detail-value">
                          {formatMoney(expense.cashbox_snapshot_meta.net_change)}
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">
                          عدد المعاملات في اليوم
                        </span>
                        <span className="modal-detail-value">
                          {expense.cashbox_snapshot_meta.transaction_count}
                        </span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">
                          عدد عكس المعاملات
                        </span>
                        <span className="modal-detail-value">
                          {expense.cashbox_snapshot_meta.reversal_count}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            لا توجد بيانات لعرضها.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

