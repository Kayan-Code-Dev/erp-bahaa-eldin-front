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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { TClothesModel } from "@/api/v2/clothes/clothes-models/clothes.models.types";
import { useUpdateClothesModelMutationOptions } from "@/api/v2/clothes/clothes-models/clothes.models.hooks";
import { TUpdateClothesModel } from "@/api/v2/clothes/clothes-models/clothes.models.types";
import { toast } from "sonner";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";

// Schema - subcat_id is string[] in form, will be converted to number[] in onSubmit
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  category_id: z.string(),
  subcat_id: z
    .array(z.string())
    .min(1, { message: "يجب اختيار فئة فرعية واحدة على الأقل" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  model: TClothesModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditClothesModel({
  model,
  open,
  onOpenChange,
}: Props) {
  const { mutate: updateModel, isPending } = useMutation(
    useUpdateClothesModelMutationOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      category_id: "",
      subcat_id: [],
    },
  });

  const categoryId = useWatch({
    control: form.control,
    name: "category_id",
  });

  // Load model data into form when modal opens
  useEffect(() => {
    if (model && open) {
      // Note: TClothesModel subcategories don't have category info
      // User will need to select a category to filter subcategories
      form.reset({
        code: model.code,
        name: model.name,
        description: model.description,
        category_id: "",
        subcat_id:
          model.subcategories?.map((subcat) => subcat.id.toString()) || [],
      });
    }
  }, [model, form, open]);

  const onSubmit = (values: FormValues) => {
    if (!model) return;

    const requestData: TUpdateClothesModel = {
      code: values.code,
      name: values.name,
      description: values.description,
      subcat_id: values.subcat_id.map((id) => Number(id)),
    };

    updateModel(
      { id: model.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الموديل بنجاح", {
            description: `تم تحديث الموديل "${model.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء تحديث الموديل", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل موديل: {model?.name}</DialogTitle>
          <DialogDescription>
            قم بتعديل البيانات وانقر "حفظ" لحفظ التغييرات.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكود</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Subcategories */}
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
                          // Reset subcategories when category changes
                          form.setValue("subcat_id", []);
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
                name="subcat_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئات الفرعية</FormLabel>
                    <FormControl>
                      <SubcategoriesSelect
                        multiple
                        value={field.value}
                        onChange={field.onChange}
                        category_id={
                          categoryId ? Number(categoryId) : undefined
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
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

