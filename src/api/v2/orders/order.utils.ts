import { TOrder } from "./orders.types";

export const getOrderTypeLabel = (order_type: TOrder["order_type"]) => {
  if (order_type === "rent") return "إيجار";
  if (order_type === "buy") return "شراء";
  if (order_type === "tailoring") return "تفصيل";
  return order_type;
};

export const getStatusVariant = (status: TOrder["status"] | string) => {
  switch (status) {
    case "paid":
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
    partially_paid: "مدفوع جزئياً",
    canceled: "ملغي",
    delivered: "تم تسليم الطلب",
    returned: "مرتجع",
    overdue: "متأخر",
  };
  return labels[status] ?? status;
};
