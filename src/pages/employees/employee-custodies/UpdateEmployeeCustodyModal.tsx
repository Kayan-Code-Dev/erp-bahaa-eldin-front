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
import { useUpdateEmployeeCustodyMutationOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TEmployeeCustody, TUpdateEmployeeCustody } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { toast } from "sonner";
import { useEffect } from "react";
import { DatePicker } from "@/components/custom/DatePicker";

const formSchema = z.object({
  name: z.string().min(1, { message: "الاسم مطلوب" }),
  description: z.string().optional(),
  serial_number: z.string().min(1, { message: "الرقم التسلسلي مطلوب" }),
  value: z.number().min(0, { message: "القيمة يجب أن تكون أكبر من أو تساوي صفر" }),
  expected_return_date: z.date({ required_error: "تاريخ الإرجاع المتوقع مطلوب" }),
  notes: z.string().optional(),
});

type Props = {
  employeeCustody: TEmployeeCustody | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateEmployeeCustodyModal({ employeeCustody, open, onOpenChange }: Props) {
  const { mutate: updateEmployeeCustody, isPending } = useMutation(
    useUpdateEmployeeCustodyMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      serial_number: "",
      value: 0,
      expected_return_date: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (employeeCustody && open) {
      form.reset({
        name: employeeCustody.name,
        description: employeeCustody.description || "",
        serial_number: employeeCustody.serial_number,
        value: employeeCustody.value,
        expected_return_date: new Date(employeeCustody.expected_return_date),
        notes: employeeCustody.notes || "",
      });
    }
  }, [employeeCustody, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!employeeCustody) return;

    const requestData: TUpdateEmployeeCustody = {
      name: values.name,
      description: values.description || "",
      serial_number: values.serial_number,
      value: values.value,
      expected_return_date: values.expected_return_date.toISOString().split("T")[0],
      notes: values.notes || "",
    };

    updateEmployeeCustody(
      { id: employeeCustody.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الضمان بنجاح", {
            description: "تم تحديث بيانات الضمان بنجاح.",
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الضمان", {
            description: error.message,
          });
        },
      }
    );
  };

  if (!employeeCustody) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">تحديث الضمان</DialogTitle>
          <DialogDescription className="text-center">
            قم بتحديث بيانات الضمان.
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
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الضمان" {...field} disabled={isPending} />
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
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف الضمان..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم التسلسلي</FormLabel>
                    <FormControl>
                      <Input placeholder="الرقم التسلسلي" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val === "" ? 0 : Number(val) || 0);
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expected_return_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الإرجاع المتوقع</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر تاريخ الإرجاع المتوقع"
                      showLabel={false}
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
                    <Textarea placeholder="ملاحظات إضافية..." {...field} disabled={isPending} />
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
                {isPending ? "جاري التحديث..." : "تحديث"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

