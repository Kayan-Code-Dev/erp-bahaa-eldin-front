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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { TSupplierResponse } from "@/api/v2/suppliers/suppliers.types";
import { useUpdateSupplierMutationOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { TUpdateSupplierRequest } from "@/api/v2/suppliers/suppliers.types";
import { toast } from "sonner";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for the form
const formSchema = z.object({
  supplier_name: z.string().min(1, { message: "اسم المورد مطلوب" }),
  supplier_code: z.string().min(1, { message: "كود المورد مطلوب" }),
  order_type: z.enum(["تفصيل", "بيع"], {
    required_error: "نوع الطلبية مطلوب",
  }),
  purchase_date: z.string({ required_error: "تاريخ الشراء مطلوب" }),
  order_amount: z.number().min(0, { message: "مبلغ الطلبية يجب أن يكون أكبر من أو يساوي 0" }),
  paid_amount: z.number().min(0, { message: "المدفوع يجب أن يكون أكبر من أو يساوي 0" }),
  remaining_amount: z.number().min(0, { message: "المتبقي يجب أن يكون أكبر من أو يساوي 0" }),
  item_name: z.string().optional(),
  item_code: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  model_id: z.string().optional(),
  branch_id: z.string({ required_error: "الفرع مطلوب" }),
  add_model: z.boolean().default(false),
}).refine((data) => {
  return data.remaining_amount === data.order_amount - data.paid_amount;
}, {
  message: "المتبقي يجب أن يساوي (مبلغ الطلبية - المدفوع)",
  path: ["remaining_amount"],
});

type Props = {
  supplier: TSupplierResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSupplierModal({ supplier, open, onOpenChange }: Props) {
  const { mutate: updateSupplier, isPending } = useMutation(
    useUpdateSupplierMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_name: "",
      supplier_code: "",
      order_type: "تفصيل",
      purchase_date: "",
      order_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      item_name: "",
      item_code: "",
      category_id: "",
      subcategory_id: "",
      model_id: "",
      branch_id: "",
      add_model: false,
    },
  });

  const categoryId = useWatch({ control: form.control, name: "category_id" });
  const orderAmount = useWatch({ control: form.control, name: "order_amount" });
  const paidAmount = useWatch({ control: form.control, name: "paid_amount" });

  // Calculate remaining amount when order_amount or paid_amount changes
  useEffect(() => {
    const remaining = orderAmount - paidAmount;
    form.setValue("remaining_amount", Math.max(0, remaining));
  }, [orderAmount, paidAmount, form]);

  // Populate form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        supplier_name: supplier.supplier_name,
        supplier_code: supplier.supplier_code,
        order_type: supplier.order_type,
        purchase_date: supplier.purchase_date,
        order_amount: supplier.order_amount,
        paid_amount: supplier.paid_amount,
        remaining_amount: supplier.remaining_amount,
        item_name: supplier.item_name || "",
        item_code: supplier.item_code || "",
        category_id: supplier.category?.id.toString() || "",
        subcategory_id: supplier.subcategory?.id.toString() || "",
        model_id: supplier.model?.id.toString() || "",
        branch_id: supplier.branch?.id.toString() || "",
        add_model: false,
      });
    }
  }, [supplier, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!supplier) return;

    const requestData: TUpdateSupplierRequest = {
      supplier_name: values.supplier_name,
      supplier_code: values.supplier_code,
      order_type: values.order_type,
      purchase_date: values.purchase_date,
      order_amount: values.order_amount,
      paid_amount: values.paid_amount,
      remaining_amount: values.remaining_amount,
      item_name: values.item_name || undefined,
      item_code: values.item_code || undefined,
      category_id: values.category_id ? Number(values.category_id) : undefined,
      subcategory_id: values.subcategory_id ? Number(values.subcategory_id) : undefined,
      model_id: values.model_id ? Number(values.model_id) : undefined,
      branch_id: Number(values.branch_id),
      add_model: values.add_model,
    };

    updateSupplier(
      { id: supplier.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المورد بنجاح", {
            description: "تم تحديث بيانات المورد بنجاح.",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث المورد", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل مورد</DialogTitle>
          <DialogDescription className="text-center">
            قم بتعديل بيانات المورد.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Supplier Name */}
            <FormField
              control={form.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المورد</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم المورد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Supplier Code */}
            <FormField
              control={form.control}
              name="supplier_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كود المورد</FormLabel>
                  <FormControl>
                    <Input placeholder="كود المورد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Order Type */}
              <FormField
                control={form.control}
                name="order_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الطلبية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الطلبية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="تفصيل">تفصيل</SelectItem>
                        <SelectItem value="بيع">بيع</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Date */}
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الشراء</FormLabel>
                    <FormControl>
                      <CustomCalendar
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر تاريخ الشراء"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Order Amount */}
              <FormField
                control={form.control}
                name="order_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ الطلبية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Paid Amount */}
              <FormField
                control={form.control}
                name="paid_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدفوع</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remaining Amount */}
              <FormField
                control={form.control}
                name="remaining_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المتبقي</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">معلومات الصنف</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Item Name */}
                <FormField
                  control={form.control}
                  name="item_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الصنف</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم الصنف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Item Code */}
                <FormField
                  control={form.control}
                  name="item_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود الصنف</FormLabel>
                      <FormControl>
                        <Input placeholder="كود الصنف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <FormControl>
                      <CategoriesSelect
                        value={field.value || ""}
                        onChange={(id) => {
                          field.onChange(id);
                          form.setValue("subcategory_id", "");
                          form.setValue("model_id", "");
                        }}
                        disabled={isPending}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subcategory */}
                <FormField
                  control={form.control}
                  name="subcategory_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة الفرعية</FormLabel>
                      <FormControl>
                        <SubcategoriesSelect
                          value={field.value || ""}
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

              {/* Model */}
              <FormField
                control={form.control}
                name="model_id"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>الموديل</FormLabel>
                    <FormControl>
                      <ClothModelsSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Branch */}
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>الفرع المراد الشراء له</FormLabel>
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

              {/* Add Model Switch */}
              <FormField
                control={form.control}
                name="add_model"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">إضافة موديل على هذا المورد</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4 gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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

