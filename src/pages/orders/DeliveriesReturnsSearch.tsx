import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import {
  Download,
  Eye,
  Pencil,
  FileText,
  FileUser,
  FileCheck,
  Filter,
  CreditCard,
  Trash2,
  Ban,
  CheckCircle,
  ShieldPlus,
} from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CustomPagination from "@/components/custom/CustomPagination";
import {
  useExportOrdersToCSVMutationOptions,
  useGetOrdersQueryOptions,
  useCancelOrderMutationOptions,
  useDeleteOrderMutationOptions,
  useDeliverOrderMutationOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate, toEnglishNumerals } from "@/utils/formatDate";
import { formatPhone } from "@/utils/formatPhone";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderInvoicePrintModal } from "./OrderInvoicePrintModal";
import { OrderReceiptAckPrintModal } from "./OrderReceiptAckPrintModal";
import { CreateCustodyModal } from "./CreateCustodyModal";
import { CreatePaymentModal } from "./CreatePaymentModal";
import {
  getOrderCurrencyInfo,
  getOrderTypeLabel,
} from "@/api/v2/orders/order.utils";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { ClientsSelect } from "@/components/custom/ClientsSelect";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import useDebounce from "@/hooks/useDebounce";

const ordersFilterSchema = z.object({
  order_id: z.string().optional(),
  client_id: z.string().optional(),
  employee_id: z.string().optional(),
  cloth_name: z.string().optional(),
  cloth_code: z.string().optional(),
  visit_date_from: z.string().optional(),
  visit_date_to: z.string().optional(),
  delivery_date_from: z.string().optional(),
  delivery_date_to: z.string().optional(),
  return_date_from: z.string().optional(),
  return_date_to: z.string().optional(),
});

type OrdersFilterFormValues = z.infer<typeof ordersFilterSchema>;

const FILTER_DEBOUNCE_MS = 500;

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
    finished: "منتهي",
    canceled: "ملغي",
    delivered: "تم تسليم الطلب",
  };
  return labels[status] || status;
};

function DeliveriesReturnsSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;
  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<OrdersFilterFormValues>({
    resolver: zodResolver(ordersFilterSchema),
    defaultValues: {
      order_id: "",
      client_id: "",
      employee_id: "",
      cloth_name: "",
      cloth_code: "",
      visit_date_from: "",
      visit_date_to: "",
      delivery_date_from: "",
      delivery_date_to: "",
      return_date_from: "",
      return_date_to: "",
    },
  });

  const formValues = form.watch();
  const debouncedFormValues = useDebounce({
    value: formValues,
    delay: FILTER_DEBOUNCE_MS,
  });

  const filters = useMemo(() => {
    const v = debouncedFormValues;
    return {
      order_id: v.order_id && v.order_id.trim() !== "" ? v.order_id : undefined,
      client_id: v.client_id && v.client_id.trim() !== "" ? v.client_id : undefined,
      employee_id: v.employee_id && v.employee_id.trim() !== "" ? v.employee_id : undefined,
      cloth_name: v.cloth_name && v.cloth_name.trim() !== "" ? v.cloth_name : undefined,
      cloth_code: v.cloth_code && v.cloth_code.trim() !== "" ? v.cloth_code : undefined,
      visit_date_from: v.visit_date_from || undefined,
      visit_date_to: v.visit_date_to || undefined,
      delivery_date_from: v.delivery_date_from || undefined,
      delivery_date_to: v.delivery_date_to || undefined,
      return_date_from: v.return_date_from || undefined,
      return_date_to: v.return_date_to || undefined,
    };
  }, [debouncedFormValues]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<TOrder | null>(null);
  const [printCopyLabel, setPrintCopyLabel] = useState<string | undefined>(undefined);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedOrderForAck, setSelectedOrderForAck] = useState<TOrder | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<TOrder["order_type"] | "all">("all");

  const { data, isPending, refetch } = useQuery(
    useGetOrdersQueryOptions(page, per_page, filters)
  );

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToAction, setOrderToAction] = useState<TOrder | null>(null);
  const [custodyModalOrder, setCustodyModalOrder] = useState<TOrder | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<TOrder | null>(null);

  const displayedOrders = useMemo(() => {
    if (!data?.data) return [];
    if (orderTypeFilter === "all") return data.data;
    return data.data.filter((order) => order.order_type === orderTypeFilter);
  }, [data?.data, orderTypeFilter]);

  const { mutate: exportOrdersToCSV, isPending: isExporting } = useMutation(
    useExportOrdersToCSVMutationOptions()
  );

  const handleOpenView = useCallback((order: TOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }, []);

  const handleEditOrder = useCallback(
    (order: TOrder) => navigate("/orders/update-clothes-in-order", { state: { order } }),
    [navigate],
  );

  const handleViewOrder = useCallback(
    (order: TOrder) => navigate(`/orders/${order.id}`),
    [navigate],
  );

  const handlePrintInvoice = useCallback((order: TOrder, copyLabel?: string) => {
    setSelectedOrderForPrint(order);
    setPrintCopyLabel(copyLabel);
    setPrintModalOpen(true);
  }, []);

  const handlePrintAck = useCallback((order: TOrder) => {
    setSelectedOrderForAck(order);
    setAckModalOpen(true);
  }, []);

  const { mutate: deliverOrder, isPending: isDelivering } = useMutation(
    useDeliverOrderMutationOptions()
  );
  const { mutate: cancelOrder, isPending: isCanceling } = useMutation(
    useCancelOrderMutationOptions()
  );
  const { mutate: deleteOrder, isPending: isDeleting } = useMutation(
    useDeleteOrderMutationOptions()
  );

  const handleMarkAsDelivered = (order: TOrder) => {
    deliverOrder(order.id, {
      onSuccess: () => {
        toast.success(`تم تسليم الطلب #${order.id} بنجاح`);
        refetch();
      },
      onError: (error: { message?: string }) => {
        toast.error("خطأ أثناء تسليم الطلب", { description: error.message });
      },
    });
  };

  const handleAddPayment = useCallback((order: TOrder) => {
    setPaymentModalOrder(order);
  }, []);

  const handleOpenCancelDialog = useCallback((order: TOrder) => {
    setOrderToAction(order);
    setShowCancelDialog(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((order: TOrder) => {
    setOrderToAction(order);
    setShowDeleteDialog(true);
  }, []);

  const handleCancelOrder = () => {
    if (!orderToAction) return;
    cancelOrder(orderToAction.id, {
      onSuccess: () => {
        toast.success(`تم إلغاء الطلب #${orderToAction.id} بنجاح`);
        setShowCancelDialog(false);
        setOrderToAction(null);
        refetch();
      },
      onError: (error: { message?: string }) => {
        toast.error("خطأ أثناء إلغاء الطلب", { description: error.message });
      },
    });
  };

  const handleDeleteOrder = () => {
    if (!orderToAction) return;
    deleteOrder(orderToAction.id, {
      onSuccess: () => {
        toast.success(`تم حذف الطلب #${orderToAction.id} بنجاح`);
        setShowDeleteDialog(false);
        setOrderToAction(null);
        refetch();
      },
      onError: (error: { message?: string }) => {
        toast.error("خطأ أثناء حذف الطلب", { description: error.message });
      },
    });
  };

  const isActive = (o: TOrder) =>
    o.status !== "canceled" && o.status !== "delivered";
  const canMarkAsDelivered = (o: TOrder) => isActive(o);
  const canCancelOrder = (o: TOrder) => isActive(o);
  const canEditOrder = (o: TOrder) => isActive(o);
  const canPrintOrder = (o: TOrder) => o.status !== "canceled";
  const canAddPayment = (o: TOrder) =>
    o.status !== "paid" && o.status !== "finished" && o.status !== "canceled";
  const canCreateCustodyForOrder = (o: TOrder) =>
    o.order_type === "rent" && isActive(o);
  const canDeleteOrder = (o: TOrder) =>
    o.status === "canceled" || o.status === "created";

  const handleExport = () => {
    exportOrdersToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `deliveries-returns-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير البيانات بنجاح");
      },
      onError: (error: { message?: string }) => {
        toast.error("خطأ أثناء التصدير. الرجاء المحاولة مرة أخرى.", {
          description: error?.message,
        });
      },
    });
  };

  return (
    <div dir="rtl">
      <Card className="max-w-5xl 2xl:max-w-screen-2xl mx-auto">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle>بحث التسليمات والارجاعات</CardTitle>
            <CardDescription>
              البحث في التسليمات والارجاعات مع عرض التواريخ والإجراءات بشكل منفصل
            </CardDescription>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1 shrink-0"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="h-4 w-4 shrink-0" />
              {showFilters ? "إخفاء الفلاتر" : "الفلاتر"}
            </Button>
            <div className="inline-flex rounded-md border bg-muted/40 p-0.5 shrink-0">
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
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="shrink-0"
            >
              <Download className="h-4 w-4 shrink-0" />
              {isExporting ? "جاري التصدير..." : "تصدير"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="order_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الفاتورة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="مثال: 1024"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العميل</FormLabel>
                          <FormControl>
                            <ClientsSelect
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموظف</FormLabel>
                          <FormControl>
                            <EmployeesSelect
                              params={{ per_page: 20 }}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              placeholder="اختر الموظف..."
                              searchPlaceholder="ابحث عن موظف..."
                              allowClear
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cloth_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصنف</FormLabel>
                          <FormControl>
                            <Input placeholder="ابحث باسم الصنف" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cloth_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كود الصنف</FormLabel>
                          <FormControl>
                            <Input placeholder="ابحث بكود الصنف" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visit_date_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ التأجير من</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visit_date_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ التأجير إلى</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_date_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ التسليم من</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_date_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ التسليم إلى</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="return_date_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الاسترجاع من</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="return_date_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الاسترجاع إلى</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        form.reset({
                          order_id: "",
                          client_id: "",
                          employee_id: "",
                          cloth_name: "",
                          cloth_code: "",
                          visit_date_from: "",
                          visit_date_to: "",
                          delivery_date_from: "",
                          delivery_date_to: "",
                          return_date_from: "",
                          return_date_to: "",
                        })
                      }
                    >
                      مسح الفلاتر
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">#</TableHead>
                  <TableHead className="text-right w-64">بيانات العميل</TableHead>
                  <TableHead className="text-right w-48">التواريخ</TableHead>
                  <TableHead className="text-right w-[28%]">الأصناف / المبالغ / الحالة</TableHead>
                  <TableHead className="text-center w-32">الموظف</TableHead>
                  <TableHead className="text-center min-w-[280px] w-[280px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <OrdersTableSkeleton rows={5} />
                ) : displayedOrders.length > 0 ? (
                  displayedOrders.map((order) => (
                    <TableRow key={order.id} className="align-top">
                      {/* Column 1: Order number */}
                      <TableCell
                        className="font-medium text-center cursor-pointer align-top pt-4"
                        onClick={() => handleViewOrder(order)}
                      >
                        <p className="underline text-sm">
                          <span dir="ltr" className="tabular-nums">
                            #{toEnglishNumerals(order.id)}
                          </span>
                        </p>
                      </TableCell>

                      {/* Column 2: Client data */}
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
                            <span className="font-normal text-gray-700" dir="ltr">
                              {toEnglishNumerals(order.client?.national_id) || "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            الهاتف:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {order.client?.phones && order.client.phones.length > 0
                                ? formatPhone(order.client.phones[0]?.phone, "-")
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            هاتف الواتساب:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {order.client?.phones && order.client.phones.length > 1
                                ? formatPhone(order.client.phones[1]?.phone, "-")
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            العنوان:{" "}
                            <span className="font-normal text-gray-700">
                              {order.client?.address
                                ? `${order.client.address.country_name ?? ""}${order.client.address.city_name ? ` - ${order.client.address.city_name}` : ""}${order.client.address.street ? ` - ${order.client.address.street}` : ""}${order.client.address.building ? ` - ${order.client.address.building}` : ""}`
                                : "-"}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Column 3: Dates only */}
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1 text-sm text-right">
                          <p className="font-semibold text-gray-900">
                            تاريخ الفاتورة:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {toEnglishNumerals(formatDate(order.created_at)) || "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            تسليم:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {order.visit_datetime
                                ? toEnglishNumerals(formatDate(order.visit_datetime))
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            الفرح:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {order.occasion_datetime
                                ? toEnglishNumerals(formatDate(order.occasion_datetime))
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            استرجاع:{" "}
                            <span className="font-normal text-gray-700" dir="ltr">
                              {order.delivery_date
                                ? toEnglishNumerals(formatDate(order.delivery_date))
                                : "-"}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Column 4: Items + Amounts + Order status */}
                      <TableCell className="align-top">
                        {(() => {
                          const { currency_symbol } = getOrderCurrencyInfo(order as any);
                          const totalPrice = Number(order.total_price ?? 0);
                          return (
                            <div className="flex flex-col gap-2 text-sm text-right">
                              <p className="font-semibold text-gray-900">
                                الأصناف:
                                <span className="font-normal text-gray-700">
                                  {" "}
                                  {order.items && order.items.length > 0
                                    ? order.items
                                        .map((item) =>
                                          item.code ?? (item as { name?: string }).name
                                        )
                                        .filter(Boolean)
                                        .join("، ")
                                    : "-"}
                                </span>
                              </p>
                              <p className="font-semibold text-gray-900">
                                السعر (شامل الضريبة):{" "}
                                <span className="font-medium tabular-nums" dir="ltr">
                                  {totalPrice.toLocaleString()} {currency_symbol}
                                </span>
                              </p>
                              <p className="font-semibold text-gray-900">
                                المدفوع:{" "}
                                <span className="font-medium text-green-700 tabular-nums" dir="ltr">
                                  {toEnglishNumerals(order.paid)} {currency_symbol}
                                </span>
                              </p>
                              <p className="font-semibold text-gray-900">
                                المتبقي:{" "}
                                <span className="font-medium text-blue-700 tabular-nums" dir="ltr">
                                  {toEnglishNumerals(order.remaining)} {currency_symbol}
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
                          );
                        })()}
                      </TableCell>

                      {/* Column 5: Employee */}
                      <TableCell className="align-top text-center">
                        <div className="flex flex-col items-center justify-center gap-1 text-sm">
                          <OrderEmployeeName
                            order={order}
                            className="font-medium text-gray-900"
                          />
                        </div>
                      </TableCell>

                      {/* Column 6: Actions only */}
                      <TableCell className="align-top min-w-[280px] text-center">
                        <TooltipProvider delayDuration={300}>
                          <div className="inline-grid grid-cols-[repeat(4,2rem)] gap-0 place-items-center mx-auto">
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
                              <TooltipContent side="top">عرض التفاصيل</TooltipContent>
                            </Tooltip>
                            {canEditOrder(order) && (
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
                                <TooltipContent side="top">تعديل</TooltipContent>
                              </Tooltip>
                            )}
                            {canPrintOrder(order) && (
                              <>
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
                                  <TooltipContent side="top">نسخة ادارية</TooltipContent>
                                </Tooltip>
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
                                  <TooltipContent side="top">نسخة العميل</TooltipContent>
                                </Tooltip>
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
                                  <TooltipContent side="top">إقرار استلام</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                            {canMarkAsDelivered(order) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleMarkAsDelivered(order)}
                                    disabled={isDelivering}
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">تعليم كـ تم التسليم</TooltipContent>
                              </Tooltip>
                            )}
                            {canAddPayment(order) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddPayment(order);
                                    }}
                                  >
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">إضافة دفعة</TooltipContent>
                              </Tooltip>
                            )}
                            {canCreateCustodyForOrder(order) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => setCustodyModalOrder(order)}
                                  >
                                    <ShieldPlus className="h-4 w-4 text-purple-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">إنشاء ضمان</TooltipContent>
                              </Tooltip>
                            )}
                            {canCancelOrder(order) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleOpenCancelDialog(order)}
                                  >
                                    <Ban className="h-4 w-4 text-yellow-700" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">إلغاء الحجز</TooltipContent>
                              </Tooltip>
                            )}
                            {canDeleteOrder(order) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleOpenDeleteDialog(order)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">حذف الطلب</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد نتائج مطابقة للفلاتر الحالية.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي النتائج"
            totalElements={data?.total || 0}
            totalPages={data?.total_pages || 1}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      <OrderDetailsModal
        order={selectedOrder}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />

      <OrderInvoicePrintModal
        order={selectedOrderForPrint}
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        copyLabel={printCopyLabel}
      />

      <OrderReceiptAckPrintModal
        order={selectedOrderForAck}
        open={ackModalOpen}
        onOpenChange={setAckModalOpen}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إلغاء الطلب #{orderToAction?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إلغاء هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.
              {Number(orderToAction?.paid ?? 0) > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  ⚠️ هذا الطلب لديه مدفوعات. تأكد من معالجة المدفوعات قبل الإلغاء.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCanceling}
            >
              {isCanceling ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب #{orderToAction?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              ⚠️ هذا الإجراء لا يمكن التراجع عنه.
              <br />
              سيتم حذف الطلب بشكل نهائي من قاعدة البيانات.
              {Number(orderToAction?.paid ?? 0) > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  ⚠️ تنبيه: هذا الطلب لديه مدفوعات. الحذف قد يؤثر على السجلات المالية.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {custodyModalOrder && (
        <CreateCustodyModal
          open={!!custodyModalOrder}
          onOpenChange={(open) => !open && setCustodyModalOrder(null)}
          orderId={custodyModalOrder.id}
          onSuccess={() => {
            refetch();
            setCustodyModalOrder(null);
          }}
        />
      )}

      {paymentModalOrder && (
        <CreatePaymentModal
          open={!!paymentModalOrder}
          onOpenChange={(open) => {
            if (!open) setPaymentModalOrder(null);
          }}
          order={paymentModalOrder}
          onSuccess={() => {
            refetch();
            setPaymentModalOrder(null);
          }}
        />
      )}
    </div>
  );
}

export default DeliveriesReturnsSearch;
