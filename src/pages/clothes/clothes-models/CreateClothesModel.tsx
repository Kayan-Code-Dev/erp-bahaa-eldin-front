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
import { useMutation } from "@tanstack/react-query";
import { useCreateClothesModelMutationOptions } from "@/api/v2/clothes/clothes-models/clothes.models.hooks";
import { TCreateClothesModel } from "@/api/v2/clothes/clothes-models/clothes.models.types";
import { toast } from "sonner";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";

// Schema for the form - subcat_id is string[] in form, will be converted to number[] in onSubmit
const formSchema = z.object({
  code: z.string().min(1, { message: "الكود مطلوب" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  category_id: z.string({ required_error: "الفئة مطلوبة" }),
  subcat_id: z
    .array(z.string())
    .min(1, { message: "يجب اختيار فئة فرعية واحدة على الأقل" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateClothesModel({ open, onOpenChange }: Props) {
  const { mutate: createModel, isPending } = useMutation(
    useCreateClothesModelMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateClothesModel = {
      code: values.code,
      name: values.name,
      description: values.description,
      subcat_id: values.subcat_id.map((id) => Number(id)),
    };

    createModel(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الموديل بنجاح", {
          description: "تمت إضافة الموديل بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء إنشاء الموديل", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء موديل جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة موديل جديد للنظام.
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
                    <Input placeholder="MODEL-001" {...field} />
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
                    <Input placeholder="موديل المنتج" {...field} />
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
                      placeholder="وصف الموديل..."
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
                        disabled={isPending || !categoryId}
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
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

