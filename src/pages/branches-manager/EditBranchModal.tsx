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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { TBranchResponse } from "@/api/v2/branches/branches.types";
import { useUpdateBranchMutationOptions } from "@/api/v2/branches/branches.hooks";
import { TUpdateBranchRequest } from "@/api/v2/branches/branches.types";
import { toast } from "sonner";
import { CitiesSelect } from "@/components/custom/CitiesSelect";
import { CurrenciesSelect } from "@/components/custom/CurrenciesSelect";

// Schema
const formSchema = z
  .object({
    branch_code: z.string().min(1, { message: "كود الفرع مطلوب" }),
    name: z.string().min(2, { message: "اسم الفرع مطلوب" }),
    street: z.string().min(1, { message: "الشارع مطلوب" }),
    building: z.string().min(1, { message: "المبنى مطلوب" }),
    city_id: z.string({ required_error: "المدينة مطلوبة" }),
    notes: z.string().optional(),
    inventory_name: z.string().min(1, { message: "اسم المخزن مطلوب" }),
    phone: z.string().optional(),
    vat_enabled: z.boolean().optional(),
    vat_type: z.enum(["fixed", "percentage"]).nullable().optional(),
    vat_value: z
      .union([z.string(), z.number()])
      .optional()
      .nullable(),
    currency_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.vat_enabled) {
      if (!data.vat_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "نوع الضريبة مطلوب عند تفعيلها",
          path: ["vat_type"],
        });
      }
      if (
        data.vat_value == null ||
        data.vat_value === "" ||
        Number.isNaN(Number(data.vat_value))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "قيمة الضريبة مطلوبة عند تفعيلها",
          path: ["vat_value"],
        });
      }
    }
  });

type Props = {
  branch: TBranchResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditBranchModal({ branch, open, onOpenChange }: Props) {
  const { mutate: updateBranch, isPending } = useMutation(
    useUpdateBranchMutationOptions()
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_code: "",
      name: "",
      street: "",
      building: "",
      city_id: "",
      notes: "",
      inventory_name: "",
      phone: "",
      vat_enabled: false,
      vat_type: null,
      vat_value: "",
      currency_id: "",
    },
  });

  const branchImageUrl =
    branch?.image_url ?? branch?.image ?? null;

  // Load branch data into form when modal opens
  useEffect(() => {
    if (branch && open) {
      form.reset({
        branch_code: branch.branch_code,
        name: branch.name,
        street: branch.address?.street || "",
        building: branch.address?.building || "",
        city_id: branch.address?.city_id?.toString() || "",
        notes: branch.address?.notes || "",
        inventory_name: branch.inventory?.name || "",
        phone: branch.phone ?? "",
        vat_enabled: branch.vat_enabled ?? false,
        vat_type: (branch.vat_type as "fixed" | "percentage") ?? null,
        vat_value:
          typeof branch.vat_value === "number"
            ? branch.vat_value.toString()
            : "",
        currency_id: "",
      });
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [branch, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!branch) return;

    const requestData: TUpdateBranchRequest = {
      branch_code: values.branch_code,
      name: values.name,
      address: {
        street: values.street,
        building: values.building,
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      inventory_name: values.inventory_name,
      phone: values.phone || undefined,
      image: imageFile ?? undefined,
      vat_enabled: values.vat_enabled ?? false,
      vat_type: values.vat_enabled ? (values.vat_type as "fixed" | "percentage") : undefined,
      vat_value:
        values.vat_enabled && values.vat_value != null && values.vat_value !== ""
          ? Number(values.vat_value)
          : undefined,
      currency_id: values.currency_id ? Number(values.currency_id) : undefined,
    };

    updateBranch(
      { id: branch.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الفرع بنجاح", {
            description: `تم تحديث الفرع "${branch.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الفرع", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            تعديل الفرع: {branch?.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            قم بتعديل البيانات وانقر "حفظ" لحفظ التغييرات.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Branch Code */}
              <FormField
                control={form.control}
                name="branch_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الفرع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Branch Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفرع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="01xxxxxxxxx" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* VAT Settings */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-medium">إعدادات ضريبة القيمة المضافة للفرع</h3>
              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="vat_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel>تفعيل الضريبة</FormLabel>
                      <FormControl>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            checked={field.value ?? false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <span>تفعيل ضريبة القيمة المضافة لهذا الفرع</span>
                        </label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("vat_enabled") && (
                  <div className="grid grid-cols-2 gap-4 col-span-2">
                    <FormField
                      control={form.control}
                      name="vat_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الضريبة</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            >
                              <option value="">اختر نوع الضريبة</option>
                              <option value="percentage">نسبة مئوية (%)</option>
                              <option value="fixed">قيمة ثابتة</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vat_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>قيمة الضريبة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: 15"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium">عملة الفرع</h3>
              <FormField
                control={form.control}
                name="currency_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة</FormLabel>
                    <FormControl>
                      <CurrenciesSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <FormLabel>صورة الفرع (اختياري)</FormLabel>
              {branchImageUrl && !imageFile && (
                <div className="mb-2">
                  <img
                    src={branchImageUrl}
                    alt="صورة الفرع"
                    className="h-20 w-20 rounded-md border object-cover"
                  />
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">العنوان</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Street */}
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشارع</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Building */}
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبنى</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* City */}
              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة</FormLabel>
                    <FormControl>
                      <CitiesSelect
                        value={field.value}
                        onChange={field.onChange}
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
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory Name */}
            <FormField
              control={form.control}
              name="inventory_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المخزن</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

