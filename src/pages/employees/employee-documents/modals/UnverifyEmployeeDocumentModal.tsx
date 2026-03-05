import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TEmployeeDocument } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { useMutation } from "@tanstack/react-query";
import { useUnverifyEmployeeDocumentMutationOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { toast } from "sonner";

type Props = {
  document: TEmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnverifyEmployeeDocumentModal({
  document,
  open,
  onOpenChange,
}: Props) {
  const { mutate: unverifyDocument, isPending } = useMutation(
    useUnverifyEmployeeDocumentMutationOptions()
  );

  const handleUnverify = (onClose: () => void) => {
    if (!document) return;
    unverifyDocument(
      { document_id: document.id },
      {
        onSuccess: () => {
          toast.success(`تم إلغاء تأكيد الوثيقة "${document.title}" بنجاح.`);
          onClose();
        },
        onError: () => {
          toast.error("حدث خطأ ما أثناء إلغاء تأكيد الوثيقة. الرجاء المحاولة مرة أخرى.");
        },
      }
    );
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="إلغاء تأكيد الوثيقة"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد إلغاء تأكيد الوثيقة{" "}
          <strong>{document?.title}</strong>؟
        </>
      }
      handleConfirmation={handleUnverify}
      isPending={isPending}
      pendingLabel="جاري الإلغاء..."
      confirmLabel="إلغاء التأكيد"
      variant="destructive"
    />
  );
}

