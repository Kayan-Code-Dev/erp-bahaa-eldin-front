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
import { useCreateBranchMutationOptions } from "@/api/v2/branches/branches.hooks";
import { TCreateBranchRequest } from "@/api/v2/branches/branches.types";
import { toast } from "sonner";
import { CitiesSelect } from "@/components/custom/CitiesSelect";

// Schema for the form
const formSchema = z.object({
  branch_code: z.string().min(1, { message: "كود الفرع مطلوب" }),
  name: z.string().min(2, { message: "اسم الفرع مطلوب" }),
  street: z.string().min(1, { message: "الشارع مطلوب" }),
  building: z.string().min(1, { message: "المبنى مطلوب" }),
  city_id: z.string({ required_error: "المدينة مطلوبة" }),
  notes: z.string().optional(),
  inventory_name: z.string().min(1, { message: "اسم المخزن مطلوب" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateBranchModal({ open, onOpenChange }: Props) {
  const { mutate: createBranch, isPending } = useMutation(
    useCreateBranchMutationOptions()
  );

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
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateBranchRequest = {
      branch_code: values.branch_code,
      name: values.name,
      address: {
        street: values.street,
        building: values.building,
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      inventory_name: values.inventory_name,
    };

    createBranch(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الفرع بنجاح", {
          description: "تمت إضافة الفرع بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الفرع", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء فرع جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة فرع جديد للنظام.
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
                      <Input placeholder="BR001" {...field} />
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
                      <Input placeholder="الفرع الرئيسي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                        <Input placeholder="شارع النصر" {...field} />
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
                        <Input placeholder="مبنى رقم 10" {...field} />
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
                      <Textarea
                        placeholder="ملاحظات إضافية..."
                        {...field}
                      />
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
                    <Input placeholder="مخزن الفرع الرئيسي" {...field} />
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
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

