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
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  useAddPaymentToSupplierOrderMutationOptions,
  useGetSupplierOrderQueryOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import {
  TSupplierOrderResponse,
  TSupplierOrderClothItem,
  resolveClothId,
} from "@/api/v2/suppliers/suppliers.types";
import { toEnglishNumerals } from "@/utils/formatDate";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return "—";
  return `${toEnglishNumerals(num.toLocaleString("en-US", { minimumFractionDigits: 2 }))} ج.م`;
}

function clothDisplayName(cloth: TSupplierOrderClothItem): string {
  return (
    [cloth.name, cloth.code].filter(Boolean).join(" — ") ||
    `قطعة #${resolveClothId(cloth)}`
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  order: TSupplierOrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddPaymentToSupplierOrderModal({
  order,
  open,
  onOpenChange,
}: Props) {
  const orderId = order?.id ?? 0;
  const supplierId = order?.supplier_id ?? 0;

  // ---- data fetching ----
  const { data: orderDetail, isLoading } = useQuery(
    useGetSupplierOrderQueryOptions(supplierId, orderId, {
      enabled: open && orderId > 0 && supplierId > 0,
    }),
  );

  const { mutate: addPayment, isPending } = useMutation(
    useAddPaymentToSupplierOrderMutationOptions(),
  );

  const orderClothes = orderDetail?.clothes ?? [];

  // ---- local state: amount string per index ----
  const [amounts, setAmounts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!open) return;
    if (orderClothes.length > 0) {
      const init: Record<number, string> = {};
      orderClothes.forEach((_, i) => {
        init[i] = "";
      });
      setAmounts(init);
    }
  }, [open, orderClothes.length]);

  // ---- handlers ----
  const handleClose = useCallback(() => {
    setAmounts({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleAmountChange = useCallback((index: number, value: string) => {
    setAmounts((prev) => ({ ...prev, [index]: value }));
  }, []);

  const handleSubmit = () => {
    if (!order) return;

    const clothes = orderClothes
      .map((c, i) => ({
        cloth_id: resolveClothId(c),
        amount: parseFloat(amounts[i] ?? "") || 0,
      }))
      .filter((c) => c.cloth_id > 0 && c.amount > 0);

    if (clothes.length === 0) {
      toast.error("أدخل مبلغاً أكبر من صفر لقطعة واحدة على الأقل");
      return;
    }

    addPayment(
      { id: order.id, clothes },
      {
        onSuccess: () => {
          toast.success("تم إضافة الدفعة بنجاح");
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error("حدث خطأ أثناء إضافة الدفعة", {
            description: err?.message,
          });
        },
      },
    );
  };

  // ---- derived ----
  const remaining = order
    ? parseFloat(String(order.remaining_payment || 0))
    : 0;

  // ---- render ----
  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة دفعة لطلبية</DialogTitle>
          <DialogDescription className="text-center">
            {order && (
              <span>
                الطلبية #{toEnglishNumerals(order.id)}
                {order.order_number && ` (${order.order_number})`} — المتبقي:{" "}
                {formatCurrency(order.remaining_payment)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orderClothes.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            لا توجد قطع في هذه الطلبية.
          </p>
        ) : (
          <div className="space-y-4">
            <Label>المبلغ لكل قطعة</Label>

            <div className="rounded-md border divide-y max-h-[320px] overflow-y-auto">
              {orderClothes.map((cloth, index) => (
                <div
                  key={`cloth-${index}-${resolveClothId(cloth)}`}
                  className="p-3 space-y-2 even:bg-muted/20"
                >
                  <div className="text-sm font-medium">
                    {clothDisplayName(cloth)}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>المدفوع: {formatCurrency(cloth.payment)}</span>
                    <span>الباقي: {formatCurrency(cloth.remaining)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs shrink-0">مبلغ الدفعة:</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className="max-w-[140px]"
                      value={amounts[index] ?? ""}
                      onChange={(e) =>
                        handleAmountChange(index, e.target.value)
                      }
                    />
                    <span className="text-xs text-muted-foreground">ج.م</span>
                  </div>
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <p className="text-xs text-muted-foreground">
                المتبقي على الطلبية: {formatCurrency(remaining)}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "جاري الإضافة..." : "إضافة الدفعة"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
