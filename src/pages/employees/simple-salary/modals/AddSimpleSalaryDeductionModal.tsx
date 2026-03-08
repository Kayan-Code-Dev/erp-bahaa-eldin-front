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
import { useMutation } from "@tanstack/react-query";
import { useCreateSimpleSalaryDeductionMutationOptions } from "@/api/simple-salary/simple-salary.hooks";
import { toast } from "sonner";
import { PERIOD_REGEX } from "../constants";
import {
  addDeductionSchema,
  getAddDeductionDefaultValues,
  type AddDeductionFormValues,
} from "../simpleSalary.schema";

export type AddSimpleSalaryDeductionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  employeeName: string;
  period: string;
  onSuccess?: () => void;
};

export function AddSimpleSalaryDeductionModal({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  period,
  onSuccess,
}: AddSimpleSalaryDeductionModalProps) {
  const mutation = useMutation(useCreateSimpleSalaryDeductionMutationOptions());

  const form = useForm<AddDeductionFormValues>({
    resolver: zodResolver(addDeductionSchema),
    defaultValues: getAddDeductionDefaultValues(),
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (!PERIOD_REGEX.test(period)) {
      toast.error("صيغة الشهر غير صحيحة (YYYY-MM)");
      return;
    }
    mutation.mutate(
      {
        employee_id: employeeId,
        period,
        amount: values.amount,
        reason: values.reason,
        date: values.date,
        notes: values.notes || undefined,
      },
      {
        onSuccess: (result) => {
          if (result?.deduction) {
            toast.success(result.message ?? "تمت إضافة الخصم.");
            form.reset(getAddDeductionDefaultValues());
            onOpenChange(false);
            onSuccess?.();
          }
        },
      }
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">إضافة خصم</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {employeeName} — الفترة {period}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
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
                      min="0.01"
                      placeholder="0.00"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الخصم</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: غياب يوم واحد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الخصم</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="border-t border-border/80 bg-muted/10 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="focus-visible:ring-2"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="focus-visible:ring-2">
                {mutation.isPending ? "جاري الحفظ..." : "إضافة الخصم"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
