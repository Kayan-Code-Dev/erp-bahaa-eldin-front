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
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUpdateClothesMutationOptions } from "@/api/v2/clothes/clothes.hooks";
import {
  TUpdateClothesRequest,
  TClothResponse,
  TClothesStatus,
} from "@/api/v2/clothes/clothes.types";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { toast } from "sonner";

// Schema: كود المنتج، المقاسات (كلها اختيارية)، الحالة، المكان، ملاحظات (اختياري)
const formSchema = z.object({
  code: z.string().min(1, { message: "كود المنتج مطلوب" }),
  breast_size: z.string().optional(),
  waist_size: z.string().optional(),
  sleeve_size: z.string().optional(),
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
  cloth: TClothResponse | null;
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

export function EditClothModal({ cloth, open, onOpenChange }: Props) {
  const { mutate: updateCloth, isPending } = useMutation(
    useUpdateClothesMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      breast_size: "",
      waist_size: "",
      sleeve_size: "",
      status: "ready_for_rent",
      entity_type: undefined,
      entity_id: "",
      notes: "",
    },
  });

  // Load data into form when modal opens
  useEffect(() => {
    if (cloth && open) {
      form.reset({
        code: cloth.code,
        breast_size: cloth.breast_size || "",
        waist_size: cloth.waist_size || "",
        sleeve_size: cloth.sleeve_size || "",
        status: cloth.status,
        entity_type: cloth.entity_type,
        entity_id: cloth.entity_id.toString(),
        notes: cloth.notes || "",
      });
    }
  }, [cloth, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!cloth) return;

    const requestData: TUpdateClothesRequest = {
      code: values.code,
      status: values.status,
      entity_type: values.entity_type,
      entity_id: Number(values.entity_id),
      notes: values.notes || undefined,
      breast_size: values.breast_size || undefined,
      waist_size: values.waist_size || undefined,
      sleeve_size: values.sleeve_size || undefined,
    };

    updateCloth(
      { id: cloth.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تعديل المنتج بنجاح", {
            description: "تم تحديث بيانات المنتج بنجاح.",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تعديل المنتج", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            تعديل المنتج: {cloth?.code}
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

            <EntitySelect
              mode="form"
              control={form.control}
              entityTypeName="entity_type"
              entityIdName="entity_id"
              entityTypeLabel="نوع المكان"
              entityIdLabel="المكان"
              disabled={isPending}
            />

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
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
