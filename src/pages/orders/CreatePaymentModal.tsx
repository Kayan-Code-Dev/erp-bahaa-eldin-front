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
import { DatePicker } from "@/components/custom/DatePicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useCreatePaymentMutationOptions } from "@/api/v2/payments/payments.hooks";
import {
  TCreatePaymentRequest,
  TPaymentStatus,
  TPaymentType,
} from "@/api/v2/payments/payments.types";
import { toast } from "sonner";
import { format } from "date-fns";

const paymentStatuses: TPaymentStatus[] = ["paid", "canceled", "pending"];

const paymentStatusLabels: Record<TPaymentStatus, string> = {
  pending: "معلق",
  paid: "مدفوع",
  canceled: "ملغي",
};

const paymentTypes: TPaymentType[] = ["initial", "fee", "normal"];

const paymentTypeLabels: Record<TPaymentType, string> = {
  initial: "مبدئي",
  fee: "رسوم",
  normal: "عادي",
};

// Schema for the form
const formSchema = z.object({
  amount: z
    .number({
      required_error: "المبلغ مطلوب",
    })
    .min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
  status: z.enum(["paid", "canceled", "pending"], {
    required_error: "الحالة مطلوبة",
  }),
  payment_type: z.enum(["initial", "fee", "normal"], {
    required_error: "نوع الدفعة مطلوب",
  }),
  payment_date: z.string().min(1, { message: "تاريخ الدفع مطلوب" }),
  notes: z.string().min(1, { message: "الملاحظات مطلوبة" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  onSuccess?: () => void;
};

export function CreatePaymentModal({ open, onOpenChange, orderId, onSuccess }: Props) {
  const { mutate: createPayment, isPending } = useMutation(
    useCreatePaymentMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      status: "pending",
      payment_type: "normal",
      payment_date: new Date().toISOString().split("T")[0], // Today's date
      notes: "",
    },
  });

  // Helper function to convert Date to string (YYYY-MM-DD)
  const dateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Helper function to convert string to Date
  const stringToDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreatePaymentRequest = {
      order_id: orderId,
      amount: values.amount,
      status: values.status,
      payment_type: values.payment_type,
      payment_date: format(values.payment_date, "yyyy-MM-dd HH:mm:ss"),
      notes: values.notes,
    };

    createPayment(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المدفوعة بنجاح", {
          description: "تمت إضافة المدفوعة بنجاح للنظام.",
        });
        form.reset({
          amount: undefined,
          status: "pending",
          payment_type: "normal",
          payment_date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء المدفوعة", {
          description: error.message,
        });
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        amount: undefined,
        status: "pending",
        payment_type: "normal",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء دفعة جديدة</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة دفعة جديدة للطلب.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ج.م)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل المبلغ"
                      value={field.value || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const value = val ? parseFloat(val) : undefined;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {paymentStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Type */}
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الدفعة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الدفعة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {paymentTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Date */}
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker
                      value={stringToDate(field.value)}
                      onChange={(date) => {
                        field.onChange(dateToString(date));
                      }}
                      label="تاريخ الدفع"
                      placeholder="اختر تاريخ الدفع"
                      allowPastDates={true}
                      allowFutureDates={true}
                      showLabel={true}
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
                  <FormLabel>الملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل الملاحظات"
                      {...field}
                      rows={3}
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
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                إنشاء الدفعة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

