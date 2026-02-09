import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import {
  useCreateExpenseMutationOptions,
} from "@/api/v2/expenses/expenses.hooks";
import {
  ExpenseCategories,
  TCreateExpenseRequest,
} from "@/api/v2/expenses/expenses.types";
import { DatePicker } from "@/components/custom/DatePicker";

const createExpenseSchema = z.object({
  branch_id: z.string().min(1, { message: "الفرع مطلوب" }),
  category: z.string().min(1, { message: "الفئة مطلوبة" }),
  amount: z.string().min(1, { message: "المبلغ مطلوب" }),
  expense_date: z.string().min(1, { message: "تاريخ المصروف مطلوب" }),
  vendor: z.string().min(1, { message: "اسم المورد مطلوب" }),
  reference_number: z.string().min(1, { message: "رقم المرجع مطلوب" }),
  description: z.string().min(1, { message: "الوصف مطلوب" }),
  notes: z.string().optional(),
});

type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateExpenseModal({ open, onOpenChange }: Props) {
  const { mutate: createExpense, isPending } = useMutation(
    useCreateExpenseMutationOptions()
  );

  const form = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      branch_id: "",
      category: "",
      amount: "",
      expense_date: "",
      vendor: "",
      reference_number: "",
      description: "",
      notes: "",
    },
  });

  const handleSubmit = (values: CreateExpenseFormValues) => {
    const payload: TCreateExpenseRequest = {
      branch_id: Number(values.branch_id),
      category: values.category,
      amount: Number(values.amount),
      expense_date: values.expense_date,
      vendor: values.vendor,
      reference_number: values.reference_number,
      description: values.description,
      notes: values.notes || "",
    };

    createExpense(payload, {
      onSuccess: () => {
        toast.success("تم إنشاء المصروف بنجاح");
        form.reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء إنشاء المصروف", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة مصروف جديد</DialogTitle>
          <DialogDescription className="text-center">
            املأ البيانات التالية لإضافة مصروف جديد.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            dir="rtl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفرع</FormLabel>
                    <FormControl>
                      <BranchesSelect
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ExpenseCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ المصروف</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) =>
                          field.onChange(
                            date ? date.toISOString().slice(0, 10) : ""
                          )
                        }
                        placeholder="اختر تاريخ المصروف"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المورد</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المورد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم المرجع</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الفاتورة أو المرجع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="وصف المصروف..."
                      {...field}
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
                    <Textarea rows={2} placeholder="ملاحظات إضافية..." {...field} />
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
                {isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

