import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TClientResponse } from "@/api/v2/clients/clients.types";
import { useMutation } from "@tanstack/react-query";
import { useDeleteClientMutationOptions } from "@/api/v2/clients/clients.hooks";
import { toast } from "sonner";

type Props = {
  client: TClientResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteClientModal({
  client,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteClient, isPending } = useMutation(
    useDeleteClientMutationOptions()
  );

  const handleDelete = (onClose: () => void) => {
    if (!client) return;
    deleteClient(client.id, {
      onSuccess: () => {
        toast.success(`تم حذف العميل ${client.first_name} ${client.last_name} بنجاح.`);
        onClose();
      },
      onError: () => {
        toast.error("حدث خطأ ما أثناء حذف العميل. الرجاء المحاولة مرة أخرى.");
      },
    });
  };

  return (
    <ControlledConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      alertTitle="حذف العميل"
      alertMessage={
        <>
          هل أنت متأكد أنك تريد حذف العميل{" "}
          <strong>{client ? `${client.first_name} ${client.last_name}` : ""}</strong>؟
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

