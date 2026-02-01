import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TEmployeeDeduction } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { useMutation } from "@tanstack/react-query";
import { useDeleteEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { toast } from "sonner";

type Props = {
  deduction: TEmployeeDeduction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteEmployeeDeductionModal({
  deduction,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteDeduction, isPending } = useMutation(
    useDeleteEmployeeDeductionMutationOptions()
  );

  const handleDelete = (onClose: () => void) => {
    if (!deduction) return;
    deleteDeduction(deduction.id, {
      onSuccess: () => {
        toast.success(`تم حذف الخصم بنجاح.`);
        onClose();
      },
      onError: () => {
        toast.error("حدث خطأ ما أثناء حذف الخصم. الرجاء المحاولة مرة أخرى.");
      },
    });
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="حذف الخصم"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد حذف الخصم للموظف{" "}
          <strong>{deduction?.employee.user.name}</strong>؟
        </>
      }
      handleConfirmation={handleDelete}
      isPending={isPending}
      pendingLabel="جاري الحذف..."
      confirmLabel="تأكيد الحذف"
      variant="destructive"
    />
  );
}

