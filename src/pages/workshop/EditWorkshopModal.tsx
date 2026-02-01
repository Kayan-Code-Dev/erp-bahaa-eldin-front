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
import { TWorkshopResponse } from "@/api/v2/workshop/workshop.types";
import { useUpdateWorkshopMutationOptions } from "@/api/v2/workshop/workshops.hooks";
import { TUpdateWorkshopRequest } from "@/api/v2/workshop/workshop.types";
import { toast } from "sonner";
import { CitiesSelect } from "@/components/custom/CitiesSelect";

// Schema
const formSchema = z.object({
  workshop_code: z.string().min(1, { message: "كود الورشة مطلوب" }),
  name: z.string().min(2, { message: "اسم الورشة مطلوب" }),
  street: z.string().min(1, { message: "الشارع مطلوب" }),
  building: z.string().min(1, { message: "المبنى مطلوب" }),
  city_id: z.string({ required_error: "المدينة مطلوبة" }),
  notes: z.string().optional(),
  inventory_name: z.string().min(1, { message: "اسم المخزن مطلوب" }),
});

type Props = {
  workshop: TWorkshopResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditWorkshopModal({ workshop, open, onOpenChange }: Props) {
  const { mutate: updateWorkshop, isPending } = useMutation(
    useUpdateWorkshopMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workshop_code: "",
      name: "",
      street: "",
      building: "",
      city_id: "",
      notes: "",
      inventory_name: "",
    },
  });

  // Load workshop data into form when modal opens
  useEffect(() => {
    if (workshop && open) {
      form.reset({
        workshop_code: workshop.workshop_code,
        name: workshop.name,
        street: workshop.address?.street || "",
        building: workshop.address?.building || "",
        city_id: workshop.address ? String(workshop.address.city_id) : "",
        notes: workshop.address?.notes || "",
        inventory_name: workshop.inventory?.name || "",
      });
    }
  }, [workshop, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!workshop) return;

    const requestData: TUpdateWorkshopRequest = {
      workshop_code: values.workshop_code,
      name: values.name,
      address: {
        street: values.street,
        building: values.building,
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      inventory_name: values.inventory_name,
    };

    updateWorkshop(
      { id: workshop.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الورشة بنجاح", {
            description: `تم تحديث الورشة "${workshop.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الورشة", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">
            تعديل الورشة: {workshop?.name}
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
            <div className="grid grid-cols-2 gap-4">
              {/* Workshop Code */}
              <FormField
                control={form.control}
                name="workshop_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الورشة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Workshop Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الورشة</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Textarea {...field} />
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
                    <Input {...field} />
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

