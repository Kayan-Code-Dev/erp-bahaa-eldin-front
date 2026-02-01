import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import { ChevronDown, Download, Eye, Pencil, Printer } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Data fetching
  const { data, isPending } = useQuery(
    useGetOrdersQueryOptions(page, per_page)
  );

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
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">رقم الطلب</TableHead>
                  <TableHead className="text-center">العميل</TableHead>
                  <TableHead className="text-center">السعر الإجمالي</TableHead>
                  <TableHead className="text-center">المدفوع</TableHead>
                  <TableHead className="text-center">المتبقي</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">نوع الطلب</TableHead>
                  <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <OrdersTableSkeleton rows={5} />
                ) : data && data.data.length > 0 ? (
                  data.data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell
                        className="font-medium text-center cursor-pointer"
                        onClick={() => handleViewOrder(order)}
                      >
                        <p className="underline">#{order.id}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {order.client.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.total_price} ج.م
                      </TableCell>
                      <TableCell className="text-center">
                        {order.paid} ج.م
                      </TableCell>
                      <TableCell className="text-center">
                        {order.remaining} ج.م
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={getStatusVariant(order.status)}
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getOrderTypeLabel(order.order_type)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider delayDuration={300}>
                          <div className="flex items-center gap-1 justify-center">
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
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1.5 shrink-0 px-2.5"
                                    >
                                      <Printer className="h-4 w-4" />
                                      طباعة
                                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  طباعة الفاتورة أو الإقرار
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                                  <Printer className="ml-2 h-4 w-4" />
                                  طباعة الفاتورة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintInvoice(order, "نسخة العميل")}>
                                  <Printer className="ml-2 h-4 w-4" />
                                  نسخة عميل
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintAck(order)}>
                                  <Printer className="ml-2 h-4 w-4" />
                                  إقرار استلام
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد طلبات لعرضها.
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
