import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TEmployeeDocument } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { useMutation } from "@tanstack/react-query";
import { useVerifyEmployeeDocumentMutationOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { toast } from "sonner";

type Props = {
  document: TEmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VerifyEmployeeDocumentModal({
  document,
  open,
  onOpenChange,
}: Props) {
  const { mutate: verifyDocument, isPending } = useMutation(
    useVerifyEmployeeDocumentMutationOptions()
  );

  const handleVerify = (onClose: () => void) => {
    if (!document) return;
    verifyDocument(
      { document_id: document.id },
      {
        onSuccess: () => {
          toast.success(`تم تأكيد الوثيقة "${document.title}" بنجاح.`);
          onClose();
        },
        onError: () => {
          toast.error("حدث خطأ ما أثناء تأكيد الوثيقة. الرجاء المحاولة مرة أخرى.");
        },
      }
    );
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="تأكيد الوثيقة"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد تأكيد الوثيقة{" "}
          <strong>{document?.title}</strong>؟
        </>
      }
      handleConfirmation={handleVerify}
      isPending={isPending}
      pendingLabel="جاري التأكيد..."
      confirmLabel="تأكيد الوثيقة"
      variant="default"
      confirmButtonClassName="bg-green-600 hover:bg-green-600/80"
    />
  );
}

