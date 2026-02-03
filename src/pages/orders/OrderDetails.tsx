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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Link, useParams } from "react-router";
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
  const labels: Record<"percentage" | "fixed", string> = {
    percentage: "نسبة مئوية",
    fixed: "مبلغ ثابت",
  };
  if (type === "percentage" || type === "fixed") {
    return labels[type];
  }
  return type;
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
    return orderData?.items.every((item) => item.returnable === 0);
  }, [orderData?.items]);

  return (
    <div className="space-y-6" dir="rtl">
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
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
              <CardDescription>البيانات الأساسية للطلب والمدفوعات</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                            ? `${orderData.discount_value ?? ""}%`
                            : `${orderData.discount_value ?? ""} ج.م`}
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
                  تاريخ التسليم
                </p>
                <p className="text-lg">
                  {orderData.delivery_date ? formatDate(orderData.delivery_date) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  تاريخ المناسبة
                </p>
                <p className="text-lg">
                  {orderData.occasion_datetime ? formatDate(orderData.occasion_datetime) : "-"}
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
            </CardContent>
          </Card>

          {/* Inventory / Branch */}
          {orderData.inventory && (
            <Card>
              <CardHeader>
                <CardTitle>المخزن / الفرع</CardTitle>
                <CardDescription>معلومات المخزن المرتبط بالطلب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">اسم المخزن</p>
                    <p className="text-lg font-medium">{orderData.inventory.name}</p>
                  </div>
                  {orderData.inventory.inventoriable && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">كود الفرع</p>
                        <p className="text-lg">{orderData.inventory.inventoriable.branch_code ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">اسم الفرع</p>
                        <p className="text-lg">{orderData.inventory.inventoriable.name}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Info */}
          {orderData.client && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
                <CardDescription>بيانات العميل والعنوان</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>عناصر الطلب</CardTitle>
                <CardDescription>المنتجات والخدمات المدرجة في الطلب</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="overflow-hidden rounded-md border">
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
                      <TableHead className="text-center">تفاصيل المنتج</TableHead>
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
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={`/orders/${orderData.id}/items/${item.id}`}
                              title="عرض كل تفاصيل المنتج والقياسات"
                            >
                              عرض التفاصيل
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            title="إرجاع الملابس"
                            disabled={item.returnable === 0}
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
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {orderData.order_notes && (
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{orderData.order_notes}</p>
              </CardContent>
            </Card>
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
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              لا توجد بيانات لعرضها.
            </p>
          </CardContent>
        </Card>
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
