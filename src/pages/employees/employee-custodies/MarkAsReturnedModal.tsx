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
import { useMarkEmployeeCustodyAsReturnedMutationOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TEmployeeCustody, TEmployeeCustodyConditionOnAssignment } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONDITION_OPTIONS: { value: TEmployeeCustodyConditionOnAssignment; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "good", label: "جيد" },
  { value: "fair", label: "مقبول" },
  { value: "poor", label: "ضعيف" },
];

const formSchema = z.object({
  condition_on_return: z.enum(["new", "good", "fair", "poor"]),
  return_notes: z.string().min(1, { message: "ملاحظات الإرجاع مطلوبة" }),
});

type Props = {
  employeeCustody: TEmployeeCustody | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MarkAsReturnedModal({ employeeCustody, open, onOpenChange }: Props) {
  const { mutate: markAsReturned, isPending } = useMutation(
    useMarkEmployeeCustodyAsReturnedMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition_on_return: "good",
      return_notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!employeeCustody) return;

    markAsReturned(
      {
        id: employeeCustody.id,
        data: {
          condition_on_return: values.condition_on_return,
          return_notes: values.return_notes,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تسجيل إرجاع الضمان بنجاح", {
            description: "تم تحديث حالة الضمان إلى 'مرجع'.",
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تسجيل الإرجاع", {
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
          <DialogTitle className="text-center">تسجيل إرجاع الضمان</DialogTitle>
          <DialogDescription className="text-center">
            قم بتسجيل إرجاع الضمان للموظف {employeeCustody.employee?.user?.name || ""}.
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
              name="condition_on_return"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة عند الإرجاع</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="return_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات الإرجاع</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل ملاحظات حول حالة الضمان عند الإرجاع..."
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التسجيل..." : "تسجيل الإرجاع"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

