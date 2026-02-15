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
import { useMarkEmployeeCustodyAsDamagedMutationOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
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

export function MarkAsDamagedModal({ employeeCustody, open, onOpenChange }: Props) {
  const { mutate: markAsDamaged, isPending } = useMutation(
    useMarkEmployeeCustodyAsDamagedMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!employeeCustody) return;

    markAsDamaged(
      {
        id: employeeCustody.id,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          toast.success("تم تسجيل تلف الضمان بنجاح", {
            description: "تم تحديث حالة الضمان إلى 'تالف'.",
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تسجيل التلف", {
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
          <DialogTitle className="text-center">تسجيل تلف الضمان</DialogTitle>
          <DialogDescription className="text-center">
            قم بتسجيل تلف الضمان للموظف {employeeCustody.employee?.user?.name || ""}.
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
                  <FormLabel>ملاحظات التلف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل ملاحظات حول تلف الضمان..."
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
                {isPending ? "جاري التسجيل..." : "تسجيل التلف"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

