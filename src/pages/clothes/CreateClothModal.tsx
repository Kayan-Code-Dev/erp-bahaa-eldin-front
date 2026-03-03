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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useCreateClothesMutationOptions } from "@/api/v2/clothes/clothes.hooks";
import {
  TCreateClothesRequest,
  TClothesStatus,
} from "@/api/v2/clothes/clothes.types";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { toast } from "sonner";

const formSchema = z.object({
  code: z.string().min(1, { message: "كود المنتج مطلوب" }),
  breast_size: z.string().optional(),
  waist_size: z.string().optional(),
  sleeve_size: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_ids: z.array(z.string()).optional(),
  status: z.enum(
    [
      "damaged",
      "burned",
      "scratched",
      "ready_for_rent",
      "rented",
      "die",
      "repairing",
    ],
    { required_error: "الحالة مطلوبة" }
  ),
  entity_type: z.enum(["branch", "factory", "workshop"], {
    required_error: "نوع المكان مطلوب",
  }),
  entity_id: z.string({ required_error: "المكان مطلوب" }),
  notes: z.string().optional(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STATUS_OPTIONS: { value: TClothesStatus; label: string }[] = [
  { value: "ready_for_rent", label: "جاهز للإيجار" },
  { value: "rented", label: "مؤجر" },
  { value: "damaged", label: "تالف" },
  { value: "burned", label: "محترق" },
  { value: "scratched", label: "مخدوش" },
  { value: "repairing", label: "قيد الإصلاح" },
  { value: "die", label: "ميت" },
];

export function CreateClothModal({ open, onOpenChange }: Props) {
  const { mutate: createCloth, isPending } = useMutation(
    useCreateClothesMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      breast_size: "",
      waist_size: "",
      sleeve_size: "",
      category_id: "",
      subcategory_ids: [],
      status: "ready_for_rent",
      entity_type: undefined,
      entity_id: "",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateClothesRequest = {
      code: values.code,
      status: values.status,
      entity_type: values.entity_type,
      entity_id: Number(values.entity_id),
      notes: values.notes || undefined,
      description: "",
      breast_size: values.breast_size || "",
      waist_size: values.waist_size || "",
      sleeve_size: values.sleeve_size || "",
      category_id: values.category_id ? Number(values.category_id) : undefined,
      subcategory_ids:
        values.subcategory_ids?.length ?
          values.subcategory_ids.map((id) => Number(id))
        : undefined,
    };

    createCloth(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المنتج بنجاح", {
          description: "تمت إضافة المنتج بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء المنتج", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء منتج جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة منتج جديد للنظام.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* كود المنتج */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كود المنتج</FormLabel>
                  <FormControl>
                    <Input placeholder="كود المنتج..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* المقاسات (كلها اختيارية) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="breast_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقاس الصدر (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مقاس الصدر..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waist_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقاس الخصر (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مقاس الخصر..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sleeve_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقاس الكم (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مقاس الكم..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* قسم المنتجات (اختياري) */}
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
                        form.setValue("subcategory_ids", []);
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
              name="subcategory_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أقسام المنتجات الفرعية (اختياري)</FormLabel>
                  <FormControl>
                    <SubcategoriesSelect
                      multiple
                      value={field.value ?? []}
                      onChange={field.onChange}
                      category_id={
                        form.watch("category_id")
                          ? Number(form.watch("category_id"))
                          : undefined
                      }
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الحالة */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* المكان */}
            <EntitySelect
              mode="form"
              control={form.control}
              entityTypeName="entity_type"
              entityIdName="entity_id"
              entityTypeLabel="نوع المكان"
              entityIdLabel="المكان"
              disabled={isPending}
            />

            {/* ملاحظات (اختياري) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ملاحظات إضافية..."
                      className="min-h-[80px]"
                      {...field}
                    />
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
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
