import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUpdateEmployeeDeductionMutationOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { TEmployeeDeduction, TUpdateEmployeeDeductionRequest } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { toast } from "sonner";
import { useEffect } from "react";

const formSchema = z.object({
  reason: z.string().min(1, { message: "السبب مطلوب" }).optional(),
  description: z.string().optional(),
  amount: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: "المبلغ يجب أن يكون رقماً أكبر من الصفر" }
  ),
  notes: z.string().optional(),
});

type Props = {
  deduction: TEmployeeDeduction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateEmployeeDeductionModal({
  deduction,
  open,
  onOpenChange,
}: Props) {
  const { mutate: updateDeduction, isPending } = useMutation(
    useUpdateEmployeeDeductionMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      description: "",
      amount: "",
      notes: "",
    },
  });

  // Load deduction data into form when modal opens
  useEffect(() => {
    if (deduction && open) {
      form.reset({
        reason: deduction.reason || "",
        description: deduction.description || "",
        amount: deduction.amount.toString() || "",
        notes: deduction.notes || "",
      });
    }
  }, [deduction, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!deduction) return;

    const requestData: TUpdateEmployeeDeductionRequest = {
      reason: values.reason,
      description: values.description,
      amount: values.amount ? Number(values.amount) : undefined,
      notes: values.notes,
    };

    updateDeduction(
      { id: deduction.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الخصم بنجاح", {
            description: `تم تحديث الخصم بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الخصم", {
            description: error.message,
          });
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل الخصم</DialogTitle>
          <DialogDescription className="text-center">
            تعديل معلومات الخصم.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السبب</FormLabel>
                  <FormControl>
                    <Input placeholder="سبب الخصم..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف الخصم..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="المبلغ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ملاحظات إضافية..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

