import { TOrder } from "./orders.types";

export const getOrderTypeLabel = (order_type: TOrder["order_type"]) => {
  if (order_type === "rent") return "إيجار";
  if (order_type === "buy") return "شراء";
  if (order_type === "tailoring") return "تفصيل";
  if (order_type === "mixed") return "مختلط";
  if (order_type === "unknown") return "—";
  return order_type ?? "—";
};

export const getStatusVariant = (status: TOrder["status"] | string) => {
  switch (status) {
    case "paid":
    case "finished":
      return "bg-green-600 text-white hover:bg-green-600/80";
    case "partially_paid":
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
    case "canceled":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    case "returned":
      return "bg-purple-600 text-white hover:bg-purple-600/80";
    case "overdue":
      return "bg-amber-600 text-white hover:bg-amber-600/80";
    case "created":
    case "delivered":
    default:
      return "bg-gray-500 text-white hover:bg-gray-500/80";
  }
};

export const getStatusLabel = (status: TOrder["status"] | string) => {
  const labels: Record<string, string> = {
    created: "تم إنشاء الطلب",
    paid: "مدفوع",
    finished: "منتهي",
    partially_paid: "مدفوع جزئياً",
    canceled: "ملغي",
    delivered: "تم تسليم الطلب",
    returned: "مرتجع",
    overdue: "متأخر",
  };
  return labels[status] ?? status;
};

type OrderLike = Partial<TOrder> & {
  branch?: {
    currency_name?: string | null;
    currency_code?: string | null;
    currency_symbol?: string | null;
  } | null;
  vat_enabled?: boolean | null;
  vat_type?: "fixed" | "percentage" | "none" | null;
  vat_value?: string | number | null;
};

export const getOrderCurrencyInfo = (order?: OrderLike | null) => {
  const branch = order?.branch as
    | {
        currency_name?: string | null;
        currency_code?: string | null;
        currency_symbol?: string | null;
      }
    | null
    | undefined;

  const currency_name = branch?.currency_name ?? "جنيه مصري";
  const currency_code = branch?.currency_code ?? "EGP";
  const currency_symbol = branch?.currency_symbol ?? "ج.م";

  return { currency_name, currency_code, currency_symbol };
};

export const getOrderTotalsWithVat = (order?: OrderLike | null) => {
  const rawTotal = (order?.total_price ?? "") as string | number;
  const totalWithVat =
    typeof rawTotal === "number"
      ? rawTotal
      : parseFloat(String(rawTotal).replace(/,/g, "")) || 0;

  const vatEnabled = Boolean(order?.vat_enabled);
  const vatType = order?.vat_type ?? null;
  const rawVatValue = order?.vat_value;
  const vatValue =
    rawVatValue == null || rawVatValue === ""
      ? 0
      : parseFloat(String(rawVatValue).replace(/,/g, "")) || 0;

  return {
    subtotal: totalWithVat,
    vatAmount: 0,
    totalWithVat,
    vatEnabled,
    vatType,
    vatValue,
  };
};
