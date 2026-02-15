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
import { useCreateEmployeeDocumentMutationOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { TCreateEmployeeDocumentRequest } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { toast } from "sonner";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeDocumentTypesSelect } from "@/components/custom/EmployeeDocumentTypesSelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { UploadFile } from "@/components/custom/UploadFile";

const formSchema = z.object({
  employee_id: z.string({ required_error: "الموظف مطلوب" }),
  type: z.string({ required_error: "نوع الوثيقة مطلوب" }),
  title: z.string().min(1, { message: "العنوان مطلوب" }),
  description: z.string().optional(),
  file: z.instanceof(File, { message: "الملف مطلوب" }),
  issue_date: z.date({ required_error: "تاريخ الإصدار مطلوب" }),
  expiry_date: z.date({ required_error: "تاريخ الانتهاء مطلوب" }),
  document_number: z.string().min(1, { message: "رقم الوثيقة مطلوب" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeDocumentModal({
  open,
  onOpenChange,
}: Props) {
  const { mutate: createDocument, isPending } = useMutation(
    useCreateEmployeeDocumentMutationOptions()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      type: "",
      title: "",
      description: "",
      issue_date: undefined,
      expiry_date: undefined,
      document_number: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const file = form.getValues("file");
    if (!file) {
      toast.error("الملف مطلوب");
      return;
    }

    // Convert Date objects to ISO string format (YYYY-MM-DD)
    const formatDateToString = (date: Date | undefined): string => {
      if (!date) return "";
      return date.toISOString().split("T")[0];
    };

    const requestData: TCreateEmployeeDocumentRequest = {
      employee_id: Number(values.employee_id),
      type: values.type,
      title: values.title,
      description: values.description || "",
      file: file,
      issue_date: formatDateToString(values.issue_date),
      expiry_date: formatDateToString(values.expiry_date),
      document_number: values.document_number,
    };

    createDocument(requestData, {
      onSuccess: () => {
        toast.success("تم إنشاء الوثيقة بنجاح", {
          description: "تمت إضافة الوثيقة بنجاح للنظام.",
        });
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء الوثيقة", {
          description: error.message,
        });
      },
    });
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
          <DialogTitle className="text-center">إضافة وثيقة جديدة</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات لإضافة وثيقة جديدة للنظام.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف *</FormLabel>
                  <FormControl>
                    <EmployeesSelect
                      params={{ per_page: 10 }}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر الموظف..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الوثيقة *</FormLabel>
                  <FormControl>
                    <EmployeeDocumentTypesSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="اختر نوع الوثيقة..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الملف *</FormLabel>
                  <FormControl>
                    <UploadFile
                      value={field.value}
                      onChange={field.onChange}
                      multiple={false}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      placeholder="اختر ملف"
                      showLabel={false}
                      disabled={isPending}
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الحفظ..." : "إضافة الوثيقة"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

