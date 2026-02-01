import { useMutation } from "@tanstack/react-query";
import { TDepartment } from "@/api/v2/content-managment/depratments/departments.types";
import { useDeleteDepartmentMutationOptions } from "@/api/v2/content-managment/depratments/departments.hooks";
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
  department: TDepartment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteDepartmentModal({ department, open, onOpenChange }: Props) {
  const { mutate: deleteDepartment, isPending } = useMutation(
    useDeleteDepartmentMutationOptions()
  );

  const handleDelete = () => {
    if (department) {
      deleteDepartment(department.id, {
        onSuccess: () => {
          toast.success("تم الحذف", {
            description: `تم حذف القسم "${department.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error("خطأ فى الحذف", {
            description:
              `حدث خطأ أثناء حذف القسم "${department.name}".` + error.message,
          });
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            هل أنت متأكد من حذف هذا القسم؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف القسم "<strong>{department?.name}</strong>" نهائيًا. هذا
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

