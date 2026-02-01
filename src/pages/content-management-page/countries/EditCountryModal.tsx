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
import { TCountry } from "@/api/v2/content-managment/country/country.types";
import { useUpdateCountryMutationOptions } from "@/api/v2/content-managment/country/country.hooks";
import { TCreateCountryRequest } from "@/api/v2/content-managment/country/country.types";
import { toast } from "sonner";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
});

type Props = {
  country: TCountry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCountryModal({ country, open, onOpenChange }: Props) {
  const { mutate: updateCountry, isPending } = useMutation(
    useUpdateCountryMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Load country data into form when modal opens
  useEffect(() => {
    if (country) {
      form.reset({
        name: country.name,
      });
    }
  }, [country, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!country) return;

    const requestData: TCreateCountryRequest = {
      name: values.name,
    };

    updateCountry(
      { id: country.id, req: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الدولة بنجاح", {
            description: `تم تحديث دولة "${country.name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الدولة", {
            description: error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-y-scroll scrollbar-hide max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="text-center">
            تعديل دولة: {country?.name}
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
                  <FormLabel>اسم الدولة</FormLabel>
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
