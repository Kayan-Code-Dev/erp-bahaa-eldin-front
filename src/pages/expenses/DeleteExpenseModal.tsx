import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteExpenseMutationOptions,
} from "@/api/v2/expenses/expenses.hooks";
import { TExpense } from "@/api/v2/expenses/expenses.types";
import { formatDate } from "@/utils/formatDate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: TExpense | null;
};

export function DeleteExpenseModal({
  open,
  onOpenChange,
  expense,
}: Props) {
  const { mutate: deleteExpense, isPending } = useMutation(
    useDeleteExpenseMutationOptions()
  );

  const handleConfirm = () => {
    if (!expense) return;
    deleteExpense(expense.id, {
      onSuccess: () => {
        toast.success("تم حذف المصروف بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء حذف المصروف", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">حذف المصروف</DialogTitle>
          <DialogDescription className="text-center">
            هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذه العملية.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-right text-sm">
          <p>
            <span className="font-medium">المورد:</span> {expense?.vendor}
          </p>
          <p>
            <span className="font-medium">المبلغ:</span> {expense?.amount} ج.م
          </p>
          <p>
            <span className="font-medium">التاريخ:</span>{" "}
            {expense?.expense_date && formatDate(expense.expense_date)}
          </p>
        </div>
        <DialogFooter className="mt-4 gap-2 border-t pt-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !expense}
          >
            {isPending ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

