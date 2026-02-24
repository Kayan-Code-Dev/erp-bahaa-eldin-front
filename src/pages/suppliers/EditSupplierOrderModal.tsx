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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  TSupplierOrderResponse,
  TSupplierOrderDetailResponse,
  TUpdateSupplierOrderRequest,
  resolveClothId,
} from "@/api/v2/suppliers/suppliers.types";
import {
  useUpdateSupplierOrderMutationOptions,
  useGetSuppliersListQueryOptions,
  useGetSupplierOrderQueryOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { toEnglishNumerals } from "@/utils/formatDate";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const clothSchema = z.object({
  cloth_id: z.number(),
  price: z.number().min(0),
  payment: z.number().min(0),
  notes: z.string().optional().nullable(),
  category_id: z.string().optional(),
  subcategory_ids: z.array(z.string()).optional(),
});

const formSchema = z.object({
  supplier_id: z.string().min(1, { message: "المورد مطلوب" }),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  branch_id: z.string().min(1, { message: "الفرع مطلوب" }),
  order_number: z.string().min(1, { message: "رقم الطلبية مطلوب" }),
  type: z.string().optional(),
  order_date: z.string().min(1, { message: "تاريخ الطلبية مطلوب" }),
  status: z.string().optional(),
  total_amount: z.number(),
  payment_amount: z.number().min(0),
  remaining_payment: z.number(),
  notes: z.string().optional().nullable(),
  clothes: z.array(clothSchema),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغى" },
] as const;

const EMPTY_FORM: FormValues = {
  supplier_id: "",
  category_id: "",
  subcategory_id: "",
  branch_id: "",
  order_number: "",
  type: "fabric",
  order_date: "",
  status: "pending",
  total_amount: 0,
  payment_amount: 0,
  remaining_payment: 0,
  notes: "",
  clothes: [],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(v: string | number | null | undefined): number {
  if (typeof v === "number") return v;
  return parseFloat(String(v)) || 0;
}

function mapDetailToForm(d: TSupplierOrderDetailResponse): FormValues {
  const clothes = (d.clothes ?? []).map((c) => ({
    cloth_id: resolveClothId(c),
    price: toNumber(c.price),
    payment: toNumber(c.payment),
    notes: c.notes ?? "",
    category_id: c.category_id != null ? String(c.category_id) : "",
    subcategory_ids: (c.subcategory_ids ?? []).map(String),
  }));

  const totalAmount = clothes.reduce((s, c) => s + c.price, 0);
  const paymentAmount = clothes.reduce((s, c) => s + c.payment, 0);

  return {
    supplier_id: String(d.supplier_id ?? ""),
    category_id: d.category_id != null ? String(d.category_id) : "",
    subcategory_id: d.subcategory_id != null ? String(d.subcategory_id) : "",
    branch_id: d.branch_id != null ? String(d.branch_id) : "",
    order_number: d.order_number ?? "",
    type: d.type ?? "fabric",
    order_date: d.order_date ?? "",
    status: d.status ?? "pending",
    total_amount: totalAmount,
    payment_amount: toNumber(d.payment_amount) || paymentAmount,
    remaining_payment:
      toNumber(d.remaining_payment) || totalAmount - paymentAmount,
    notes: d.notes ?? "",
    clothes,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  order: TSupplierOrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSupplierOrderModal({ order, open, onOpenChange }: Props) {
  const orderId = order?.id ?? 0;
  const supplierId = order?.supplier_id ?? 0;

  // ---- queries ----
  const {
    data: orderDetail,
    isLoading: isLoadingDetail,
    isFetched,
  } = useQuery(
    useGetSupplierOrderQueryOptions(supplierId, orderId, {
      enabled: open && orderId > 0 && supplierId > 0,
    }),
  );

  const { data: suppliersList, isLoading: isLoadingSuppliers } = useQuery(
    useGetSuppliersListQueryOptions(),
  );

  const { mutate: updateOrder, isPending } = useMutation(
    useUpdateSupplierOrderMutationOptions(),
  );

  const detailNotAvailable = isFetched && !orderDetail && orderId > 0;

  // ---- form ----
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "clothes",
  });

  const watchedClothes = useWatch({ control: form.control, name: "clothes" });
  const categoryId = form.watch("category_id");

  const totals = useMemo(() => {
    const list = watchedClothes ?? [];
    const total = list.reduce((s, c) => s + (Number(c?.price) || 0), 0);
    const paid = list.reduce((s, c) => s + (Number(c?.payment) || 0), 0);
    return { total_amount: total, payment_amount: paid, remaining_payment: total - paid };
  }, [watchedClothes]);

  useEffect(() => {
    if (open && orderDetail) {
      form.reset(mapDetailToForm(orderDetail));
    }
  }, [orderDetail, open, form]);

  // ---- submit ----
  const onSubmit = useCallback(
    (values: FormValues) => {
      if (!order) return;

      const clothes = (values.clothes ?? []).map((c) => {
        const price = Number(c.price) || 0;
        const payment = Number(c.payment) || 0;
        return {
          cloth_id: c.cloth_id,
          price,
          payment,
          remaining: price - payment,
          notes: c.notes?.trim() || null,
          category_id: c.category_id ? Number(c.category_id) : undefined,
          subcategory_ids: c.subcategory_ids?.length
            ? c.subcategory_ids.map(Number)
            : undefined,
        };
      });

      const payload: TUpdateSupplierOrderRequest = {
        supplier_id: Number(values.supplier_id),
        category_id: values.category_id ? Number(values.category_id) : 0,
        subcategory_id: values.subcategory_id
          ? Number(values.subcategory_id)
          : 0,
        branch_id: Number(values.branch_id),
        order_number: values.order_number.trim(),
        type: values.type?.trim() || undefined,
        order_date: values.order_date?.slice(0, 10) ?? "",
        status: values.status?.trim() || undefined,
        total_amount: totals.total_amount,
        payment_amount: totals.payment_amount,
        remaining_payment: totals.remaining_payment,
        notes: values.notes?.trim() || null,
        clothes,
      };

      updateOrder(
        { id: order.id, data: payload },
        {
          onSuccess: () => {
            toast.success("تم تحديث الطلبية بنجاح");
            onOpenChange(false);
          },
          onError: (err: { message?: string }) => {
            toast.error("حدث خطأ أثناء تحديث الطلبية", {
              description: err?.message,
            });
          },
        },
      );
    },
    [order, totals, updateOrder, onOpenChange],
  );

  const showLoader = isLoadingDetail || isLoadingSuppliers;

  // ---- render ----
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-center">تحديث طلبية مورد</DialogTitle>
          <DialogDescription className="text-center">
            تعديل بيانات الطلبية والقطع
          </DialogDescription>
        </DialogHeader>

        {showLoader && !orderDetail ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : detailNotAvailable ? (
          <p className="py-6 text-center text-muted-foreground">
            تعذر تحميل تفاصيل الطلبية. التعديل غير متاح.
          </p>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المورد</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingSuppliers || isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingSuppliers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          suppliersList?.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category / Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قسم المنتجات (اختياري)</FormLabel>
                      <FormControl>
                        <CategoriesSelect
                          value={field.value ?? ""}
                          onChange={(id) => {
                            field.onChange(id);
                            form.setValue("subcategory_id", "");
                          }}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قسم فرعي (اختياري)</FormLabel>
                      <FormControl>
                        <SubcategoriesSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          category_id={
                            categoryId ? Number(categoryId) : undefined
                          }
                          disabled={isPending || !categoryId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Branch */}
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفرع</FormLabel>
                    <FormControl>
                      <BranchesSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order number / type */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الطلبية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SO-20260201-0001"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الطلبية</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? "fabric"}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="نوع الطلبية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fabric">قماش</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date / Status */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الطلبية</FormLabel>
                      <FormControl>
                        <CustomCalendar
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اختر التاريخ"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حالة الطلبية</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? "pending"}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Computed totals (read-only) */}
              <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/20 p-3">
                <FormItem>
                  <FormLabel className="text-xs">الإجمالي (محسوب)</FormLabel>
                  <Input
                    readOnly
                    value={toEnglishNumerals(totals.total_amount)}
                    className="tabular-nums"
                    dir="ltr"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel className="text-xs">المدفوع (محسوب)</FormLabel>
                  <Input
                    readOnly
                    value={toEnglishNumerals(totals.payment_amount)}
                    className="tabular-nums"
                    dir="ltr"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel className="text-xs">المتبقي (محسوب)</FormLabel>
                  <Input
                    readOnly
                    value={toEnglishNumerals(totals.remaining_payment)}
                    className="tabular-nums"
                    dir="ltr"
                  />
                </FormItem>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ملاحظات..."
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Clothes */}
              {fields.length > 0 && (
                <div className="space-y-2">
                  <FormLabel>القطع</FormLabel>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <span className="col-span-2 text-sm font-medium text-muted-foreground">
                          قطعة #{toEnglishNumerals(index + 1)}
                        </span>

                        <FormField
                          control={form.control}
                          name={`clothes.${index}.price`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>السعر</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={f.value ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value.replace(
                                      /[^0-9.]/g,
                                      "",
                                    );
                                    f.onChange(v === "" ? 0 : Number(v) || 0);
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`clothes.${index}.payment`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>المدفوع</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={f.value ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value.replace(
                                      /[^0-9.]/g,
                                      "",
                                    );
                                    f.onChange(v === "" ? 0 : Number(v) || 0);
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`clothes.${index}.category_id`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>قسم (اختياري)</FormLabel>
                              <FormControl>
                                <CategoriesSelect
                                  value={f.value ?? ""}
                                  onChange={(id) => {
                                    f.onChange(id);
                                    form.setValue(
                                      `clothes.${index}.subcategory_ids`,
                                      [],
                                    );
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`clothes.${index}.subcategory_ids`}
                          render={({ field: f }) => {
                            const clothCat = form.watch(
                              `clothes.${index}.category_id`,
                            );
                            return (
                              <FormItem>
                                <FormLabel>أقسام فرعية (اختياري)</FormLabel>
                                <FormControl>
                                  <SubcategoriesSelect
                                    multiple
                                    value={f.value ?? []}
                                    onChange={f.onChange}
                                    category_id={
                                      clothCat ? Number(clothCat) : undefined
                                    }
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`clothes.${index}.notes`}
                          render={({ field: f }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>ملاحظات (اختياري)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ملاحظات للقطعة"
                                  {...f}
                                  value={f.value ?? ""}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending || !orderDetail}>
                  {isPending ? "جاري التحديث..." : "تحديث"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
