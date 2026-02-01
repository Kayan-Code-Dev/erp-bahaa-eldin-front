import { useMutation } from "@tanstack/react-query";
import { TClothesModel } from "@/api/v2/clothes/clothes-models/clothes.models.types";
import { useDeleteClothesModelMutationOptions } from "@/api/v2/clothes/clothes-models/clothes.models.hooks";
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
  model: TClothesModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteClothesModel({
  model,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteModel, isPending } = useMutation(
    useDeleteClothesModelMutationOptions()
  );

  const handleDelete = () => {
    if (model) {
      deleteModel(model.id, {
        onSuccess: () => {
          toast.success("تم الحذف", {
            description: `تم حذف الموديل "${model.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error("خطأ فى الحذف", {
            description:
              `حدث خطأ أثناء حذف الموديل "${model.name}".` + error.message,
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
            هل أنت متأكد من حذف هذا الموديل؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف الموديل "<strong>{model?.name}</strong>" نهائيًا. هذا
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

