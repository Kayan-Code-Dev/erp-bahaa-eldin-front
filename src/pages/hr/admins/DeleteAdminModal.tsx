import { useDeleteAdmin } from "@/api/hr/admins/admins.hooks";
import { TAdmin } from "@/api/hr/admins/admins.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Props = {
  admin: TAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAdminModal({ admin, open, onOpenChange }: Props) {
  const { mutate: deleteAdmin, isPending } = useDeleteAdmin();

  const handleDelete = () => {
    if (admin) {
      deleteAdmin(admin.uuid, {
        onSuccess: () => {
          toast.success("تم حذف المشرف بنجاح");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("حدث خطأ أثناء حذف المشرف");
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">هل أنت متأكد من حذف هذا المشرف؟</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف المشرف "<strong>{admin?.name}</strong>" نهائيًا. هذا
            الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
