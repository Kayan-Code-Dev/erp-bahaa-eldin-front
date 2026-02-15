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
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUpdateClothesMutationOptions } from "@/api/v2/clothes/clothes.hooks";
import {
  TUpdateClothesRequest,
  TClothResponse,
  TClothesStatus,
} from "@/api/v2/clothes/clothes.types";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { toast } from "sonner";

// Schema for the form (based on TUpdateClothesRequest)
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(1, { message: "الاسم مطلوب" }),
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
  cloth_type_id: z.string({ required_error: "الموديل مطلوب" }),
  entity_type: z.enum(["branch", "factory", "workshop"], {
    required_error: "نوع المكان مطلوب",
  }),
  entity_id: z.string({ required_error: "المكان مطلوب" }),
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
      name: "",
      status: "ready_for_rent",
      cloth_type_id: "",
      entity_type: undefined,
      entity_id: "",
    },
  });

  // Load data into form when modal opens
  useEffect(() => {
    if (cloth && open) {
      form.reset({
        code: cloth.code,
        name: cloth.name,
        status: cloth.status,
        cloth_type_id: cloth.cloth_type_id.toString(),
        entity_type: cloth.entity_type,
        entity_id: cloth.entity_id.toString(),
      });
    }
  }, [cloth, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!cloth) return;

    const requestData: TUpdateClothesRequest = {
      code: values.code,
      name: values.name,
      status: values.status,
      entity_type: values.entity_type,
      entity_id: Number(values.entity_id),
      cloth_type_id: Number(values.cloth_type_id),
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
            تعديل المنتج: {cloth?.name}
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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكود</FormLabel>
                    <FormControl>
                      <Input placeholder="كود المنتج..." {...field} />
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
                      <Input placeholder="اسم المنتج..." {...field} />
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
