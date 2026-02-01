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
import {
  TClientResponse,
  TClientSource,
  CLIENT_SOURCES,
  CLIENT_SOURCE_LABELS,
} from "@/api/v2/clients/clients.types";
import { useUpdateClientMutationOptions } from "@/api/v2/clients/clients.hooks";
import { TUpdateClientRequest } from "@/api/v2/clients/clients.types";
import { toast } from "sonner";
import { CitiesSelect } from "@/components/custom/CitiesSelect";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema
const formSchema = z.object({
  first_name: z.string().min(1, { message: "الاسم الأول مطلوب" }),
  middle_name: z.string().min(1, { message: "الاسم الأوسط مطلوب" }),
  last_name: z.string().min(1, { message: "الاسم الأخير مطلوب" }),
  date_of_birth: z.string().min(1, { message: "تاريخ الميلاد مطلوب" }),
  national_id: z
    .string()
    .length(14, { message: "الرقم القومي يجب أن يكون 14 رقمًا" })
    .regex(/^\d{14}$/, { message: "الرقم القومي يجب أن يتكون من 14 رقمًا" }),
  source: z.enum(CLIENT_SOURCES),
  street: z.string().min(1, { message: "الشارع مطلوب" }),
  building: z.string().min(1, { message: "المبنى مطلوب" }),
  city_id: z.string({ required_error: "المدينة مطلوبة" }),
  notes: z.string().optional(),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  phone2: z.string().optional(),
});

type Props = {
  client: TClientResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditClientModal({ client, open, onOpenChange }: Props) {
  const { mutate: updateClient, isPending } = useMutation(
    useUpdateClientMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      national_id: "",
      source: "other",
      street: "",
      building: "",
      city_id: "",
      notes: "",
      phone: "",
      phone2: "",
    },
  });

  // Load client data into form when modal opens
  useEffect(() => {
    if (client && open) {
      form.reset({
        first_name: client.first_name,
        middle_name: client.middle_name,
        last_name: client.last_name,
        date_of_birth: client.date_of_birth,
        national_id: client.national_id,
        source: (client.source as TClientSource) || "other",
        street: client.address?.street || "",
        building: client.address?.building || "",
        city_id: client.address ? String(client.address.city_id) : "",
        notes: client.address?.notes || "",
        phone: client.phones?.[0]?.phone || "",
        phone2: client.phones?.[1]?.phone || "",
      });
    }
  }, [client, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!client) return;

    const phones = [{ phone: values.phone }];
    if (values.phone2) {
      phones.push({ phone: values.phone2 });
    }

    const requestData: TUpdateClientRequest = {
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      national_id: values.national_id,
      source: values.source as TClientSource,
      address: {
        street: values.street,
        building: values.building,
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      phones: phones,
    };

    updateClient(
      { id: client.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث العميل بنجاح", {
            description: `تم تحديث العميل "${client.first_name} ${client.last_name}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث العميل", {
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
            تعديل العميل: {client ? `${client.first_name} ${client.last_name}` : ""}
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
            {/* Name Fields */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأول</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأوسط</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                            <SelectItem key={source} value={source}>
                              {CLIENT_SOURCE_LABELS[source]}
                            </SelectItem>
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
              <div className="grid grid-cols-2 gap-4">
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
                      <Textarea {...field} />
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
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

