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
import {
  useCreateSupplierMinimalMutationOptions,
  useCreateSupplierMutationOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import {
  TCreateSupplierRequest,
  TCreateSupplierClothItem,
} from "@/api/v2/suppliers/suppliers.types";
import { toast } from "sonner";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { useWatch } from "react-hook-form";
import * as React from "react";
import { useFieldArray } from "react-hook-form";

const clothItemSchema = z.object({
  code: z.string().min(1, "كود الصنف مطلوب"),
  name: z.string().min(1, "اسم الصنف مطلوب"),
  cloth_type_id: z.string().min(1, "الموديل مطلوب"),
  entity_type: z.enum(["branch", "factory", "workshop"], { required_error: "نوع المكان مطلوب" }),
  entity_id: z.string().min(1, "المكان مطلوب"),
  price: z.number().min(0, "السعر يجب أن يكون ≥ 0"),
});

const formSchema = z
  .object({
    name: z.string().min(1, { message: "اسم المورد مطلوب" }),
    code: z.string().min(1, { message: "كود المورد مطلوب" }),
    add_order: z.boolean().default(false),
    category_id: z.string().optional(),
    subcategory_id: z.string().optional(),
    branch_id: z.string().optional(),
    order_date: z.string().optional(),
    total_amount: z.number().optional(),
    payment_amount: z.number().optional(),
    remaining_payment: z.number().optional(),
    notes: z.string().optional(),
    clothes: z.array(clothItemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.add_order) return;
    if (!data.category_id?.length) ctx.addIssue({ code: "custom", message: "الفئة مطلوبة", path: ["category_id"] });
    if (!data.subcategory_id?.length) ctx.addIssue({ code: "custom", message: "الفئة الفرعية مطلوبة", path: ["subcategory_id"] });
    if (!data.branch_id?.length) ctx.addIssue({ code: "custom", message: "الفرع مطلوب", path: ["branch_id"] });
    if (!data.order_date?.length) ctx.addIssue({ code: "custom", message: "تاريخ الطلبية مطلوب", path: ["order_date"] });
    if (data.total_amount == null || data.total_amount < 0) ctx.addIssue({ code: "custom", message: "الإجمالي ≥ 0", path: ["total_amount"] });
    if (data.payment_amount == null || data.payment_amount < 0) ctx.addIssue({ code: "custom", message: "المدفوع ≥ 0", path: ["payment_amount"] });
    if (data.remaining_payment == null || data.remaining_payment < 0) ctx.addIssue({ code: "custom", message: "المتبقي ≥ 0", path: ["remaining_payment"] });
    if (!data.clothes?.length) ctx.addIssue({ code: "custom", message: "يجب إضافة صنف واحد على الأقل", path: ["clothes"] });
    if (
      data.total_amount != null &&
      data.payment_amount != null &&
      data.remaining_payment != null &&
      data.remaining_payment !== data.total_amount - data.payment_amount
    ) {
      ctx.addIssue({ code: "custom", message: "المتبقي يجب أن يساوي (الإجمالي - المدفوع)", path: ["remaining_payment"] });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const defaultClothItem = {
  code: "",
  name: "",
  cloth_type_id: "",
  entity_type: "branch" as const,
  entity_id: "",
  price: 0,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSupplierModal({ open, onOpenChange }: Props) {
  // Mutations
  const mutateMinimal = useMutation(useCreateSupplierMinimalMutationOptions());
  const mutateWithOrder = useMutation(useCreateSupplierMutationOptions());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      add_order: false,
      category_id: "",
      subcategory_id: "",
      branch_id: "",
      order_date: "",
      total_amount: 0,
      payment_amount: 0,
      remaining_payment: 0,
      notes: "",
      clothes: [],
    },
  });

  const addOrder = useWatch({ control: form.control, name: "add_order" });
  const categoryId = useWatch({ control: form.control, name: "category_id" });
  const totalAmount = useWatch({ control: form.control, name: "total_amount" });
  const paymentAmount = useWatch({ control: form.control, name: "payment_amount" });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "clothes" });

  React.useEffect(() => {
    if (addOrder && totalAmount != null && paymentAmount != null) {
      form.setValue("remaining_payment", Math.max(0, totalAmount - paymentAmount));
    }
  }, [addOrder, totalAmount, paymentAmount, form]);

  React.useEffect(() => {
    if (addOrder && fields.length === 0) {
      append(defaultClothItem);
    }
  }, [addOrder, fields.length, append]);

  const isPending = mutateMinimal.isPending || mutateWithOrder.isPending;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        name: "",
        code: "",
        add_order: false,
        category_id: "",
        subcategory_id: "",
        branch_id: "",
        order_date: "",
        total_amount: 0,
        payment_amount: 0,
        remaining_payment: 0,
        notes: "",
        clothes: [],
      });
    }
    onOpenChange(next);
  };

  const onSubmit = (values: FormValues) => {
    if (!values.add_order) {
      mutateMinimal.mutate(
        { name: values.name, code: values.code },
        {
          onSuccess: () => {
            toast.success("تم إنشاء المورد بنجاح");
            handleOpenChange(false);
          },
          onError: (error: { message?: string }) => {
            toast.error("حدث خطأ أثناء إنشاء المورد", { description: error?.message });
          },
        }
      );
      return;
    }

    const clothes: TCreateSupplierClothItem[] = (values.clothes ?? []).map((c) => ({
      code: c.code,
      name: c.name,
      cloth_type_id: Number(c.cloth_type_id),
      entity_type: c.entity_type as "branch" | "factory" | "workshop",
      entity_id: Number(c.entity_id),
      price: Number(c.price),
    }));

    const requestData: TCreateSupplierRequest = {
      name: values.name,
      code: values.code,
      category_id: Number(values.category_id),
      subcategory_id: Number(values.subcategory_id),
      branch_id: Number(values.branch_id),
      order_date: values.order_date!,
      total_amount: Number(values.total_amount),
      payment_amount: Number(values.payment_amount),
      remaining_payment: Number(values.remaining_payment),
      notes: values.notes || undefined,
      clothes,
    };

    mutateWithOrder.mutate(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المورد والطلبية بنجاح");
        handleOpenChange(false);
      },
      onError: (error: { message?: string }) => {
        toast.error("حدث خطأ أثناء إنشاء المورد", { description: error?.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة مورد جديد</DialogTitle>
          <DialogDescription className="text-center">
            أدخل اسم المورد وكوده. فعّل «إنشاء طلبية لهذا المورد» لإدخال بيانات الطلبية والأصناف.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="add_order"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">إنشاء طلبية لهذا المورد</FormLabel>
                    <p className="text-sm text-muted-foreground">عند التفعيل تظهر حقول الطلبية والأصناف</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                  </FormControl>
                </FormItem>
              )}
            />

            {addOrder && (
              <>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة</FormLabel>
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
                        <FormLabel>الفئة الفرعية</FormLabel>
                        <FormControl>
                          <SubcategoriesSelect
                            value={field.value ?? ""}
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
                        <BranchesSelect value={field.value ?? ""} onChange={field.onChange} disabled={isPending} />
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
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="اختر التاريخ"
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
                          <Input value={field.value ?? ""} onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            field.onChange(val === "" ? 0 : Number(val) || 0);
                          }} />
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
                          <Input value={field.value ?? ""} onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            field.onChange(val === "" ? 0 : Number(val) || 0);
                          }} />
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
                          <Input readOnly value={field.value ?? ""} />
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
                        <Input placeholder="ملاحظات..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">أصناف الطلبية</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append(defaultClothItem)} disabled={isPending}>
                      إضافة صنف
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30 mb-4">
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
                        name={`clothes.${index}.cloth_type_id`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>الموديل</FormLabel>
                            <FormControl>
                              <ClothModelsSelect value={f.value ?? ""} onChange={f.onChange} disabled={isPending} />
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
                              <Input value={f.value ?? ""} onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, "");
                                f.onChange(val === "" ? 0 : Number(val) || 0);
                              }} />
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
                          <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={isPending}>
                            حذف الصنف
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {form.formState.errors.clothes?.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.clothes.message}</p>
                  )}
                </div>
              </>
            )}

            <DialogFooter className="gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإنشاء..." : addOrder ? "إنشاء المورد والطلبية" : "إنشاء المورد"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
