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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TSupplierOrderResponse, TUpdateSupplierOrderRequest } from "@/api/v2/suppliers/suppliers.types";
import { useUpdateSupplierOrderMutationOptions, useGetSuppliersListQueryOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { CustomCalendar } from "@/components/custom/CustomCalendar";

const formSchema = z.object({
  supplier_id: z.string().min(1, { message: "المورد مطلوب" }),
  category_id: z.string().min(1, { message: "الفئة مطلوبة" }),
  subcategory_id: z.string().min(1, { message: "الفئة الفرعية مطلوبة" }),
  branch_id: z.string().min(1, { message: "الفرع مطلوب" }),
  order_number: z.string().min(1, { message: "رقم الطلبية مطلوب" }),
  order_date: z.string().min(1, { message: "تاريخ الطلبية مطلوب" }),
  payment_amount: z.number().min(0, { message: "المدفوع ≥ 0" }),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  order: TSupplierOrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSupplierOrderModal({ order, open, onOpenChange }: Props) {
  const { mutate: updateOrder, isPending } = useMutation(
    useUpdateSupplierOrderMutationOptions()
  );
  const { data: suppliersList, isLoading: isLoadingSuppliers } = useQuery(
    useGetSuppliersListQueryOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: "",
      category_id: "",
      subcategory_id: "",
      branch_id: "",
      order_number: "",
      order_date: "",
      payment_amount: 0,
      notes: "",
    },
  });

  const categoryId = form.watch("category_id");

  useEffect(() => {
    if (!order || !open) return;
    form.reset({
      supplier_id: String(order.supplier_id ?? ""),
      category_id: order.category_id != null ? String(order.category_id) : "",
      subcategory_id: order.subcategory_id != null ? String(order.subcategory_id) : "",
      branch_id: order.branch_id != null ? String(order.branch_id) : "",
      order_number: order.order_number ?? "",
      order_date: order.order_date ?? "",
      payment_amount: order.payment_amount != null ? parseFloat(String(order.payment_amount)) : 0,
      notes: order.notes ?? "",
    });
  }, [order, open, form]);

  const onSubmit = (values: FormValues) => {
    if (!order) return;
    const requestData: TUpdateSupplierOrderRequest = {
      supplier_id: Number(values.supplier_id),
      category_id: Number(values.category_id),
      subcategory_id: Number(values.subcategory_id),
      branch_id: Number(values.branch_id),
      order_number: values.order_number.trim(),
      order_date: values.order_date,
      payment_amount: Number(values.payment_amount),
      notes: values.notes?.trim() || null,
    };
    updateOrder(
      { id: order.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الطلبية بنجاح");
          onOpenChange(false);
        },
        onError: (error: { message?: string }) => {
          toast.error("حدث خطأ أثناء تحديث الطلبية", { description: error?.message });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">تحديث طلبية مورد</DialogTitle>
          <DialogDescription className="text-center">
            تعديل بيانات الطلبية (المورد، الفئة، الفرع، رقم الطلبية، التاريخ، المدفوع، الملاحظات).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        suppliersList?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <CategoriesSelect
                        value={field.value}
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
                    <FormLabel>الفئة الفرعية</FormLabel>
                    <FormControl>
                      <SubcategoriesSelect
                        value={field.value}
                        onChange={field.onChange}
                        category_id={categoryId ? Number(categoryId) : undefined}
                        disabled={isPending || !categoryId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الطلبية</FormLabel>
                  <FormControl>
                    <Input placeholder="SO-20260201-0001" {...field} value={field.value ?? ""} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="payment_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المدفوع</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      disabled={isPending}
                    />
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
                    <Input placeholder="ملاحظات..." {...field} value={field.value ?? ""} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "تحديث"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
