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
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { toast } from "sonner";

// Schema for the form
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(1, { message: "الاسم مطلوب" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  breast_size: z.string().min(1, { message: "مقاس الصدر مطلوب" }),
  waist_size: z.string().min(1, { message: "مقاس الخصر مطلوب" }),
  sleeve_size: z.string().min(1, { message: "مقاس الكم مطلوب" }),
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
  notes: z.string().optional(),
  cloth_type_id: z.string({ required_error: "الموديل مطلوب" }),
  entity_type: z.enum(["branch", "factory", "workshop"], {
    required_error: "نوع المكان مطلوب",
  }),
  entity_id: z.string({ required_error: "المكان مطلوب" }),
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
      name: "",
      description: "",
      breast_size: "",
      waist_size: "",
      sleeve_size: "",
      status: "ready_for_rent",
      notes: "",
      cloth_type_id: "",
      entity_type: undefined,
      entity_id: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateClothesRequest = {
      code: values.code,
      name: values.name,
      description: values.description,
      breast_size: values.breast_size,
      waist_size: values.waist_size,
      sleeve_size: values.sleeve_size,
      status: values.status,
      notes: values.notes || "",
      entity_type: values.entity_type,
      entity_id: Number(values.entity_id),
      cloth_type_id: Number(values.cloth_type_id),
    };

    createCloth(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الملابس بنجاح", {
          description: "تمت إضافة الملابس بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الملابس", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء ملابس جديدة</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة ملابس جديدة للنظام.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكود</FormLabel>
                    <FormControl>
                      <Input placeholder="كود الملابس..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الملابس..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف الملابس..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sizes */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="breast_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقاس الصدر</FormLabel>
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
                    <FormLabel>مقاس الخصر</FormLabel>
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
                    <FormLabel>مقاس الكم</FormLabel>
                    <FormControl>
                      <Input placeholder="مقاس الكم..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="flex gap-4">
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
            </div>

            {/* Cloth Model */}
            <FormField
              control={form.control}
              name="cloth_type_id"
              render={({ field }) => (
                <FormItem>
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

            {/* Entity Selection */}
            <EntitySelect
              mode="form"
              control={form.control}
              entityTypeName="entity_type"
              entityIdName="entity_id"
              entityTypeLabel="نوع المكان"
              entityIdLabel="المكان"
              disabled={isPending}
            />

            {/* Notes */}
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

            <DialogFooter className="mt-4 gap-2 border-t pt-4">
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
