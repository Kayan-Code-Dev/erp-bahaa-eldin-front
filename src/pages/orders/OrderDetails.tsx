import { ORDER_NEEDS_CUSTODY } from "@/api/v2/orders/order.errors";
import {
  useCancelOrderMutationOptions,
  useDeliverOrderMutationOptions,
  useFinishOrderMutationOptions,
  useGetOrderDetailsQueryOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { CreateCustodyModal } from "./CreateCustodyModal";
import { OrderCustodiesTable } from "./OrderCustodiesTable";
import OrderDetailsSkeleton from "./OrderDetailsSkeleton";
import { OrderPaymentsTable } from "./OrderPaymentsTable";
import { ReturnOrderItemModal } from "./ReturnOrderItemModal";
import { getOrderTypeLabel } from "@/api/v2/orders/order.utils";

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
  const labels: Record<
    Exclude<TOrder["discount_type"], "none" | undefined>,
    string
  > = {
    percentage: "نسبة مئوية",
    fixed: "مبلغ ثابت",
  };
  return labels[type] || type;
};

function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : 0;
  const [isCustodyModalOpen, setIsCustodyModalOpen] = useState(false);
  const [returnItemModal, setReturnItemModal] = useState<{
    open: boolean;
    itemId: number | null;
  }>({ open: false, itemId: null });

  const { data: orderData, isPending } = useQuery({
    ...useGetOrderDetailsQueryOptions(orderId),
    enabled: !!orderId,
  });

  const { mutate: deliverOrder, isPending: isDelivering } = useMutation(
    useDeliverOrderMutationOptions()
  );

  const { mutate: finishOrder, isPending: isFinishing } = useMutation(
    useFinishOrderMutationOptions()
  );

  const { mutate: cancelOrder, isPending: isCanceling } = useMutation(
    useCancelOrderMutationOptions()
  );

  const isUpdating = isDelivering || isFinishing || isCanceling;

  const handleDeliverOrder = () => {
    if (orderData?.id) {
      deliverOrder(orderData.id, {
        onSuccess: () => {
          toast.success("تم تسليم الطلب");
        },
        onError: (error: any) => {
          toast.error("خطأ في تسليم الطلب", {
            description: error.message,
          });
          if (error.message.includes(ORDER_NEEDS_CUSTODY)) {
            setIsCustodyModalOpen(true);
          }
        },
      });
    }
  };

  const handleCancelOrder = () => {
    if (orderData?.id) {
      cancelOrder(orderData.id, {
        onSuccess: () => {
          toast.success("تم إلغاء الطلب");
        },
        onError: (error: any) => {
          toast.error("خطأ في إلغاء الطلب", {
            description: error.message,
          });
        },
      });
    }
  };

  const showFinishButton = useMemo(() => {
    return orderData?.items.every((item) => item.returnable === "0");
  }, [orderData?.items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
        {orderData && (
          <div className="flex gap-2">
            {orderData.order_type === "rent" && (
              <Button
                variant="outline"
                onClick={() => setIsCustodyModalOpen(true)}
                disabled={isUpdating}
              >
                إضافة ضمان
              </Button>
            )}
            {orderData.status === "paid" && (
              <Button
                variant="default"
                onClick={handleDeliverOrder}
                disabled={isUpdating}
                isLoading={isDelivering}
              >
                تسليم
              </Button>
            )}
            {showFinishButton && (
              <Button
                variant="default"
                onClick={() => finishOrder(orderData.id)}
                disabled={isUpdating}
                isLoading={isFinishing}
              >
                إنهاء
              </Button>
            )}
            {orderData.status !== "canceled" && (
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={isUpdating}
                isLoading={isCanceling}
              >
                إلغاء
              </Button>
            )}
          </div>
        )}
      </div>

      {isPending ? (
        <OrderDetailsSkeleton />
      ) : orderData ? (
        <>
          {/* Order Basic Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">معلومات الطلب</h2>
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
                    {orderData.discount_value && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          قيمة الخصم (على الطلب)
                        </p>
                        <p className="text-lg">
                          {orderData.discount_type === "percentage"
                            ? `${orderData.discount_value}%`
                            : `${orderData.discount_value} ج.م`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  تاريخ الزيارة
                </p>
                <p className="text-lg">
                  {formatDate(orderData.visit_datetime)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  تاريخ الإنشاء
                </p>
                <p className="text-lg">{formatDate(orderData.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  آخر تحديث
                </p>
                <p className="text-lg">{formatDate(orderData.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          {orderData.client && (
            <div className="bg-white rounded-lg p-6 shadow-sm border-t">
              <h3 className="text-lg font-semibold mb-3">معلومات العميل</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    رقم العميل
                  </p>
                  <p className="text-lg">#{orderData.client.id}</p>
                </div>
                {orderData.client.address && (
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

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border-t">
              <h3 className="text-lg font-semibold mb-3">عناصر الطلب</h3>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">#</TableHead>
                      <TableHead className="text-center">الكود</TableHead>
                      <TableHead className="text-center">الاسم</TableHead>
                      <TableHead className="text-center">الوصف</TableHead>
                      <TableHead className="text-center">المقاسات</TableHead>
                      <TableHead className="text-center">الخصم</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">ملاحظات</TableHead>
                      <TableHead className="text-center">
                        قابل للإرجاع
                      </TableHead>
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
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="max-w-[200px] mx-auto text-wrap">
                            {item.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.breast_size || "-"}, {item.waist_size || "-"},{" "}
                          {item.sleeve_size || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.discount_type && item.discount_type !== "none"
                            ? getDiscountTypeLabel(item.discount_type)
                            : "-"}{" "}
                          <br />
                          {item.discount_type &&
                          item.discount_type !== "none" &&
                          item.discount_value
                            ? `${
                                item.discount_type === "percentage"
                                  ? `${item.discount_value}%`
                                  : `${item.discount_value} ج.م`
                              }`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusLabel(item.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="max-w-[200px] mx-auto text-wrap">
                            {item.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            title="إرجاع الملابس"
                            disabled={item.returnable === "0"}
                            onClick={() =>
                              setReturnItemModal({
                                open: true,
                                itemId: item.id,
                              })
                            }
                          >
                            إرجاع
                          </Button>
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
            <div className="bg-white rounded-lg p-6 shadow-sm border-t">
              <h3 className="text-lg font-semibold mb-3">ملاحظات الطلب</h3>
              <p className="text-muted-foreground">{orderData.order_notes}</p>
            </div>
          )}

          {/* Custodies Table */}
          <OrderCustodiesTable
            orderId={orderData.id}
            clientId={orderData.client_id}
          />

          {/* Payments Table */}
          <OrderPaymentsTable orderId={orderData.id} />
        </>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-center text-muted-foreground">
            لا توجد بيانات لعرضها.
          </p>
        </div>
      )}

      {/* Create Custody Modal */}
      {orderData && (
        <CreateCustodyModal
          open={isCustodyModalOpen}
          onOpenChange={setIsCustodyModalOpen}
          orderId={orderData.id}
        />
      )}

      {/* Return Order Item Modal */}
      {orderData && returnItemModal.itemId !== null && (
        <ReturnOrderItemModal
          open={returnItemModal.open}
          onOpenChange={(open) =>
            setReturnItemModal({
              open,
              itemId: open ? returnItemModal.itemId : null,
            })
          }
          orderId={orderData.id}
          itemId={returnItemModal.itemId}
          itemName={
            orderData.items.find((item) => item.id === returnItemModal.itemId)
              ?.name
          }
        />
      )}
    </div>
  );
}

export default OrderDetails;
