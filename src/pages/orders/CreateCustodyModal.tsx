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
import { useCreateCustodyMutationOptions } from "@/api/v2/custody/custody.hooks";
import {
  TCreateCustodyRequest,
  TCustodyType,
} from "@/api/v2/custody/custody.types";
import { toast } from "sonner";
import { UploadFileField } from "@/components/custom/UploadFile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const custodyTypes: TCustodyType[] = ["money", "physical_item", "document"];

const custodyTypeLabels: Record<TCustodyType, string> = {
  money: "مال",
  physical_item: "عنصر مادي",
  document: "مستند",
};

// Schema for the form
const formSchema = z
  .object({
    type: z.enum(["money", "physical_item", "document"], {
      required_error: "نوع الضمان مطلوب",
    }),
    description: z.string().min(1, { message: "الوصف مطلوب" }),
    value: z.number().optional(),
    photos: z.array(z.instanceof(File)).optional(),
    notes: z.string().min(1, { message: "الملاحظات مطلوبة" }),
  })
  .refine(
    (data) => {
      if (data.type === "money") {
        return data.value !== undefined && data.value > 0;
      }
      return true;
    },
    {
      message: "القيمة مطلوبة لنوع المال",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "physical_item" || data.type === "document") {
        return data.photos && data.photos.length > 0;
      }
      return true;
    },
    {
      message: "الصور مطلوبة (حد أقصى صورتان)",
      path: ["photos"],
    }
  )
  .refine(
    (data) => {
      if (data.photos) {
        return data.photos.length <= 2;
      }
      return true;
    },
    {
      message: "الحد الأقصى صورتان",
      path: ["photos"],
    }
  );

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
};

export function CreateCustodyModal({ open, onOpenChange, orderId }: Props) {
  const { mutate: createCustody, isPending } = useMutation(
    useCreateCustodyMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "money",
      description: "",
      value: undefined,
      photos: undefined,
      notes: "",
    },
  });

  const custodyType = form.watch("type");

  // Clear conditional fields when type changes
  useEffect(() => {
    if (custodyType === "money") {
      form.setValue("photos", undefined);
    } else {
      form.setValue("value", undefined);
    }
  }, [custodyType, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const requestData: TCreateCustodyRequest = {
      type: values.type,
      description: values.description,
      notes: values.notes,
      ...(values.type === "money" && { value: values.value }),
      ...((values.type === "physical_item" || values.type === "document") &&
        values.photos && { photos: values.photos }),
    };

    createCustody(
      {
        order_id: orderId,
        data: requestData,
      },
      {
        onSuccess: () => {
          toast.success("تم إنشاء الضمان بنجاح", {
            description: "تمت إضافة الضمان بنجاح للنظام.",
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء إنشاء الضمان", {
            description: error.message,
          });
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">إنشاء ضمان جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة ضمان جديد للطلب.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Custody Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الضمان</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الضمان" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {custodyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {custodyTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصف الضمان"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value - Only for money type */}
            {custodyType === "money" && (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة (ج.م)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="أدخل قيمة الضمان"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Photos - Only for physical_item or document type */}
            {(custodyType === "physical_item" ||
              custodyType === "document") && (
              <FormField
                control={form.control}
                name="photos"
                render={() => (
                  <FormItem>
                    <FormLabel>الصور (حد أقصى صورتان)</FormLabel>
                    <FormControl>
                      <UploadFileField
                        name="photos"
                        multiple
                        maxFiles={2}
                        accept="image/*"
                        placeholder="اختر الصور"
                        showPreview
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل الملاحظات"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                إنشاء الضمان
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
