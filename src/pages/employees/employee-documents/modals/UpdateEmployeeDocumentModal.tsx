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
import { useUpdateEmployeeDocumentMutationOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { TEmployeeDocument, TUpdateEmployeeDocumentRequest } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { toast } from "sonner";
import { useEffect } from "react";
import { DatePicker } from "@/components/custom/DatePicker";

const formSchema = z.object({
  title: z.string().min(1, { message: "العنوان مطلوب" }),
  description: z.string().optional(),
  issue_date: z.date({ required_error: "تاريخ الإصدار مطلوب" }),
  expiry_date: z.date({ required_error: "تاريخ الانتهاء مطلوب" }),
  document_number: z.string().min(1, { message: "رقم الوثيقة مطلوب" }),
});

type Props = {
  document: TEmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateEmployeeDocumentModal({
  document,
  open,
  onOpenChange,
}: Props) {
  const { mutate: updateDocument, isPending } = useMutation(
    useUpdateEmployeeDocumentMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      issue_date: undefined,
      expiry_date: undefined,
      document_number: "",
    },
  });

  // Load document data into form when modal opens
  useEffect(() => {
    if (document && open) {
      form.reset({
        title: document.title,
        description: document.description || "",
        issue_date: document.issue_date ? new Date(document.issue_date) : undefined,
        expiry_date: document.expiry_date ? new Date(document.expiry_date) : undefined,
        document_number: document.document_number || "",
      });
    }
  }, [document, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!document) return;

    // Convert Date objects to ISO string format (YYYY-MM-DD)
    const formatDateToString = (date: Date | undefined): string => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };

    const requestData: TUpdateEmployeeDocumentRequest = {
      title: values.title,
      description: values.description || "",
      issue_date: formatDateToString(values.issue_date),
      expiry_date: formatDateToString(values.expiry_date),
      document_number: values.document_number,
    };

    updateDocument(
      { document_id: document.id, data: requestData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الوثيقة بنجاح", {
            description: `تم تحديث الوثيقة "${document.title}" بنجاح.`,
          });
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الوثيقة", {
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل الوثيقة</DialogTitle>
          <DialogDescription className="text-center">
            تعديل معلومات الوثيقة.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان *</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان الوثيقة..." {...field} />
                  </FormControl>
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
                      placeholder="وصف الوثيقة..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Number */}
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الوثيقة *</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الوثيقة..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issue Date and Expiry Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الإصدار *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر تاريخ الإصدار"
                        showLabel={false}
                        disabled={isPending}
                        allowFutureDates={true}
                        allowPastDates={true}
                        buttonClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر تاريخ الانتهاء"
                        showLabel={false}
                        disabled={isPending}
                        allowFutureDates={true}
                        allowPastDates={true}
                        buttonClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
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

