import { useMutation } from "@tanstack/react-query";
import { TCountry } from "@/api/v2/content-managment/country/country.types";
import { useDeleteCountryMutationOptions } from "@/api/v2/content-managment/country/country.hooks";
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
  country: TCountry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCountryModal({ country, open, onOpenChange }: Props) {
  const { mutate: deleteCountry, isPending } = useMutation(
    useDeleteCountryMutationOptions()
  );

  const handleDelete = () => {
    if (country) {
      deleteCountry(country.id, {
        onSuccess: () => {
          toast.success("تم الحذف", {
            description: `تم حذف دولة "${country.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء الحذف. حاول مرة أخرى.", {
            description: error.message,
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
            هل أنت متأكد من حذف هذه الدولة؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            سيتم حذف الدولة "<strong>{country?.name}</strong>" نهائيًا. هذا
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
