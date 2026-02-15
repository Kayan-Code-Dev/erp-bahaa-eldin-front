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
                  <span className="modal-detail-value">{expense.amount} ج.م</span>
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
              <p className="modal-section-title">أنشئ بواسطة</p>
              <p className="text-sm text-foreground">
                {expense.creator?.name} ({expense.creator?.email})
              </p>
            </div>
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

