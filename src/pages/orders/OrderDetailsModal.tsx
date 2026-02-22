import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { formatDate } from "@/utils/formatDate";
import { getOrderTypeLabel } from "@/api/v2/orders/order.utils";

type Props = {
  order: TOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getStatusVariant = (status: TOrder["status"]) => {
  switch (status) {
    case "paid":
      return "bg-green-600 text-white hover:bg-green-600/80";
    case "partially_paid":
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
    case "canceled":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    case "created":
    case "delivered":
    default:
      return "bg-gray-500 text-white hover:bg-gray-500/80";
  }
};

const getStatusLabel = (status: TOrder["status"]) => {
  const labels: Record<TOrder["status"], string> = {
    created: "تم إنشاء الطلب",
    paid: "مدفوع",
    partially_paid: "مدفوع جزئياً",
    canceled: "ملغي",
    delivered: "تم تسليم الطلب",
  };
  return labels[status] || status;
};

const getDiscountTypeLabel = (type?: TOrder["discount_type"]) => {
  if (!type || type === "none") return "لا يوجد";
  const labels: Record<"percentage" | "fixed", string> = {
    percentage: "نسبة مئوية",
    fixed: "مبلغ ثابت",
  };
  if (type === "percentage" || type === "fixed") {
    return labels[type];
  }
  return type;
};

export function OrderDetailsModal({ order, open, onOpenChange }: Props) {
  const { data, isPending } = useQuery({
    ...useGetOrderDetailsQueryOptions(order?.id || 0),
    enabled: open && !!order?.id,
  });

  const orderData = data || order;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الطلب</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالطلب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2" dir="rtl">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : orderData ? (
            <>
              <div className="modal-section">
                <p className="modal-section-title">معلومات الطلب</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    رقم الطلب
                  </p>
                  <p className="text-lg font-semibold">#{orderData.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    نوع الطلب
                  </p>
                  <p className="text-lg font-semibold">
                    {getOrderTypeLabel(orderData.order_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الحالة
                  </p>
                  <Badge
                    variant="secondary"
                    className={getStatusVariant(orderData.status)}
                  >
                    {getStatusLabel(orderData.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    السعر الإجمالي
                  </p>
                  <p className="text-lg font-semibold">
                    {orderData.total_price} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    المدفوع
                  </p>
                  <p className="text-lg font-semibold">{orderData.paid} ج.م</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    المتبقي
                  </p>
                  <p className="text-lg font-semibold">
                    {orderData.remaining} ج.م
                  </p>
                </div>
                {orderData.discount_type &&
                  orderData.discount_type !== "none" && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          نوع الخصم (على الطلب)
                        </p>
                        <p className="text-lg">
                          {getDiscountTypeLabel(orderData.discount_type)}
                        </p>
                      </div>
                      {(orderData.discount_value ?? "") !== "" && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            قيمة الخصم (على الطلب)
                          </p>
                          <p className="text-lg">
                            {orderData.discount_type === "percentage"
                              ? `${orderData.discount_value ?? ""}%`
                              : `${orderData.discount_value ?? ""} ج.م`}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    موعد الاستلام
                  </p>
                  <p className="text-lg">
                    {formatDate(orderData.visit_datetime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    موعد الاسترجاع
                  </p>
                  <p className="text-lg">
                    {orderData.delivery_date ? formatDate(orderData.delivery_date) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    موعد الفرح
                  </p>
                  <p className="text-lg">
                    {orderData.occasion_datetime ? formatDate(orderData.occasion_datetime) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ إنشاء الفاتورة
                  </p>
                  <p className="text-lg">
                    {formatDate(orderData.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    عدد أيام الإيجار
                  </p>
                  <p className="text-lg">
                    {orderData.days_of_rent != null ? orderData.days_of_rent : "-"}
                  </p>
                </div>
              </div>
              </div>

              {orderData.client && (
                <div className="modal-section">
                  <p className="modal-section-title">معلومات العميل</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        الاسم
                      </p>
                      <p className="text-lg">{orderData.client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        رقم العميل
                      </p>
                      <p className="text-lg">#{orderData.client.id}</p>
                    </div>
                    {orderData.client.address != null && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            الشارع
                          </p>
                          <p className="text-lg">
                            {orderData.client.address.street}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            المبنى
                          </p>
                          <p className="text-lg">
                            {orderData.client.address.building}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            المدينة
                          </p>
                          <p className="text-lg">
                            {orderData.client.address.city_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            الدولة
                          </p>
                          <p className="text-lg">
                            {orderData.client.address.country_name}
                          </p>
                        </div>
                        {orderData.client.address.notes && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              ملاحظات العنوان
                            </p>
                            <p className="text-lg">
                              {orderData.client.address.notes}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {orderData.inventory && (
                <div className="modal-section">
                  <p className="modal-section-title">المخزن / الفرع</p>
                  <p className="text-muted-foreground text-sm">
                    {orderData.inventory.name}
                    {orderData.inventory.inventoriable && (
                      <> — {orderData.inventory.inventoriable.name}</>
                    )}
                  </p>
                </div>
              )}

              {orderData.items && orderData.items.length > 0 && (
                <div className="modal-section">
                  <p className="modal-section-title">عناصر الطلب</p>
                  <div className="overflow-hidden rounded-lg border border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">#</TableHead>
                          <TableHead className="text-center">الكود</TableHead>
                          <TableHead className="text-center">الاسم</TableHead>
                          <TableHead className="text-center">النوع</TableHead>
                          <TableHead className="text-center">الكمية</TableHead>
                          <TableHead className="text-center">السعر</TableHead>
                          <TableHead className="text-center">المدفوع</TableHead>
                          <TableHead className="text-center">المتبقي</TableHead>
                          <TableHead className="text-center">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderData.items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.code}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.name ?? item.code}
                            </TableCell>
                            <TableCell className="text-center">
                              {getOrderTypeLabel(item.type)}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.price} ج.م
                            </TableCell>
                            <TableCell className="text-center">
                              {item.item_paid} ج.م
                            </TableCell>
                            <TableCell className="text-center">
                              {item.item_remaining} ج.م
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusLabel(item.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {orderData.order_notes && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">ملاحظات الطلب</h3>
                  <p className="text-muted-foreground">
                    {orderData.order_notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              لا توجد بيانات لعرضها.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
