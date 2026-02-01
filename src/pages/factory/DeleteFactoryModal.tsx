import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TFactoryResponse } from "@/api/v2/factories/factories.types";
import { useMutation } from "@tanstack/react-query";
import { useDeleteFactoryMutationOptions } from "@/api/v2/factories/factories.hooks";
import { toast } from "sonner";

type Props = {
  factory: TFactoryResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteFactoryModal({
  factory,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteFactory, isPending } = useMutation(
    useDeleteFactoryMutationOptions()
  );

  const handleDelete = (onClose: () => void) => {
    if (!factory) return;
    deleteFactory(factory.id, {
      onSuccess: () => {
        toast.success(`تم حذف المصنع ${factory.name} بنجاح.`);
        onClose();
      },
      onError: () => {
        toast.error("حدث خطأ ما أثناء حذف المصنع. الرجاء المحاولة مرة أخرى.");
      },
    });
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="حذف المصنع"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد حذف المصنع{" "}
          <strong>{factory?.name}</strong>؟
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

