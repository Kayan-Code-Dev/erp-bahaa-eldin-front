import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TEmployeeDeduction } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { useMutation } from "@tanstack/react-query";
import { useApproveEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { toast } from "sonner";

type Props = {
  deduction: TEmployeeDeduction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApproveEmployeeDeductionModal({
  deduction,
  open,
  onOpenChange,
}: Props) {
  const { mutate: approveDeduction, isPending } = useMutation(
    useApproveEmployeeDeductionMutationOptions()
  );

  const handleApprove = (onClose: () => void) => {
    if (!deduction) return;
    approveDeduction(deduction.id, {
      onSuccess: () => {
        toast.success(`تمت الموافقة على الخصم بنجاح.`);
        onClose();
      },
      onError: () => {
        toast.error("حدث خطأ ما أثناء الموافقة على الخصم. الرجاء المحاولة مرة أخرى.");
      },
    });
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="الموافقة على الخصم"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد الموافقة على الخصم للموظف{" "}
          <strong>{deduction?.employee.user.name}</strong> بمبلغ{" "}
          <strong>{deduction?.amount.toLocaleString()} ج.م</strong>؟
        </>
      }
      handleConfirmation={handleApprove}
      isPending={isPending}
      pendingLabel="جاري الموافقة..."
      confirmLabel="تأكيد الموافقة"
      variant="default"
    />
  );
}

