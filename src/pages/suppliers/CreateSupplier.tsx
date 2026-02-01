import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useCreateSupplierMutationOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { TCreateSupplierRequest } from "@/api/v2/suppliers/suppliers.types";
import { toast } from "sonner";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { useWatch } from "react-hook-form";
import * as React from "react";
import { useNavigate } from "react-router";
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
  show_details: z.boolean().default(false),
  order_type: z.enum(["تفصيل", "بيع"]).optional(),
  purchase_date: z.string().optional(),
  order_amount: z.number().min(0).optional(),
  paid_amount: z.number().min(0).optional(),
  remaining_amount: z.number().min(0).optional(),
  item_name: z.string().optional(),
  item_code: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  model_id: z.string().optional(),
  branch_id: z.string().optional(),
  add_model: z.boolean().default(false),
}).refine((data) => {
  if (!data.show_details) return true;
  // Validate that remaining_amount = order_amount - paid_amount when show_details is true
  if (data.order_amount !== undefined && data.paid_amount !== undefined && data.remaining_amount !== undefined) {
    return data.remaining_amount === data.order_amount - data.paid_amount;
  }
  return true;
}, {
  message: "المتبقي يجب أن يساوي (مبلغ الطلبية - المدفوع)",
  path: ["remaining_amount"],
});

function CreateSupplier() {
  const navigate = useNavigate();
  const { mutate: createSupplier, isPending } = useMutation(
    useCreateSupplierMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_name: "",
      supplier_code: "",
      show_details: false,
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

  const showDetails = useWatch({ control: form.control, name: "show_details" });

  const categoryId = useWatch({ control: form.control, name: "category_id" });
  const orderAmount = useWatch({ control: form.control, name: "order_amount" });
  const paidAmount = useWatch({ control: form.control, name: "paid_amount" });

  // Calculate remaining amount when order_amount or paid_amount changes
  React.useEffect(() => {
    if (showDetails && orderAmount !== undefined && paidAmount !== undefined) {
      const remaining = orderAmount - paidAmount;
      form.setValue("remaining_amount", Math.max(0, remaining));
    }
  }, [orderAmount, paidAmount, form, showDetails]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateSupplierRequest = {
      supplier_name: values.supplier_name,
      supplier_code: values.supplier_code,
      order_type: values.show_details ? values.order_type : undefined,
      purchase_date: values.show_details ? values.purchase_date : undefined,
      order_amount: values.show_details ? values.order_amount : undefined,
      paid_amount: values.show_details ? values.paid_amount : undefined,
      remaining_amount: values.show_details ? values.remaining_amount : undefined,
      item_name: values.show_details ? values.item_name : undefined,
      item_code: values.show_details ? values.item_code : undefined,
      category_id: values.show_details && values.category_id ? Number(values.category_id) : undefined,
      subcategory_id: values.show_details && values.subcategory_id ? Number(values.subcategory_id) : undefined,
      model_id: values.show_details && values.model_id ? Number(values.model_id) : undefined,
      branch_id: values.show_details && values.branch_id ? Number(values.branch_id) : undefined,
      add_model: values.show_details ? values.add_model : undefined,
    };

    createSupplier(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المورد بنجاح", {
          description: "تمت إضافة المورد بنجاح للنظام.",
        });
        form.reset();
        navigate("/suppliers");
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء المورد", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إضافة مورد جديد</CardTitle>
          <CardDescription>
            املأ البيانات لإضافة مورد جديد للنظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
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

              {/* Show Details Switch */}
              <FormField
                control={form.control}
                name="show_details"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base"> إضافة طلبية </FormLabel>
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

              {showDetails && (
                <>
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
                        <SelectTrigger className="w-full">
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
                        value={field.value || ""}
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
            </>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/suppliers")}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}

export default CreateSupplier;

