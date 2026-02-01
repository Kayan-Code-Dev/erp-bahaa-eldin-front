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
import { TCategory } from "@/api/v2/content-managment/category/category.type";
import { useUpdateCategoryMutationOptions } from "@/api/v2/content-managment/category/category.hooks";
import { TUpdateCategoryRequest } from "@/api/v2/content-managment/category/category.type";
import { toast } from "sonner";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب (حرفين على الأقل)" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
});

type Props = {
  category: TCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCategoryModal({ category, open, onOpenChange }: Props) {
  const { mutate: updateCategory, isPending } = useMutation(
    useUpdateCategoryMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Load data into form when modal opens
  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [category, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!category) return;

    const requestData: TUpdateCategoryRequest = {
      name: values.name,
      description: values.description || "",
    };

    updateCategory(
      { id: category.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الفئة بنجاح");
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الفئة. الرجاء المحاولة مرة أخرى.", {
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
            تعديل الفئة: {category?.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الفئة</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الفئة..." {...field} />
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
                    <Textarea placeholder="وصف قصير للفئة..." {...field} />
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
