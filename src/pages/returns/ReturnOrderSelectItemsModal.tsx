import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useReturnOrderItemMutationOptions } from "@/api/v2/orders/orders.hooks";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { TReturnOrderItemRequest } from "@/api/v2/orders/orders.types";
import { TOrder, TOrderItem } from "@/api/v2/orders/orders.types";
import { toast } from "sonner";
import { UploadFileField } from "@/components/custom/UploadFile";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  entity_type: z
    .string()
    .min(1, { message: "نوع المكان مطلوب" })
    .refine(
      (val) => ["branch", "factory", "workshop"].includes(val),
      { message: "نوع المكان مطلوب" }
    ),
  entity_id: z.string().min(1, { message: "المكان مطلوب" }),
  note: z.string().min(1, { message: "الملاحظة مطلوبة" }),
  photos: z
    .array(z.instanceof(File))
    .min(1, { message: "يجب إضافة صورة واحدة على الأقل" })
    .max(10, { message: "الحد الأقصى 10 صور" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TOrder | null;
  onSuccess?: () => void;
};

export function ReturnOrderSelectItemsModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: Props) {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

  const orderId = order?.id ?? 0;
  const { data: orderDetails, isPending: isOrderLoading } = useQuery({
    ...useGetOrderDetailsQueryOptions(orderId),
    enabled: open && orderId > 0,
  });

  const orderItems: TOrderItem[] = orderDetails?.items ?? order?.items ?? [];
  const returnableItems = orderItems.filter((item) => item.returnable === 1);

  const { mutateAsync: returnOrderItem, isPending: isReturning } = useMutation(
    useReturnOrderItemMutationOptions()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity_type: "",
      entity_id: "",
      note: "",
      photos: undefined,
    },
  });

  useEffect(() => {
    if (!open) {
      setSelectedItemIds(new Set());
      form.reset();
    }
  }, [open, form]);

  const toggleItem = (itemId: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItemIds.size === returnableItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(returnableItems.map((i) => i.id)));
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!order || selectedItemIds.size === 0) {
      toast.error("اختر قطعة واحدة على الأقل للإرجاع");
      return;
    }
    const data: TReturnOrderItemRequest = {
      entity_type: values.entity_type as "branch" | "factory" | "workshop",
      entity_id: parseInt(values.entity_id, 10),
      note: values.note,
      photos: values.photos,
    };
    const ids = Array.from(selectedItemIds);
    let successCount = 0;
    for (const itemId of ids) {
      try {
        await returnOrderItem({ order_id: order.id, item_id: itemId, data });
        successCount++;
      } catch (err: any) {
        toast.error(`فشل إرجاع أحد القطع: ${err?.message ?? "خطأ"}`);
        return;
      }
    }
    toast.success(
      successCount === ids.length
        ? `تم إرجاع ${successCount} قطعة بنجاح`
        : `تم إرجاع ${successCount} من ${ids.length} قطعة`
    );
    onOpenChange(false);
    onSuccess?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedItemIds(new Set());
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const selectedCount = selectedItemIds.size;
  const canSubmit =
    selectedCount > 0 &&
    returnableItems.length > 0 &&
    !isReturning &&
    !isOrderLoading;

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>اختيار القطع للإرجاع — طلب #{order.id}</DialogTitle>
          <DialogDescription>
            حدد القطع التي تريد إرجاعها ثم أدخل مكان الإرجاع والملاحظة والصور.
          </DialogDescription>
        </DialogHeader>

        {isOrderLoading ? (
          <p className="text-sm text-muted-foreground py-4">جاري تحميل تفاصيل الطلب...</p>
        ) : (
          <>
            {/* List of items with checkboxes */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto rounded-md border p-3 bg-muted/20">
              {returnableItems.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">لا توجد قطع قابلة للإرجاع في هذا الطلب.</p>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                      إغلاق
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Checkbox
                      id="select-all-return"
                      checked={
                        returnableItems.length > 0 &&
                        selectedItemIds.size === returnableItems.length
                      }
                      onCheckedChange={selectAll}
                    />
                    <label
                      htmlFor="select-all-return"
                      className="text-sm font-medium cursor-pointer"
                    >
                      تحديد الكل
                    </label>
                  </div>
                  {returnableItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItemIds.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {(item as { name?: string }).name ?? item.code} — كود: {item.code}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <EntitySelect
                  mode="form"
                  control={form.control}
                  entityTypeName="entity_type"
                  entityIdName="entity_id"
                  entityTypeLabel="نوع المكان المراد الإرجاع إليه"
                  entityIdLabel="المكان المراد الإرجاع إليه"
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الملاحظة</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل ملاحظة حول الإرجاع"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photos"
                  render={() => (
                    <FormItem>
                      <FormLabel>الصور (1–10)</FormLabel>
                      <FormControl>
                        <UploadFileField
                          name="photos"
                          multiple
                          maxFiles={10}
                          accept="image/*"
                          placeholder="اختر الصور"
                          showPreview
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isReturning}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    isLoading={isReturning}
                  >
                    {selectedCount > 0
                      ? `إرجاع القطع المحددة (${selectedCount})`
                      : "إرجاع القطع المحددة"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
