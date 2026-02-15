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
import { useForm, useFieldArray } from "react-hook-form";
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
import { TOrder } from "@/api/v2/orders/orders.types";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

// Schema for cloth payment
const clothPaymentSchema = z.object({
  cloth_id: z.number().min(1, { message: "يجب اختيار قطعة" }),
  amount: z
    .number({
      required_error: "المبلغ مطلوب",
    })
    .min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
});

// Schema for the form
const formSchema = z.object({
  cloth_payments: z
    .array(clothPaymentSchema)
    .min(1, { message: "يجب اختيار قطعة واحدة على الأقل" }),
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
  order: TOrder;
  onSuccess?: () => void;
};

export function CreatePaymentModal({ open, onOpenChange, order, onSuccess }: Props) {
  const { mutate: createPayment, isPending } = useMutation(
    useCreatePaymentMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cloth_payments: [],
      status: "pending",
      payment_type: "normal",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cloth_payments",
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

  // Get available cloth items from order
  const availableClothes = order.items || [];

  // Get selected cloth IDs
  const selectedClothIds = fields.map((field) => field.cloth_id);

  // Get available clothes that are not yet selected
  const unselectedClothes = availableClothes.filter(
    (cloth) => !selectedClothIds.includes(cloth.cloth_id || cloth.id)
  );

  const handleAddCloth = () => {
    if (unselectedClothes.length > 0) {
      const firstUnselected = unselectedClothes[0];
      append({
        cloth_id: firstUnselected.cloth_id || firstUnselected.id,
        amount: 0,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Format payment_date to yyyy-MM-dd HH:mm:ss
    const paymentDate = values.payment_date
      ? format(new Date(values.payment_date + "T00:00:00"), "yyyy-MM-dd HH:mm:ss")
      : format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const requestData: TCreatePaymentRequest = {
      order_id: order.id,
      cloth_payments: values.cloth_payments,
      status: values.status,
      payment_type: values.payment_type,
      payment_date: paymentDate,
      notes: values.notes,
    };

    createPayment(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المدفوعة بنجاح", {
          description: "تمت إضافة المدفوعة بنجاح للنظام.",
        });
        form.reset({
          cloth_payments: [],
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
        cloth_payments: [],
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء دفعة جديدة</DialogTitle>
          <DialogDescription className="text-center">
            اختر القطع المراد الدفع لها وأدخل المبلغ لكل قطعة
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Cloth Payments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">
                  القطع المختارة
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCloth}
                  disabled={unselectedClothes.length === 0 || isPending}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة قطعة
                </Button>
              </div>

              {fields.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    لم يتم اختيار أي قطعة. اضغط على "إضافة قطعة" لبدء الاختيار.
                  </CardContent>
                </Card>
              )}

              {fields.map((field, index) => {
                const cloth = availableClothes.find(
                  (c) => (c.cloth_id || c.id) === field.cloth_id
                );

                return (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            قطعة #{index + 1}
                          </FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name={`cloth_payments.${index}.cloth_id`}
                          render={({ field: clothField }) => (
                            <FormItem>
                              <FormLabel>القطعة</FormLabel>
                              <Select
                                value={clothField.value?.toString()}
                                onValueChange={(value) => {
                                  clothField.onChange(Number(value));
                                }}
                                disabled={isPending}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر القطعة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableClothes.map((c) => {
                                    const clothId = c.cloth_id || c.id;
                                    const isSelected =
                                      selectedClothIds.includes(clothId) &&
                                      clothField.value !== clothId;
                                    return (
                                      <SelectItem
                                        key={clothId}
                                        value={clothId.toString()}
                                        disabled={isSelected}
                                      >
                                        {c.code} - {c.name}
                                        {isSelected && " (مختارة بالفعل)"}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cloth_payments.${index}.amount`}
                          render={({ field: amountField }) => (
                            <FormItem>
                              <FormLabel>المبلغ (ج.م)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="أدخل المبلغ"
                                  value={amountField.value || ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, "");
                                    const value = val ? parseFloat(val) : undefined;
                                    amountField.onChange(value);
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {cloth && (
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const quantity = cloth.quantity ?? 1;
                              const pricePerUnit = parseFloat(cloth.price || "0");
                              const totalPrice = pricePerUnit * quantity;
                              const paid = parseFloat(
                                (cloth as any).item_paid ?? (cloth as any).item_paid ?? "0"
                              );
                              const remaining = Math.max(0, totalPrice - paid);
                              return (
                                <>
                                  <p>
                                    السعر الأصلي (لكل الكمية):{" "}
                                    {totalPrice.toLocaleString()} ج.م
                                  </p>
                                  <p>
                                    المدفوع: {paid.toLocaleString()} ج.م
                                  </p>
                                  <p>
                                    المتبقي: {remaining.toLocaleString()} ج.م
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {fields.length > 0 && form.formState.errors.cloth_payments && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cloth_payments.message}
                </p>
              )}
            </div>

            <Separator />

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
                    disabled={isPending}
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
                    disabled={isPending}
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
                      disabled={isPending}
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
                      disabled={isPending}
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
