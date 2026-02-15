import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useMarkEmployeeCustodyAsLostMutationOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TEmployeeCustody } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { toast } from "sonner";

const formSchema = z.object({
  notes: z.string().min(1, { message: "الملاحظات مطلوبة" }),
});

type Props = {
  employeeCustody: TEmployeeCustody | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MarkAsLostModal({ employeeCustody, open, onOpenChange }: Props) {
  const { mutate: markAsLost, isPending } = useMutation(
    useMarkEmployeeCustodyAsLostMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!employeeCustody) return;

    markAsLost(
      {
        id: employeeCustody.id,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          toast.success("تم تسجيل فقدان الضمان بنجاح", {
            description: "تم تحديث حالة الضمان إلى 'مفقود'.",
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تسجيل الفقدان", {
            description: error.message,
          });
        },
      }
    );
  };

  if (!employeeCustody) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">تسجيل فقدان الضمان</DialogTitle>
          <DialogDescription className="text-center">
            قم بتسجيل فقدان الضمان للموظف {employeeCustody.employee?.user?.name || ""}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات الفقدان</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل ملاحظات حول فقدان الضمان..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} variant="destructive">
                {isPending ? "جاري التسجيل..." : "تسجيل الفقدان"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

