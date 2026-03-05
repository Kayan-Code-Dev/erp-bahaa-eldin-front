import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TEmployeeDocument } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { useMutation } from "@tanstack/react-query";
import { useDeleteEmployeeDocumentMutationOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { toast } from "sonner";

type Props = {
  document: TEmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteEmployeeDocumentModal({
  document,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteDocument, isPending } = useMutation(
    useDeleteEmployeeDocumentMutationOptions()
  );

  const handleDelete = (onClose: () => void) => {
    if (!document) return;
    deleteDocument(
      { document_id: document.id },
      {
        onSuccess: () => {
          toast.success(`تم حذف الوثيقة "${document.title}" بنجاح.`);
          onClose();
        },
        onError: () => {
          toast.error("حدث خطأ ما أثناء حذف الوثيقة. الرجاء المحاولة مرة أخرى.");
        },
      }
    );
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="حذف الوثيقة"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد حذف الوثيقة{" "}
          <strong>{document?.title}</strong>؟
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

