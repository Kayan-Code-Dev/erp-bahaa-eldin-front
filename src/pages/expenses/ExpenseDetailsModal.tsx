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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل المصروف</DialogTitle>
        </DialogHeader>
        {expense ? (
          <div className="space-y-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رقم المصروف</p>
                <p className="font-semibold">#{expense.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge
                  className={getStatusBadgeClass(expense.status)}
                  variant="secondary"
                >
                  {getStatusLabel(expense.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المبلغ</p>
                <p className="font-semibold">{expense.amount} ج.م</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ المصروف</p>
                <p>{formatDate(expense.expense_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفرع</p>
                <p>{expense.branch?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الصندوق</p>
                <p>{expense.cashbox?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المورد</p>
                <p>{expense.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم المرجع</p>
                <p>{expense.reference_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفئة</p>
                <p>
                  {
                    ExpenseCategories.find((c) => c.id === expense.category)
                      ?.name
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p>{formatDate(expense.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  تاريخ آخر تحديث
                </p>
                <p>{formatDate(expense.updated_at)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">الوصف</p>
              <p className="text-sm whitespace-pre-wrap">
                {expense.description || "-"}
              </p>
            </div>

            {expense.notes && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">الملاحظات</p>
                <p className="text-sm whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">أنشئ بواسطة</p>
              <p className="text-sm">
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

