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
import { useMutation } from "@tanstack/react-query";
import { useCreateCityMutationOptions } from "@/api/v2/content-managment/city/city.hooks";
import { TCreateCityRequest } from "@/api/v2/content-managment/city/city.types";
import { toast } from "sonner";
import { CountriesSelect } from "@/components/custom/CountriesSelect";

// Schema for the form
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  country_id: z.string({ required_error: "الدولة مطلوبة" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCityModal({ open, onOpenChange }: Props) {
  const { mutate: createCity, isPending } = useMutation(
    useCreateCityMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country_id: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateCityRequest = {
      name: values.name,
      country_id: Number(values.country_id),
    };

    createCity(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء المدينة بنجاح", {
          description: "تمت إضافة المدينة بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء المدينة", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء مدينة جديدة</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة مدينة جديدة للنظام.
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
            {/* City Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المدينة</FormLabel>
                  <FormControl>
                    <Input placeholder="القاهرة" {...field} />
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
                {isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
