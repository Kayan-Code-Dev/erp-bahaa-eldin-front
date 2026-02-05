import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import { Download, Eye, Pencil, FileText, FileUser, FileCheck } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/custom/CustomPagination";
import {
  useExportOrdersToCSVMutationOptions,
  useGetOrdersQueryOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate } from "@/utils/formatDate";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderInvoicePrintModal } from "./OrderInvoicePrintModal";
import { OrderReceiptAckPrintModal } from "./OrderReceiptAckPrintModal";
import { getOrderTypeLabel } from "@/api/v2/orders/order.utils";
// dropdown menu imports تمت إزالتها بعد استبدال القائمة بأزرار مباشرة
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

function OrdersList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<TOrder | null>(null);
  const [printCopyLabel, setPrintCopyLabel] = useState<string | undefined>(undefined);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedOrderForAck, setSelectedOrderForAck] = useState<TOrder | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<TOrder["order_type"] | "all">("all");

  // Data fetching
  const { data, isPending } = useQuery(
    useGetOrdersQueryOptions(page, per_page)
  );

  const displayedOrders = useMemo(() => {
    if (!data?.data) return [];
    if (orderTypeFilter === "all") return data.data;
    return data.data.filter((order) => order.order_type === orderTypeFilter);
  }, [data?.data, orderTypeFilter]);

  // Export Mutation
  const { mutate: exportOrdersToCSV, isPending: isExporting } = useMutation(
    useExportOrdersToCSVMutationOptions()
  );

  // Modal handlers
  const handleOpenView = (order: TOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  // Navigation handlers
  const handleEditOrder = (order: TOrder) => {
    navigate("/orders/update-clothes-in-order", { state: { order } });
  };

  const handleViewOrder = (order: TOrder) => {
    navigate(`/orders/${order.id}`);
  };

  const handlePrintInvoice = (order: TOrder, copyLabel?: string) => {
    setSelectedOrderForPrint(order);
    setPrintCopyLabel(copyLabel);
    setPrintModalOpen(true);
  };

  const handlePrintAck = (order: TOrder) => {
    setSelectedOrderForAck(order);
    setAckModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportOrdersToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الطلبات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الطلبات. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl">
      <Card className="max-w-screen-lg 2xl:max-w-screen-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>عرض وإدارة جميع الطلبات في النظام</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
              <Button
                type="button"
                variant={orderTypeFilter === "all" ? "default" : "ghost"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => setOrderTypeFilter("all")}
              >
                الكل
              </Button>
              <Button
                type="button"
                variant={orderTypeFilter === "rent" ? "default" : "ghost"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => setOrderTypeFilter("rent")}
              >
                إيجار
              </Button>
              <Button
                type="button"
                variant={orderTypeFilter === "buy" ? "default" : "ghost"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => setOrderTypeFilter("buy")}
              >
                بيع
              </Button>
              <Button
                type="button"
                variant={orderTypeFilter === "tailoring" ? "default" : "ghost"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => setOrderTypeFilter("tailoring")}
              >
                تفصيل
              </Button>

            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="ml-2 h-4 w-4" />
              {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">#</TableHead>
                  <TableHead className="text-right w-64">بيانات العميل</TableHead>
                  <TableHead className="text-right w-64">التواريخ / الإجراءات</TableHead>
                  <TableHead className="text-right w-[32%]">الأصناف / المبالغ / الحالة</TableHead>
                  <TableHead className="text-center w-40">الموظف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <OrdersTableSkeleton rows={5} />
                ) : displayedOrders.length > 0 ? (
                  displayedOrders.map((order) => (
                    <TableRow key={order.id} className="align-top">
                      {/* العمود 1: رقم الطلب */}
                      <TableCell
                        className="font-medium text-center cursor-pointer align-top pt-4"
                        onClick={() => handleViewOrder(order)}
                      >
                        <p className="underline text-sm">#{order.id}</p>
                      </TableCell>

                      {/* العمود 2: بيانات العميل */}
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1 text-sm text-right">
                          <p className="font-semibold text-gray-900">
                            الاسم:{" "}
                            <span className="font-normal text-gray-700">
                              {order.client?.name ?? "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            الرقم القومي:{" "}
                            <span className="font-normal text-gray-700">
                              {order.client?.national_id ?? "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            الهاتف:{" "}
                            <span className="font-normal text-gray-700">
                              {order.client?.phones && order.client.phones.length > 0
                                ? order.client.phones[0]?.phone
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            هاتف آخر:{" "}
                            <span className="font-normal text-gray-700">
                              {order.client?.phones && order.client.phones.length > 1
                                ? order.client.phones[1]?.phone
                                : "-"}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      {/* العمود 3: التواريخ + الأكشن */}
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1 text-sm text-right">
                          <p className="font-semibold text-gray-900">
                            تاريخ الفاتورة:{" "}
                            <span className="font-normal text-gray-700">
                              {formatDate(order.created_at)}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            تأجير:{" "}
                            <span className="font-normal text-gray-700">
                              {order.visit_datetime
                                ? formatDate(order.visit_datetime)
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            تسليم:{" "}
                            <span className="font-normal text-gray-700">
                              {order.delivery_date
                                ? formatDate(order.delivery_date)
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            استرجاع:{" "}
                            <span className="font-normal text-gray-700">
                              {order.occasion_datetime
                                ? formatDate(order.occasion_datetime)
                                : "-"}
                            </span>
                          </p>
                          <div className="mt-2">
                            <TooltipProvider delayDuration={300}>
                              <div className="flex flex-wrap items-center gap-1 justify-start">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() => handleOpenView(order)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    عرض التفاصيل
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() => handleEditOrder(order)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    تعديل
                                  </TooltipContent>
                                </Tooltip>
                                {/* نسخة إدارة */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() => handlePrintInvoice(order)}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    نسخة إدارة
                                  </TooltipContent>
                                </Tooltip>
                                {/* نسخة عميل */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() =>
                                        handlePrintInvoice(order, "نسخة العميل")
                                      }
                                    >
                                      <FileUser className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    نسخة عميل
                                  </TooltipContent>
                                </Tooltip>
                                {/* إقرار استلام */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={() => handlePrintAck(order)}
                                    >
                                      <FileCheck className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    إقرار استلام
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>
                        </div>
                      </TableCell>

                      {/* العمود 4: الأصناف + المبالغ + حالة الطلب */}
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-2 text-sm text-right">
                          <p className="font-semibold text-gray-900">
                            الأصناف:
                            <span className="font-normal text-gray-700">
                              {" "}
                              {order.items && order.items.length > 0
                                ? order.items
                                  .map((item) => item.name)
                                  .filter(Boolean)
                                  .join("، ")
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            السعر:{" "}
                            <span className="font-medium">
                              {order.total_price} ج.م
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            المدفوع:{" "}
                            <span className="font-medium text-green-700">
                              {order.paid} ج.م
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            المتبقي:{" "}
                            <span className="font-medium text-blue-700">
                              {order.remaining} ج.م
                            </span>
                          </p>
                          <div className="mt-1">
                            <Badge
                              variant="secondary"
                              className={getStatusVariant(order.status)}
                            >
                              {getStatusLabel(order.status)}
                            </Badge>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({getOrderTypeLabel(order.order_type)})
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* العمود 5: الموظف */}
                      <TableCell className="align-top text-center">
                        <div className="flex flex-col items-center justify-center gap-1 text-sm">
                          <span className="font-medium text-gray-900">
                            {order.employee_name ?? "-"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      لا توجد طلبات مطابقة للفلاتر الحالية.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي الطلبات"
            totalElements={data?.total || 0}
            totalPages={data?.total_pages || 1}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />

      {/* Invoice Print Modal */}
      <OrderInvoicePrintModal
        order={selectedOrderForPrint}
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        copyLabel={printCopyLabel}
      />

      {/* Receipt Acknowledgment Print Modal */}
      <OrderReceiptAckPrintModal
        order={selectedOrderForAck}
        open={ackModalOpen}
        onOpenChange={setAckModalOpen}
      />
    </div>
  );
}

export default OrdersList;
