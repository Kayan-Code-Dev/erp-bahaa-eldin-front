import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCreateSupplierOrderMutationOptions, useGetSuppliersListQueryOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { TCreateSupplierOrderRequest } from "@/api/v2/suppliers/suppliers.types";
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
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Schema for the form
const formSchema = z.object({
  add_new_supplier: z.boolean().default(false),
  supplier_id: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  order_type: z.enum(["تفصيل", "بيع"], {
    required_error: "نوع الطلبية مطلوب",
  }),
  purchase_date: z.string({ required_error: "تاريخ الشراء مطلوب" }),
  order_amount: z.number().min(0, { message: "مبلغ الطلبية يجب أن يكون أكبر من أو يساوي 0" }),
  paid_amount: z.number().min(0, { message: "المدفوع يجب أن يكون أكبر من أو يساوي 0" }),
  remaining_amount: z.number().min(0, { message: "المتبقي يجب أن يكون أكبر من أو يساوي 0" }),
  item_name: z.string().min(1, { message: "اسم الصنف مطلوب" }),
  item_code: z.string().min(1, { message: "كود الصنف مطلوب" }),
  category_id: z.string({ required_error: "الفئة مطلوبة" }),
  subcategory_id: z.string({ required_error: "الفئة الفرعية مطلوبة" }),
  model_id: z.string().optional(),
  branch_id: z.string({ required_error: "الفرع مطلوب" }),
}).refine((data) => {
  return data.remaining_amount === data.order_amount - data.paid_amount;
}, {
  message: "المتبقي يجب أن يساوي (مبلغ الطلبية - المدفوع)",
  path: ["remaining_amount"],
}).refine((data) => {
  if (data.add_new_supplier) {
    return data.name && data.name.length > 0 && data.code && data.code.length > 0;
  } else {
    return data.supplier_id && data.supplier_id.length > 0;
  }
}, {
  message: data => data.add_new_supplier ? "اسم المورد وكود المورد مطلوبان" : "المورد مطلوب",
  path: data => data.add_new_supplier ? ["name"] : ["supplier_id"],
});

function CreateSupplierOrderForm() {
  const navigate = useNavigate();
  const { mutate: createSupplierOrder, isPending } = useMutation(
    useCreateSupplierOrderMutationOptions()
  );

  const { data: suppliersList, isLoading: isLoadingSuppliers } = useQuery(
    useGetSuppliersListQueryOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      add_new_supplier: false,
      supplier_id: "",
      name: "",
      code: "",
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
    },
  });

  const addNewSupplier = useWatch({ control: form.control, name: "add_new_supplier" });
  const categoryId = useWatch({ control: form.control, name: "category_id" });
  const orderAmount = useWatch({ control: form.control, name: "order_amount" });
  const paidAmount = useWatch({ control: form.control, name: "paid_amount" });

  // Calculate remaining amount when order_amount or paid_amount changes
  React.useEffect(() => {
    const remaining = orderAmount - paidAmount;
    form.setValue("remaining_amount", Math.max(0, remaining));
  }, [orderAmount, paidAmount, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateSupplierOrderRequest = {
      supplier_id: values.add_new_supplier ? undefined : Number(values.supplier_id),
      name: values.add_new_supplier ? values.name : undefined,
      code: values.add_new_supplier ? values.code : undefined,
      order_type: values.order_type,
      purchase_date: values.purchase_date,
      order_amount: values.order_amount,
      paid_amount: values.paid_amount,
      remaining_amount: values.remaining_amount,
      item_name: values.item_name,
      item_code: values.item_code,
      category_id: Number(values.category_id),
      subcategory_id: Number(values.subcategory_id),
      model_id: values.model_id ? Number(values.model_id) : undefined,
      branch_id: Number(values.branch_id),
    };

    createSupplierOrder(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء طلبية المورد بنجاح", {
          description: "تمت إضافة طلبية المورد بنجاح للنظام.",
        });
        form.reset();
        navigate("/suppliers");
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء طلبية المورد", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إضافة طلبية</CardTitle>
          <CardDescription>
            املأ البيانات لإضافة طلبية جديدة للمورد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Add New Supplier Switch */}
              <FormField
                control={form.control}
                name="add_new_supplier"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">إضافة مورد جديد لهذه الطلبية</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("supplier_id", "");
                          } else {
                            form.setValue("name", "");
                            form.setValue("code", "");
                          }
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!addNewSupplier ? (
                /* Supplier Selection */
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
                              <SelectItem
                                key={supplier.id}
                                value={supplier.id.toString()}
                              >
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
              ) : null}

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
                            value={field.value}
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

                {/* Model */}
                <FormField
                  control={form.control}
                  name="model_id"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>الموديل</FormLabel>
                      <FormControl>
                        <ClothModelsSelect
                          value={field.value}
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
              </div>

              {addNewSupplier && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">معلومات المورد الجديد</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Supplier Name */}
                    <FormField
                      control={form.control}
                      name="name"
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
                      name="code"
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
                  </div>
                </div>
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
                  {isPending ? "جاري الإنشاء..." : "إنشاء طلبية"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateSupplierOrder() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <CreateSupplierOrderForm />
    </Suspense>
  );
}

