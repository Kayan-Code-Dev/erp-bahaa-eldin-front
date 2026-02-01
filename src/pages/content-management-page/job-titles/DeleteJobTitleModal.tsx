import { useMutation } from "@tanstack/react-query";
import { TJobTitle } from "@/api/v2/content-managment/job-titles/job-titles.types";
import { useDeleteJobTitleMutationOptions } from "@/api/v2/content-managment/job-titles/job-titles.hooks";
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
  jobTitle: TJobTitle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteJobTitleModal({ jobTitle, open, onOpenChange }: Props) {
  const { mutate: deleteJobTitle, isPending } = useMutation(
    useDeleteJobTitleMutationOptions()
  );

  const handleDelete = () => {
    if (jobTitle) {
      deleteJobTitle(jobTitle.id, {
        onSuccess: () => {
          toast.success("تم الحذف", {
            description: `تم حذف المسمية الوظيفية "${jobTitle.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error("خطأ فى الحذف", {
            description:
              `حدث خطأ أثناء حذف المسمية الوظيفية "${jobTitle.name}".` + error.message,
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
            هل أنت متأكد من حذف هذه المسمية الوظيفية؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف المسمية الوظيفية "<strong>{jobTitle?.name}</strong>" نهائيًا. هذا
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

