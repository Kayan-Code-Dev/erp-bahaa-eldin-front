import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import { Download, Eye, Pencil, FileText, FileUser, FileCheck, Filter } from "lucide-react";
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
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate } from "@/utils/formatDate";
import { formatPhone } from "@/utils/formatPhone";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderInvoicePrintModal } from "./OrderInvoicePrintModal";
import { OrderReceiptAckPrintModal } from "./OrderReceiptAckPrintModal";
import { getOrderTypeLabel } from "@/api/v2/orders/order.utils";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
// dropdown menu imports removed after replacing menu with direct buttons
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
  invoice_date_from: z.string().optional(),
  invoice_date_to: z.string().optional(),
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
  const [showFilters, setShowFilters] = useState(false);

  // Filters form
  const form = useForm<OrdersFilterFormValues>({
    resolver: zodResolver(ordersFilterSchema),
    defaultValues: {
      order_id: "",
      client_id: "",
      employee_id: "",
      cloth_name: "",
      cloth_code: "",
      invoice_date_from: "",
      invoice_date_to: "",
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
      invoice_date_from: v.invoice_date_from || undefined,
      invoice_date_to: v.invoice_date_to || undefined,
      visit_date_from: v.visit_date_from || undefined,
      visit_date_to: v.visit_date_to || undefined,
      delivery_date_from: v.delivery_date_from || undefined,
      delivery_date_to: v.delivery_date_to || undefined,
      return_date_from: v.return_date_from || undefined,
      return_date_to: v.return_date_to || undefined,
    };
  }, [debouncedFormValues]);

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
    useGetOrdersQueryOptions(page, per_page, filters)
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="ml-1 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "الفلاتر"}
            </Button>
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
          {/* Filters */}
          {showFilters && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {/* Invoice number */}
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

                    {/* Client */}
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

                    {/* Employee */}
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

                    {/* Item name */}
                    <FormField
                      control={form.control}
                      name="cloth_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصنف</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ابحث باسم الصنف"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item code (cloth_code) */}
                    <FormField
                      control={form.control}
                      name="cloth_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كود الصنف</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ابحث بكود الصنف"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Invoice date from / to */}
                    <FormField
                      control={form.control}
                      name="invoice_date_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الفاتورة من</FormLabel>
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
                      name="invoice_date_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الفاتورة إلى</FormLabel>
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

                    {/* Rental date from / to */}
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

                    {/* Delivery date from / to */}
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

                    {/* Return date from / to */}
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
                          invoice_date_from: "",
                          invoice_date_to: "",
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
                      {/* Column 1: Order number */}
                      <TableCell
                        className="font-medium text-center cursor-pointer align-top pt-4"
                        onClick={() => handleViewOrder(order)}
                      >
                        <p className="underline text-sm">#{order.id}</p>
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
                            <span className="font-normal text-gray-700">
                              {order.client?.national_id ?? "-"}
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
                                ? `${order.client.address.country_name ?? ""}${order.client.address.city_name
                                  ? ` - ${order.client.address.city_name}`
                                  : ""
                                }${order.client.address.street
                                  ? ` - ${order.client.address.street}`
                                  : ""
                                }${order.client.address.building
                                  ? ` - ${order.client.address.building}`
                                  : ""
                                }`
                                : "-"}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Column 3: Dates + Actions */}
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1 text-sm text-right">
                          <p className="font-semibold text-gray-900">
                            تاريخ الفاتورة:{" "}
                            <span className="font-normal text-gray-700">
                              {formatDate(order.created_at)}
                            </span>
                          </p>

                          <p className="font-semibold text-gray-900">
                            تسليم:{" "}
                            <span className="font-normal text-gray-700">
                              {order.visit_datetime
                                ? formatDate(order.visit_datetime)
                                : "-"}

                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            الفرح:{" "}
                            <span className="font-normal text-gray-700">

                              {order.occasion_datetime
                                ? formatDate(order.occasion_datetime)
                                : "-"}
                            </span>
                          </p>
                          <p className="font-semibold text-gray-900">
                            استرجاع:{" "}
                            <span className="font-normal text-gray-700">
                              {order.delivery_date
                                ? formatDate(order.delivery_date)
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
                                {/* Management copy */}
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
                                {/* Client copy */}
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
                                {/* Receipt acknowledgment */}
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

                      {/* Column 4: Items + Amounts + Order status */}
                      <TableCell className="align-top">
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

                      {/* Column 5: Employee */}
                      <TableCell className="align-top text-center">
                        <div className="flex flex-col items-center justify-center gap-1 text-sm">
                          <OrderEmployeeName
                            order={order}
                            className="font-medium text-gray-900"
                          />
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

export { OrdersList };
export default OrdersList;
