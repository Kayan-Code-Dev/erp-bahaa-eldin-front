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
import { useCreateClientMutationOptions } from "@/api/v2/clients/clients.hooks";
import {
  CLIENT_SOURCES,
  CLIENT_SOURCE_LABELS,
  TCreateClientRequest,
  TClientResponse,
} from "@/api/v2/clients/clients.types";
import { toast } from "sonner";
import { CitiesSelect } from "@/components/custom/CitiesSelect";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for the form
const formSchema = z.object({
  first_name: z.string().min(1, { message: "الاسم الأول مطلوب" }),
  last_name: z.string().min(1, { message: "الاسم الأخير مطلوب" }),
  date_of_birth: z.string().min(1, { message: "تاريخ الميلاد مطلوب" }),
  national_id: z
    .string()
    .length(14, { message: "الرقم القومي يجب أن يكون 14 رقمًا" })
    .regex(/^\d{14}$/, { message: "الرقم القومي يجب أن يتكون من 14 رقمًا" }),
  source: z.enum(CLIENT_SOURCES),
  address: z.string().min(1, { message: "العنوان مطلوب" }),
  city_id: z.string({ required_error: "المدينة مطلوبة" }),
  notes: z.string().optional(),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  phone2: z.string().optional(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: TClientResponse) => void;
};

export function CreateClientModal({ open, onOpenChange, onClientCreated }: Props) {
  const { mutate: createClient, isPending } = useMutation(
    useCreateClientMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      national_id: "",
      source: "other",
      address: "",
      city_id: "",
      notes: "",
      phone: "",
      phone2: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const phones = [{ phone: values.phone }];
    if (values.phone2) {
      phones.push({ phone: values.phone2 });
    }

    const requestData: TCreateClientRequest = {
      first_name: values.first_name,
      middle_name: "",
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      national_id: values.national_id,
      source: values.source,
      address: {
        street: values.address,
        building: "",
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      phones: phones,
    };

    createClient(requestData, {
      onSuccess: (data) => {
        toast.success("تم إنشاء العميل بنجاح", {
          description: "تمت إضافة العميل بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
        if (data) onClientCreated?.(data);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء العميل", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء عميل جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة عميل جديد للنظام.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأول</FormLabel>
                    <FormControl>
                      <Input placeholder="محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأخير</FormLabel>
                    <FormControl>
                      <Input placeholder="علي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الميلاد</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم القومي</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678901234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المصدر</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المصدر" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLIENT_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>{CLIENT_SOURCE_LABELS[source]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">أرقام الهاتف</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem dir="ltr">
                      <FormLabel>رقم الهاتف (مطلوب)</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="أدخل رقم الهاتف"
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
                  name="phone2"
                  render={({ field }) => (
                    <FormItem dir="ltr">
                      <FormLabel>رقم الهاتف الثاني (اختياري)</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="أدخل رقم الهاتف الثاني"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">العنوان</h3>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل العنوان الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ملاحظات إضافية..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
