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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { usePaySimpleSalaryMutationOptions } from "@/api/simple-salary/simple-salary.hooks";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type TSimpleSalaryPayRequest,
  type TSimpleSalarySummary,
} from "@/api/simple-salary/simple-salary.types";
import { CashboxesSelect } from "@/components/custom/CashboxesSelect";
import { toast } from "sonner";
import {
  payFormSchema,
  getPayFormDefaultValues,
  type PayFormValues,
} from "../simpleSalary.schema";

export type PaySimpleSalaryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: TSimpleSalarySummary;
  onSuccess?: () => void;
};

export function PaySimpleSalaryModal({
  open,
  onOpenChange,
  summary,
  onSuccess,
}: PaySimpleSalaryModalProps) {
  const mutation = useMutation(usePaySimpleSalaryMutationOptions());
  const remaining = summary.remaining_to_pay ?? 0;

  const form = useForm<PayFormValues>({
    resolver: zodResolver(payFormSchema),
    defaultValues: getPayFormDefaultValues(),
  });

  const amount = form.watch("amount");
  const amountNum =
    amount != null && typeof amount === "number" && amount > 0 ? amount : null;
  const isOverRemaining =
    amountNum != null &&
    amountNum > 0 &&
    remaining > 0 &&
    amountNum > remaining;

  const handleSubmit = form.handleSubmit((values) => {
    const cashboxId = Number(values.cashbox_id);
    if (!cashboxId) {
      toast.error("اختر الصندوق");
      return;
    }
    const body: TSimpleSalaryPayRequest = {
      employee_id: summary.employee.id,
      period: summary.period,
      cashbox_id: cashboxId,
      payment_method: values.payment_method,
      payment_reference: values.payment_reference || undefined,
      notes: values.notes || undefined,
    };
    if (values.amount != null && values.amount > 0) {
      body.amount = values.amount;
    }
    mutation.mutate(body, {
      onSuccess: (result) => {
        if (result?.payment) {
          toast.success(result.message ?? "تم تسجيل الدفعة بنجاح.");
          form.reset(getPayFormDefaultValues());
          onOpenChange(false);
          onSuccess?.();
        }
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            دفع الراتب / دفعة
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {summary.employee.name} — {summary.period} — المتبقي:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م
            </span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            <FormField
              control={form.control}
              name="cashbox_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصندوق</FormLabel>
                  <FormControl>
                    <CashboxesSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر الصندوق..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة الدفع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {PAYMENT_METHOD_LABELS[m]}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    مبلغ الدفعة (اختياري — فارغ = دفع كامل المتبقي)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder={remaining.toFixed(2)}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  {isOverRemaining && (
                    <p className="text-xs font-medium text-destructive">
                      المبلغ يتجاوز المتبقي ({remaining.toLocaleString("en-US")}).
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مرجع الدفع (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: رقم تحويل" {...field} />
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
                    <Textarea placeholder="ملاحظات" rows={2} {...field} />
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
              <Button
                type="submit"
                disabled={mutation.isPending || isOverRemaining}
                className="focus-visible:ring-2"
              >
                {mutation.isPending ? "جاري التسجيل..." : "تسجيل الدفعة"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
