import { useMutation } from "@tanstack/react-query";
import { TCity } from "@/api/v2/content-managment/city/city.types";
import { useDeleteCityMutationOptions } from "@/api/v2/content-managment/city/city.hooks";
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
  city: TCity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCityModal({ city, open, onOpenChange }: Props) {
  const { mutate: deleteCity, isPending } = useMutation(
    useDeleteCityMutationOptions()
  );

  const handleDelete = () => {
    if (city) {
      deleteCity(city.id, {
        onSuccess: () => {
          toast.success("تم الحذف", {
            description: `تم حذف المدينة "${city.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error("خطأ فى الحذف", {
            description:
              `حدث خطأ أثناء حذف المدينة "${city.name}".` + error.message,
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
            هل أنت متأكد من حذف هذه المدينة؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف المدينة "<strong>{city?.name}</strong>" نهائيًا. هذا
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
