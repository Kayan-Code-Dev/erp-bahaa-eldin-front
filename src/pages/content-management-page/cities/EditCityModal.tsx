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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { TCity } from "@/api/v2/content-managment/city/city.types";
import { useUpdateCityMutationOptions } from "@/api/v2/content-managment/city/city.hooks";
import { TUpdateCityRequest } from "@/api/v2/content-managment/city/city.types";
import { toast } from "sonner";
import { CountriesSelect } from "@/components/custom/CountriesSelect";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  country_id: z.string({ required_error: "الدولة مطلوبة" }),
});

type Props = {
  city: TCity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCityModal({ city, open, onOpenChange }: Props) {
  const { mutate: updateCity, isPending } = useMutation(
    useUpdateCityMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country_id: "",
    },
  });

  // Load city data into form when modal opens
  useEffect(() => {
    if (city && open) {
      form.reset({
        name: city.name,
        country_id: city.country_id.toString(), // Important: convert to string
      });
    }
  }, [city, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!city) return;

    const requestData: TUpdateCityRequest = {
      name: values.name,
      country_id: Number(values.country_id),
    };

    updateCity(
      { id: city.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المدينة بنجاح", {
            description: `تم تحديث المدينة "${city.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث المدينة", {
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
          <DialogTitle>تعديل مدينة: {city?.name}</DialogTitle>
          <DialogDescription>
            قم بتعديل البيانات وانقر "حفظ" لحفظ التغييرات.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Country Select */}
            <FormField
              control={form.control}
              name="country_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدولة</FormLabel>
                  <FormControl>
                    <CountriesSelect
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
                  <FormLabel>اسم المدينة</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
