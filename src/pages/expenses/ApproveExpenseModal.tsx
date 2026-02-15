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
  useApproveExpenseMutationOptions,
} from "@/api/v2/expenses/expenses.hooks";
import { TExpense } from "@/api/v2/expenses/expenses.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: TExpense | null;
};

export function ApproveExpenseModal({
  open,
  onOpenChange,
  expense,
}: Props) {
  const { mutate: approveExpense, isPending } = useMutation(
    useApproveExpenseMutationOptions()
  );

  const handleConfirm = () => {
    if (!expense) return;
    approveExpense(expense.id, {
      onSuccess: () => {
        toast.success("تم اعتماد المصروف بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء اعتماد المصروف", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">اعتماد المصروف</DialogTitle>
          <DialogDescription className="text-center">
            هل تريد اعتماد هذا المصروف؟
          </DialogDescription>
        </DialogHeader>
        <div className="modal-section" dir="rtl">
          <div className="space-y-0">
            <div className="modal-detail-row">
              <span className="modal-detail-label">المورد</span>
              <span className="modal-detail-value">{expense?.vendor ?? "-"}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">المبلغ</span>
              <span className="modal-detail-value">{expense?.amount ?? "-"} ج.م</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !expense}
          >
            {isPending ? "جاري الاعتماد..." : "اعتماد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

