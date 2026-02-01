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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Suspense } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import {
  useCreateSupplierOrderMutationOptions,
  useCreateSupplierMinimalMutationOptions,
  useGetSuppliersListQueryOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import {
  TCreateSupplierOrderRequest,
  TCreateSupplierOrderClothItem,
} from "@/api/v2/suppliers/suppliers.types";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { EntitySelect } from "@/components/custom/EntitySelect";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ready_for_rent", label: "جاهز للإيجار" },
  { value: "rented", label: "مؤجر" },
  { value: "damaged", label: "تالف" },
  { value: "burned", label: "محترق" },
  { value: "scratched", label: "مخدوش" },
  { value: "repairing", label: "قيد الإصلاح" },
  { value: "die", label: "ميت" },
];

const clothItemSchema = z.object({
  code: z.string().min(1, "كود الصنف مطلوب"),
  name: z.string().min(1, "اسم الصنف مطلوب"),
  description: z.string().optional(),
  cloth_type_id: z.string().min(1, "الموديل مطلوب"),
  breast_size: z.string().min(1, "مقاس الصدر مطلوب"),
  waist_size: z.string().min(1, "مقاس الخصر مطلوب"),
  sleeve_size: z.string().min(1, "مقاس الكم مطلوب"),
  notes: z.string().optional().nullable(),
  status: z.string().min(1, "الحالة مطلوبة"),
  entity_type: z.enum(["branch", "factory", "workshop"], { required_error: "نوع المكان مطلوب" }),
  entity_id: z.string().min(1, "المكان مطلوب"),
  price: z.number().min(0, "السعر يجب أن يكون ≥ 0"),
});

const formSchema = z
  .object({
    add_new_supplier: z.boolean().default(false),
    supplier_id: z.string().optional(),
    supplier_name: z.string().optional(),
    supplier_code: z.string().optional(),
    category_id: z.string().min(1, { message: "الفئة مطلوبة" }),
    subcategory_id: z.string().min(1, { message: "الفئة الفرعية مطلوبة" }),
    branch_id: z.string().min(1, { message: "الفرع مطلوب" }),
    order_date: z.string().min(1, { message: "تاريخ الطلبية مطلوب" }),
    total_amount: z.number().min(0, { message: "الإجمالي ≥ 0" }),
    payment_amount: z.number().min(0, { message: "المدفوع ≥ 0" }),
    remaining_payment: z.number().min(0, { message: "المتبقي ≥ 0" }),
    notes: z.string().optional().nullable(),
    clothes: z.array(clothItemSchema).min(1, { message: "يجب إضافة صنف واحد على الأقل" }),
  })
  .refine((data) => data.remaining_payment === data.total_amount - data.payment_amount, {
    message: "المتبقي يجب أن يساوي (الإجمالي - المدفوع)",
    path: ["remaining_payment"],
  })
  .superRefine((data, ctx) => {
    if (data.add_new_supplier) {
      if (!data.supplier_name?.trim()) ctx.addIssue({ code: "custom", message: "اسم المورد مطلوب", path: ["supplier_name"] });
      if (!data.supplier_code?.trim()) ctx.addIssue({ code: "custom", message: "كود المورد مطلوب", path: ["supplier_code"] });
    } else {
      if (!data.supplier_id?.trim()) ctx.addIssue({ code: "custom", message: "المورد مطلوب", path: ["supplier_id"] });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const defaultClothItem = {
  code: "",
  name: "",
  description: "",
  cloth_type_id: "",
  breast_size: "",
  waist_size: "",
  sleeve_size: "",
  notes: null as string | null,
  status: "ready_for_rent",
  entity_type: "branch" as const,
  entity_id: "",
  price: 0,
};

function CreateSupplierOrderForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierIdFromUrl = searchParams.get("supplier_id");

  // Mutations
  const { mutate: createSupplierMinimal, isPending: isCreatingSupplier } = useMutation(
    useCreateSupplierMinimalMutationOptions()
  );
  const { mutate: createSupplierOrder, isPending: isCreatingOrder } = useMutation(
    useCreateSupplierOrderMutationOptions()
  );
  const isPending = isCreatingSupplier || isCreatingOrder;

  // Data Fetching
  const { data: suppliersList, isLoading: isLoadingSuppliers } = useQuery(
    useGetSuppliersListQueryOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      add_new_supplier: false,
      supplier_id: supplierIdFromUrl ?? "",
      supplier_name: "",
      supplier_code: "",
      category_id: "",
      subcategory_id: "",
      branch_id: "",
      order_date: "",
      total_amount: 0,
      payment_amount: 0,
      remaining_payment: 0,
      notes: "",
      clothes: [defaultClothItem],
    },
  });

  const addNewSupplier = useWatch({ control: form.control, name: "add_new_supplier" });

  React.useEffect(() => {
    if (supplierIdFromUrl && form.getValues("supplier_id") !== supplierIdFromUrl) {
      form.setValue("supplier_id", supplierIdFromUrl);
    }
  }, [supplierIdFromUrl, form]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "clothes" });
  const categoryId = useWatch({ control: form.control, name: "category_id" });
  const totalAmount = useWatch({ control: form.control, name: "total_amount" });
  const paymentAmount = useWatch({ control: form.control, name: "payment_amount" });

  React.useEffect(() => {
    const remaining = (totalAmount ?? 0) - (paymentAmount ?? 0);
    form.setValue("remaining_payment", Math.max(0, remaining));
  }, [totalAmount, paymentAmount, form]);

  const submitOrder = (supplierId: number, values: FormValues) => {
    const clothes: TCreateSupplierOrderClothItem[] = values.clothes.map((c) => ({
      code: c.code,
      name: c.name,
      description: c.description || undefined,
      cloth_type_id: Number(c.cloth_type_id),
      breast_size: c.breast_size,
      waist_size: c.waist_size,
      sleeve_size: c.sleeve_size,
      notes: c.notes ?? undefined,
      status: c.status,
      entity_type: c.entity_type as "branch" | "factory" | "workshop",
      entity_id: Number(c.entity_id),
      price: Number(c.price),
    }));

    const requestData: TCreateSupplierOrderRequest = {
      supplier_id: supplierId,
      category_id: Number(values.category_id),
      subcategory_id: Number(values.subcategory_id),
      branch_id: Number(values.branch_id),
      order_date: values.order_date,
      payment_amount: Number(values.payment_amount),
      total_amount: Number(values.total_amount),
      remaining_payment: Number(values.remaining_payment),
      notes: values.notes ?? undefined,
      clothes,
    };

    createSupplierOrder(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء طلبية المورد بنجاح");
        form.reset({
          add_new_supplier: false,
          supplier_id: "",
          supplier_name: "",
          supplier_code: "",
          category_id: "",
          subcategory_id: "",
          branch_id: "",
          order_date: "",
          total_amount: 0,
          payment_amount: 0,
          remaining_payment: 0,
          notes: "",
          clothes: [defaultClothItem],
        });
        navigate("/suppliers/orders");
      },
      onError: (error: { message?: string }) => {
        toast.error("حدث خطأ أثناء إنشاء طلبية المورد", { description: error?.message });
      },
    });
  };

  const onSubmit = (values: FormValues) => {
    if (values.add_new_supplier) {
      createSupplierMinimal(
        { name: values.supplier_name!.trim(), code: values.supplier_code!.trim() },
        {
          onSuccess: (data) => {
            const newSupplierId = data?.id;
            if (newSupplierId) {
              submitOrder(newSupplierId, values);
            } else {
              toast.error("لم يتم الحصول على معرف المورد بعد الإنشاء");
            }
          },
          onError: (error: { message?: string }) => {
            toast.error("حدث خطأ أثناء إنشاء المورد", { description: error?.message });
          },
        }
      );
    } else {
      submitOrder(Number(values.supplier_id), values);
    }
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إضافة طلبية مورد</CardTitle>
          <CardDescription>
            املأ البيانات لإضافة طلبية جديدة للمورد مع أصناف الملابس.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="add_new_supplier"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">إضافة مورد جديد لهذه الطلبية</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        عند التفعيل أدخل اسم وكود المورد الجديد بدل اختيار مورد موجود
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!addNewSupplier ? (
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
              ) : (
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <FormField
                    control={form.control}
                    name="supplier_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المورد</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المورد" {...field} value={field.value ?? ""} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplier_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كود المورد</FormLabel>
                        <FormControl>
                          <Input placeholder="كود المورد" {...field} value={field.value ?? ""} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الطلبية</FormLabel>
                    <FormControl>
                      <CustomCalendar
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر تاريخ الطلبية"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الإجمالي</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remaining_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المتبقي</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} readOnly {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="ملاحظات..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">أصناف الطلبية</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(defaultClothItem)}
                    disabled={isPending}
                  >
                    إضافة صنف
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30 mb-4"
                  >
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.code`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>كود الصنف</FormLabel>
                          <FormControl>
                            <Input placeholder="CLT-001" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>اسم الصنف</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم الصنف" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.description`}
                      render={({ field: f }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>الوصف (اختياري)</FormLabel>
                          <FormControl>
                            <Input placeholder="وصف الصنف" {...f} value={f.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.cloth_type_id`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>الموديل</FormLabel>
                          <FormControl>
                            <ClothModelsSelect
                              value={f.value}
                              onChange={f.onChange}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.status`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>الحالة</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value} disabled={isPending}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((opt) => (
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
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.breast_size`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>مقاس الصدر</FormLabel>
                          <FormControl>
                            <Input placeholder="XL" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.waist_size`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>مقاس الخصر</FormLabel>
                          <FormControl>
                            <Input placeholder="32" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.sleeve_size`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>مقاس الكم</FormLabel>
                          <FormControl>
                            <Input placeholder="L" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              {...f}
                              onChange={(e) => f.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clothes.${index}.notes`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>ملاحظات (اختياري)</FormLabel>
                          <FormControl>
                            <Input placeholder="ملاحظات" {...f} value={f.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2">
                      <EntitySelect
                        mode="form"
                        control={form.control}
                        entityTypeName={`clothes.${index}.entity_type` as const}
                        entityIdName={`clothes.${index}.entity_id` as const}
                        entityTypeLabel="نوع المكان"
                        entityIdLabel="المكان"
                        disabled={isPending}
                      />
                    </div>
                    {fields.length > 1 && (
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={isPending}
                        >
                          حذف الصنف
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {form.formState.errors.clothes?.message && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.clothes.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate("/suppliers/orders")}>
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
