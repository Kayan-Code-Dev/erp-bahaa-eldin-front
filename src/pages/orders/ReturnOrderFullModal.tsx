import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useReturnOrderFullMutationOptions } from "@/api/v2/orders/orders.hooks";
import { TOrder, TOrderItem } from "@/api/v2/orders/orders.types";
import { TClothesStatus } from "@/api/v2/clothes/clothes.types";
import { toast } from "sonner";
import { UploadFileField } from "@/components/custom/UploadFile";

const CLOTH_STATUSES: { value: TClothesStatus; label: string }[] = [
  { value: "ready_for_rent", label: "جاهز للإيجار" },
  { value: "scratched", label: "خدش" },
  { value: "damaged", label: "تالف" },
  { value: "burned", label: "محترق" },
  { value: "repairing", label: "قيد الإصلاح" },
  { value: "rented", label: "مؤجر" },
  { value: "die", label: "منتهي" },
];

const itemSchema = z.object({
  status: z.enum([
    "ready_for_rent",
    "scratched",
    "damaged",
    "burned",
    "repairing",
    "rented",
    "die",
  ] as const),
  notes: z.string().optional(),
  photo: z.array(z.instanceof(File)).optional(),
});

const formSchema = z.object({
  items: z.array(itemSchema),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TOrder | null;
  onSuccess?: () => void;
};

export function ReturnOrderFullModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: Props) {
  const { mutate: returnOrderFull, isPending } = useMutation(
    useReturnOrderFullMutationOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    },
  });

  const orderItems = order?.items ?? [];
  const itemsCount = orderItems.length;

  useEffect(() => {
    if (order && open && orderItems.length > 0) {
      form.reset({
        items: orderItems.map(() => ({
          status: "ready_for_rent" as TClothesStatus,
          notes: "",
          photo: undefined,
        })),
      });
    }
  }, [order?.id, open, orderItems.length, form]);

  const onSubmit = (values: FormValues) => {
    if (!order) return;
    const orderItemWithCloth = orderItems as Array<
      TOrderItem & { cloth_id?: number; cloth?: { id?: number } }
    >;
    const payload = {
      items: orderItemWithCloth.map((orderItem, i) => {
        const clothId =
          orderItem.cloth_id ??
          orderItem.cloth?.id ??
          orderItem.id;
        const formItem = values.items[i];
        const status = formItem?.status ?? "ready_for_rent";
        return {
          cloth_id: Number(clothId),
          status,
          ...(formItem?.notes?.trim() && { notes: formItem.notes.trim() }),
          ...(formItem?.photo?.length ? { photo: formItem.photo } : {}),
        };
      }),
    };
    returnOrderFull(
      { orderId: order.id, data: payload },
      {
        onSuccess: () => {
          toast.success("تم إرجاع الطلب بنجاح");
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error("خطأ أثناء إرجاع الطلب", {
            description: error?.message,
          });
        },
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إرجاع الطلب بالكامل #{order.id}</DialogTitle>
          <DialogDescription>
            حدد حالة وملاحظات كل صنف ثم اضغط إرجاع الطلب.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3 space-y-3 bg-muted/30"
                >
                  <p className="font-medium text-sm">
                    {(item as { name?: string }).name ?? item.code} — كود: {item.code}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حالة القطعة</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CLOTH_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
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
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ملاحظات (اختياري)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ملاحظات..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`items.${index}.photo`}
                    render={() => (
                      <FormItem>
                        <FormLabel>صور (اختياري)</FormLabel>
                        <FormControl>
                          <UploadFileField
                            name={`items.${index}.photo`}
                            multiple
                            maxFiles={5}
                            accept="image/*"
                            placeholder="إرفاق صور"
                            showPreview
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            {itemsCount === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد أصناف في هذا الطلب.</p>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isPending || itemsCount === 0}
                isLoading={isPending}
              >
                إرجاع الطلب
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
