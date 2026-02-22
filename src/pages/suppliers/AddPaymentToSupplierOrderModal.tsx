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
import { useAddPaymentToSupplierOrderMutationOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { TSupplierOrderResponse } from "@/api/v2/suppliers/suppliers.types";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.number().min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  order: TSupplierOrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatCurrency(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = parseFloat(String(value));
  if (Number.isNaN(num)) return "—";
  return `${num.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م`;
}

export function AddPaymentToSupplierOrderModal({
  order,
  open,
  onOpenChange,
}: Props) {
  const { mutate: addPayment, isPending } = useMutation(
    useAddPaymentToSupplierOrderMutationOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0 },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ amount: 0 });
    }
    onOpenChange(next);
  };

  const onSubmit = (values: FormValues) => {
    if (!order) return;
    addPayment(
      { id: order.id, amount: values.amount },
      {
        onSuccess: () => {
          toast.success("تم إضافة الدفعة بنجاح");
          handleOpenChange(false);
        },
        onError: (error: { message?: string }) => {
          toast.error("حدث خطأ أثناء إضافة الدفعة", {
            description: error?.message,
          });
        },
      }
    );
  };

  const remaining = order
    ? parseFloat(String(order.remaining_payment || 0))
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة دفعة لطلبية</DialogTitle>
          <DialogDescription className="text-center">
            {order && (
              <span>
                الطلبية #{order.id}
                {order.order_number && ` (${order.order_number})`} — المتبقي:{" "}
                {formatCurrency(order.remaining_payment)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ج.م)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? 0 : parseFloat(v) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      المتبقي على الطلبية: {remaining.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م
                    </p>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإضافة..." : "إضافة الدفعة"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
