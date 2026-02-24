import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, RotateCcw, Banknote, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import {
  useGetSupplierOrdersQueryOptions,
  useGetSupplierOrdersBySupplierIdQueryOptions,
  useGetSupplierQueryOptions,
  useReturnSupplierOrderMutationOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import { TSupplierOrderResponse } from "@/api/v2/suppliers/suppliers.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { formatDate, toEnglishNumerals } from "@/utils/formatDate";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";

import { SupplierOrdersTableSkeleton } from "./SupplierOrdersTableSkeleton";
import { EditSupplierOrderModal } from "./EditSupplierOrderModal";
import { AddPaymentToSupplierOrderModal } from "./AddPaymentToSupplierOrderModal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  const s = (status || "").toLowerCase();
  if (s === "pending" || s === "قيد الانتظار") return "warning";
  if (s === "completed" || s === "مكتمل" || s === "delivered") return "success";
  if (s === "cancelled" || s === "ملغى") return "destructive";
  return "secondary";
}

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  completed: "مكتمل",
  cancelled: "ملغى",
  delivered: "تم التسليم",
};

function getStatusLabel(status: string): string {
  return STATUS_LABELS[(status || "").toLowerCase()] || status || "—";
}

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return "—";
  return `${toEnglishNumerals(num.toLocaleString("en-US", { minimumFractionDigits: 2 }))} ج.م`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function SupplierOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;
  const supplierId = Number(searchParams.get("supplier_id")) || 0;

  // ---- modal state ----
  const [selectedOrder, setSelectedOrder] =
    useState<TSupplierOrderResponse | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [orderForPayment, setOrderForPayment] =
    useState<TSupplierOrderResponse | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] =
    useState<TSupplierOrderResponse | null>(null);

  // ---- mutations ----
  const { mutate: returnOrder, isPending: isReturning } = useMutation(
    useReturnSupplierOrderMutationOptions(),
  );

  // ---- queries ----
  const allQuery = useQuery(useGetSupplierOrdersQueryOptions(page, per_page));
  const bySupplierQuery = useQuery(
    useGetSupplierOrdersBySupplierIdQueryOptions(supplierId, page, per_page),
  );
  const { data, isPending, isError, error } =
    supplierId > 0 ? bySupplierQuery : allQuery;

  const { data: supplierData } = useQuery({
    ...useGetSupplierQueryOptions(supplierId),
    enabled: supplierId > 0,
  });

  // ---- status helpers ----
  const isCancelled = (o: TSupplierOrderResponse) =>
    (o.status || "").toLowerCase() === "cancelled";
  const isDelivered = (o: TSupplierOrderResponse) =>
    (o.status || "").toLowerCase() === "delivered";
  const isActive = (o: TSupplierOrderResponse) =>
    !isCancelled(o) && !isDelivered(o);

  const canEdit = (o: TSupplierOrderResponse) => isActive(o);
  const canAddPayment = (o: TSupplierOrderResponse) =>
    isActive(o) && parseFloat(String(o.remaining_payment || "0")) > 0;
  const canReturn = (o: TSupplierOrderResponse) => isActive(o);

  // ---- handlers ----
  const handleEditOrder = (order: TSupplierOrderResponse) => {
    setSelectedOrder(order);
    setIsEditOpen(true);
  };

  const handleAddPayment = (order: TSupplierOrderResponse) => {
    setOrderForPayment(order);
    setIsPaymentOpen(true);
  };

  const handleConfirmReturn = (onClose: () => void) => {
    if (!orderToReturn) return;
    returnOrder(orderToReturn.id, {
      onSuccess: () => {
        toast.success("تم إرجاع الطلبية بنجاح");
        setOrderToReturn(null);
        onClose();
      },
      onError: (err: { message?: string }) => {
        toast.error("حدث خطأ أثناء إرجاع الطلبية", {
          description: err?.message,
        });
      },
    });
  };

  // ---- render ----
  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {supplierId > 0
                ? supplierData
                  ? `طلبيات المورد: ${supplierData.name}`
                  : `طلبيات المورد #${supplierId}`
                : "طلبيات الموردين"}
            </CardTitle>
            <CardDescription>
              {supplierId > 0
                ? "عرض طلبيات المورد المحدد فقط."
                : "عرض وإدارة جميع طلبيات الموردين في النظام."}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {supplierId > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate("/suppliers/orders", { replace: true })}
              >
                <X className="ml-2 h-4 w-4" />
                عرض كل الطلبيات
              </Button>
            )}
            <Button onClick={() => navigate("/suppliers/orders/add")}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة طلبية
            </Button>
          </div>
        </CardHeader>

        {isError && (
          <CardContent>
            <div className="flex justify-center rounded-md border border-destructive/50 bg-destructive/10 py-6">
              <p className="text-destructive">
                {error?.message ?? "حدث خطأ أثناء تحميل البيانات."}
              </p>
            </div>
          </CardContent>
        )}

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-center whitespace-nowrap w-12">
                      #
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      رقم الطلبية
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      المورد
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      التاريخ
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      الحالة
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      الإجمالي
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      المدفوع
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      المتبقي
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      الفرع
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap w-36">
                      إجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isPending ? (
                    <SupplierOrdersTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((order) => (
                      <TableRow key={order.id} className="transition-colors">
                        <TableCell className="text-center font-medium">
                          <span dir="ltr" className="tabular-nums">
                            {toEnglishNumerals(order.id)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <span dir="ltr">
                            {toEnglishNumerals(order.order_number) || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {order.supplier?.name ?? "—"}
                          </span>
                          {order.supplier?.code && (
                            <span className="text-muted-foreground text-xs block">
                              {order.supplier.code}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          <span dir="ltr">
                            {order.order_date
                              ? toEnglishNumerals(formatDate(order.order_date))
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(
                              formatCurrency(order.total_amount),
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(
                              formatCurrency(order.payment_amount),
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(
                              formatCurrency(order.remaining_payment),
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {order.branch?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {canEdit(order) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="تحديث الطلبية"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canAddPayment(order) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                title="إضافة دفعة"
                                onClick={() => handleAddPayment(order)}
                              >
                                <Banknote className="h-4 w-4" />
                              </Button>
                            )}
                            {canReturn(order) && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                title="إرجاع الطلبية"
                                onClick={() => setOrderToReturn(order)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="h-32 text-center text-muted-foreground"
                      >
                        لا توجد طلبيات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}

        {!isError && data && (
          <CardFooter className="flex items-center justify-between border-t bg-muted/30">
            <CustomPagination
              totalElementsLabel="إجمالي الطلبيات"
              totalElements={data.total}
              totalPages={data.total_pages}
              isLoading={isPending}
            />
          </CardFooter>
        )}

        {/* Modals */}
        <EditSupplierOrderModal
          order={selectedOrder}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <AddPaymentToSupplierOrderModal
          order={orderForPayment}
          open={isPaymentOpen}
          onOpenChange={(open) => {
            setIsPaymentOpen(open);
            if (!open) setOrderForPayment(null);
          }}
        />

        <ControlledConfirmationModal
          open={!!orderToReturn}
          onOpenChange={(open) => !open && setOrderToReturn(null)}
          alertTitle="إرجاع الطلبية"
          alertMessage={
            orderToReturn ? (
              <>
                هل أنت متأكد من إرجاع الطلبية{" "}
                <strong>#{orderToReturn.id}</strong>
                {orderToReturn.order_number && (
                  <> ({orderToReturn.order_number})</>
                )}
                ؟
              </>
            ) : null
          }
          handleConfirmation={handleConfirmReturn}
          isPending={isReturning}
          pendingLabel="جاري الإرجاع..."
          confirmLabel="إرجاع الطلبية"
          cancelLabel="إلغاء"
          variant="destructive"
        />
      </Card>
    </div>
  );
}

export default SupplierOrders;
