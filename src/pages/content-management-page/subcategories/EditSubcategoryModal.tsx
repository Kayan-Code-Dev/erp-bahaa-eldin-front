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
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { TSubcategory } from "@/api/v2/content-managment/subcategory/subcategory.types";
import { useUpdateSubcategoryMutationOptions } from "@/api/v2/content-managment/subcategory/subcategory.hooks";
import { TUpdateSubcategoryRequest } from "@/api/v2/content-managment/subcategory/subcategory.types";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { toast } from "sonner";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب (حرفين على الأقل)" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  category_id: z.string({ required_error: "يجب اختيار الفئة" }),
});

type Props = {
  subcategory: TSubcategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditSubcategoryModal({
  subcategory,
  open,
  onOpenChange,
}: Props) {
  const { mutate: updateSubcategory, isPending } = useMutation(
    useUpdateSubcategoryMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
    },
  });

  // Load data into form when modal opens
  useEffect(() => {
    if (subcategory && open) {
      form.reset({
        name: subcategory.name,
        description: subcategory.description || "",
        category_id: subcategory.category_id.toString(),
      });
    }
  }, [subcategory, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!subcategory) return;

    const requestData: TUpdateSubcategoryRequest = {
      name: values.name,
      description: values.description || "",
      category_id: Number(values.category_id),
    };

    updateSubcategory(
      { id: subcategory.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تعديل الفئة بنجاح");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ ما", {
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
          <DialogTitle className="text-center">
            تعديل الفئة الفرعية: {subcategory?.name}
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة الرئيسية</FormLabel>
                  <FormControl>
                    <CategoriesSelect
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الفئة الفرعية</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الفئة الفرعية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف قصير..." {...field} />
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
