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

function getStatusBadgeVariant(status: string): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  const s = (status || "").toLowerCase();
  if (s === "pending" || s === "قيد الانتظار") return "warning";
  if (s === "completed" || s === "مكتمل" || s === "delivered") return "success";
  if (s === "cancelled" || s === "ملغى") return "destructive";
  return "secondary";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    completed: "مكتمل",
    cancelled: "ملغى",
    delivered: "تم التسليم",
  };
  return labels[(status || "").toLowerCase()] || status || "—";
}

function formatCurrency(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = parseFloat(String(value));
  if (Number.isNaN(num)) return "—";
  return `${num.toLocaleString("en-EG", { minimumFractionDigits: 2 })} ج.م`;
}

function SupplierOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;
  const supplierIdParam = searchParams.get("supplier_id");
  const supplierId = supplierIdParam ? Number(supplierIdParam) : 0;

  const [selectedOrder, setSelectedOrder] = useState<TSupplierOrderResponse | null>(null);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState<TSupplierOrderResponse | null>(null);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<TSupplierOrderResponse | null>(null);

  const { mutate: returnOrder, isPending: isReturning } = useMutation(
    useReturnSupplierOrderMutationOptions()
  );

  const allOrdersQuery = useQuery(
    useGetSupplierOrdersQueryOptions(page, per_page)
  );
  const ordersBySupplierQuery = useQuery(
    useGetSupplierOrdersBySupplierIdQueryOptions(supplierId, page, per_page)
  );

  const { data, isPending, isError, error } = supplierId > 0
    ? ordersBySupplierQuery
    : allOrdersQuery;

  const { data: supplierData } = useQuery({
    ...useGetSupplierQueryOptions(supplierId),
    enabled: supplierId > 0,
  });

  const handleOpenEditOrder = (order: TSupplierOrderResponse) => {
    setSelectedOrder(order);
    setIsEditOrderModalOpen(true);
  };

  const handleOpenAddPayment = (order: TSupplierOrderResponse) => {
    setOrderForPayment(order);
    setIsAddPaymentModalOpen(true);
  };

  const handleConfirmReturn = (onClose: () => void) => {
    if (!orderToReturn) return;
    returnOrder(orderToReturn.id, {
      onSuccess: () => {
        toast.success("تم إرجاع الطلبية بنجاح");
        setOrderToReturn(null);
        onClose();
      },
      onError: (error: { message?: string }) => {
        toast.error("حدث خطأ أثناء إرجاع الطلبية", { description: error?.message });
      },
    });
  };

  const clearSupplierFilter = () => {
    navigate("/suppliers/orders", { replace: true });
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {supplierId > 0 && supplierData
                ? `طلبيات المورد: ${supplierData.name}`
                : "طلبيات الموردين"}
            </CardTitle>
            <CardDescription>
              {supplierId > 0
                ? `عرض طلبيات المورد المحدد فقط.`
                : "عرض وإدارة جميع طلبيات الموردين في النظام."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {supplierId > 0 && (
              <Button variant="outline" onClick={clearSupplierFilter}>
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
                    <TableHead className="text-center whitespace-nowrap w-12">#</TableHead>
                    <TableHead className="text-center whitespace-nowrap">رقم الطلبية</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المورد</TableHead>
                    <TableHead className="text-center whitespace-nowrap">التاريخ</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الإجمالي</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المدفوع</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المتبقي</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الفرع</TableHead>
                    <TableHead className="text-center whitespace-nowrap w-36">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <SupplierOrdersTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((order: TSupplierOrderResponse) => (
                      <TableRow key={order.id} className="transition-colors">
                        <TableCell className="text-center font-medium">
                          <span dir="ltr" className="tabular-nums">{toEnglishNumerals(order.id)}</span>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <span dir="ltr">{toEnglishNumerals(order.order_number) || "—"}</span>
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
                            {order.order_date ? toEnglishNumerals(formatDate(order.order_date)) : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(formatCurrency(order.total_amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(formatCurrency(order.payment_amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          <span dir="ltr">
                            {toEnglishNumerals(formatCurrency(order.remaining_payment))}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {order.branch?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="إضافة دفعة"
                              onClick={() => handleOpenAddPayment(order)}
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="إرجاع الطلبية"
                              onClick={() => setOrderToReturn(order)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="تحديث الطلبية"
                              onClick={() => handleOpenEditOrder(order)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
              totalElements={data?.total}
              totalPages={data?.total_pages}
              isLoading={isPending}
            />
          </CardFooter>
        )}

        <EditSupplierOrderModal
          order={selectedOrder}
          open={isEditOrderModalOpen}
          onOpenChange={setIsEditOrderModalOpen}
        />
        <AddPaymentToSupplierOrderModal
          order={orderForPayment}
          open={isAddPaymentModalOpen}
          onOpenChange={setIsAddPaymentModalOpen}
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
                )}{" "}
               ؟
              </>
            ) : null
          }
          handleConfirmation={(onClose) => handleConfirmReturn(onClose)}
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
