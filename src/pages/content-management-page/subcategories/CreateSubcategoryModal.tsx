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
import { useMutation } from "@tanstack/react-query";
import { useCreateSubcategoryMutationOptions } from "@/api/v2/content-managment/subcategory/subcategory.hooks";
import { TCreateSubcategoryRequest } from "@/api/v2/content-managment/subcategory/subcategory.types";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { toast } from "sonner";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب (حرفين على الأقل)" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  category_id: z.string({ required_error: "يجب اختيار الفئة" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSubcategoryModal({ open, onOpenChange }: Props) {
  const { mutate: createSubcategory, isPending } = useMutation(
    useCreateSubcategoryMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateSubcategoryRequest = {
      name: values.name,
      description: values.description || "",
      category_id: Number(values.category_id),
    };

    createSubcategory(requestData, {
      onSuccess: () => {
        form.reset();
        toast.success("تم إنشاء الفئة بنجاح");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ ما", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            إنشاء فئة فرعية جديدة
          </DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة فئة فرعية جديدة للنظام.
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
            <DialogFooter className="mt-4 gap-2 border-t pt-4">
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
