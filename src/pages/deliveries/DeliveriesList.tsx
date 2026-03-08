import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import {
  Download,
  Eye,
  Filter,
  X,
  CreditCard,
  Trash2,
  Ban,
  CheckCircle,
  Edit,
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
// dropdown menu imports removed after replacing menu with direct buttons
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
import CustomPagination from "@/components/custom/CustomPagination";
import {
  useExportOrdersToCSVMutationOptions,
  useGetOrdersQueryOptions,
  useCancelOrderMutationOptions,
  useDeleteOrderMutationOptions,
  useDeliverOrderMutationOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate } from "@/utils/formatDate";
import { formatPhone } from "@/utils/formatPhone";
import { OrdersTableSkeleton } from "@/pages/orders/OrdersTableSkeleton";
import { OrderDetailsModal } from "@/pages/orders/OrderDetailsModal";
import { CreateCustodyModal } from "@/pages/orders/CreateCustodyModal";
import { CreatePaymentModal } from "@/pages/orders/CreatePaymentModal";
import { getOrderTypeLabel, getStatusVariant, getStatusLabel, getItemListDisplay } from "@/api/v2/orders/order.utils";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  parseFilenameFromContentDisposition,
  downloadBlob,
} from "@/api/api.utils";
import {
  DEFAULT_PER_PAGE,
  FILTER_DEBOUNCE_MS,
} from "./constants";
import {
  deliveriesFilterSchema,
  type DeliveriesFilterFormValues,
} from "./deliveriesFilter.schema";

function DeliveriesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

  const form = useForm<DeliveriesFilterFormValues>({
    resolver: zodResolver(deliveriesFilterSchema),
    defaultValues: {
      order_id: searchParams.get("order_id") || "",
      client_id: searchParams.get("client_id") || "",
      employee_id: searchParams.get("employee_id") || "",
      cloth_name: searchParams.get("cloth_name") || "",
      cloth_code: searchParams.get("cloth_code") || "",
      visit_date_from: searchParams.get("visit_date_from") || "",
      visit_date_to: searchParams.get("visit_date_to") || "",
      delivery_date_from: searchParams.get("delivery_date_from") || "",
      delivery_date_to: searchParams.get("delivery_date_to") || "",
      return_date_from: searchParams.get("return_date_from") || "",
      return_date_to: searchParams.get("return_date_to") || "",
    },
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  
  // States for dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToAction, setOrderToAction] = useState<TOrder | null>(null);
  const [custodyModalOrder, setCustodyModalOrder] = useState<TOrder | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<TOrder | null>(null);

  const formValues = form.watch();
  const debouncedFormValues = useDebounce({
    value: formValues,
    delay: FILTER_DEBOUNCE_MS,
  });

  const prevFormValuesRef = useRef<DeliveriesFilterFormValues | null>(null);
  const isInitialMount = useRef(true);
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevFormValuesRef.current = formValues;
      return;
    }

    const prevValues = prevFormValuesRef.current;
    if (prevValues !== null) {
      const hasChanged = Object.keys(formValues).some(
        (key) =>
          formValues[key as keyof DeliveriesFilterFormValues] !==
          prevValues[key as keyof DeliveriesFilterFormValues]
      );
      if (hasChanged && page !== 1) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", "1");
          return newParams;
        });
      }
    }
    prevFormValuesRef.current = formValues;
  }, [formValues, page, setSearchParams]);

  const headerSearch = searchParams.get("search") || undefined;

  const filters = useMemo(() => {
    const values = debouncedFormValues;
    return {
      order_id: values.order_id?.trim() || undefined,
      client_id: values.client_id?.trim() || undefined,
      employee_id: values.employee_id?.trim() || undefined,
      cloth_name: values.cloth_name?.trim() || undefined,
      cloth_code: values.cloth_code?.trim() || undefined,
      visit_date_from: values.visit_date_from || undefined,
      visit_date_to: values.visit_date_to || undefined,
      delivery_date_from: values.delivery_date_from || undefined,
      delivery_date_to: values.delivery_date_to || undefined,
      return_date_from: values.return_date_from || undefined,
      return_date_to: values.return_date_to || undefined,
      search: headerSearch?.trim() || undefined,
    };
  }, [debouncedFormValues, headerSearch]);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams();
          next.set("page", prev.get("page") || "1");
          next.set("per_page", prev.get("per_page") || per_page.toString());
          return next;
        },
        { replace: true }
      );
      return;
    }
    const params = new URLSearchParams(searchParams);
    if (debouncedFormValues.order_id?.trim()) params.set("order_id", debouncedFormValues.order_id.trim());
    else params.delete("order_id");
    if (debouncedFormValues.client_id?.trim()) params.set("client_id", debouncedFormValues.client_id.trim());
    else params.delete("client_id");
    if (debouncedFormValues.employee_id?.trim()) params.set("employee_id", debouncedFormValues.employee_id.trim());
    else params.delete("employee_id");
    if (debouncedFormValues.cloth_name?.trim()) params.set("cloth_name", debouncedFormValues.cloth_name.trim());
    else params.delete("cloth_name");
    if (debouncedFormValues.cloth_code?.trim()) params.set("cloth_code", debouncedFormValues.cloth_code.trim());
    else params.delete("cloth_code");
    if (debouncedFormValues.visit_date_from) params.set("visit_date_from", debouncedFormValues.visit_date_from);
    else params.delete("visit_date_from");
    if (debouncedFormValues.visit_date_to) params.set("visit_date_to", debouncedFormValues.visit_date_to);
    else params.delete("visit_date_to");
    if (debouncedFormValues.delivery_date_from) params.set("delivery_date_from", debouncedFormValues.delivery_date_from);
    else params.delete("delivery_date_from");
    if (debouncedFormValues.delivery_date_to) params.set("delivery_date_to", debouncedFormValues.delivery_date_to);
    else params.delete("delivery_date_to");
    if (debouncedFormValues.return_date_from) params.set("return_date_from", debouncedFormValues.return_date_from);
    else params.delete("return_date_from");
    if (debouncedFormValues.return_date_to) params.set("return_date_to", debouncedFormValues.return_date_to);
    else params.delete("return_date_to");
    if (headerSearch) params.set("search", headerSearch);
    else params.delete("search");
    params.set("page", page.toString());
    params.set("per_page", per_page.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedFormValues, headerSearch, page, per_page, searchParams, setSearchParams]);

  // Data fetching
  const { data, isPending, isError, error, refetch } = useQuery(
    useGetOrdersQueryOptions(page, per_page, filters)
  );

  const [orderTypeFilter, setOrderTypeFilter] = useState<TOrder["order_type"] | "all">("all");

  const displayedOrders = useMemo(() => {
    if (!data?.data) return [];
    const base = data.data.filter(
      (order) =>
        order.status === "created" ||
        order.status === "paid" ||
        order.status === "partially_paid"
    );
    if (orderTypeFilter === "all") return base;
    return base.filter((order) => order.order_type === orderTypeFilter);
  }, [data?.data, orderTypeFilter]);

  // Export Mutation
  const { mutate: exportOrdersToCSV, isPending: isExporting } = useMutation(
    useExportOrdersToCSVMutationOptions()
  );

  // Cancel Order Mutation
  const { mutate: cancelOrder, isPending: isCanceling } = useMutation(
    useCancelOrderMutationOptions()
  );

  // Delete Order Mutation
  const { mutate: deleteOrder, isPending: isDeleting } = useMutation(
    useDeleteOrderMutationOptions()
  );

  // Modal handlers
  const handleOpenView = (order: TOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleViewOrder = (order: TOrder) => {
    navigate(`/orders/${order.id}`);
  };

  const { mutate: deliverOrder, isPending: isDelivering } = useMutation(
    useDeliverOrderMutationOptions()
  );

  const handleMarkAsDelivered = (order: TOrder) => {
    deliverOrder(order.id, {
      onSuccess: () => {
        toast.success(`تم تسليم الطلب #${order.id} بنجاح`);
        refetch();
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تسليم الطلب", { description: error?.message });
      },
    });
  };

  const handleAddPayment = (order: TOrder) => {
    setPaymentModalOrder(order);
  };

  const handleEditOrder = (order: TOrder) => {
    navigate("/orders/update-clothes-in-order", { state: { order } });
  };

  const handleOpenCancelDialog = (order: TOrder) => {
    setOrderToAction(order);
    setShowCancelDialog(true);
  };

  const handleOpenDeleteDialog = (order: TOrder) => {
    setOrderToAction(order);
    setShowDeleteDialog(true);
  };

  const handleCancelOrder = () => {
    if (!orderToAction) return;
    
    cancelOrder(orderToAction.id, {
      onSuccess: () => {
        toast.success(`تم إلغاء الطلب #${orderToAction.id} بنجاح`);
        setShowCancelDialog(false);
        setOrderToAction(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء إلغاء الطلب", {
          description: error.message,
        });
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
      onError: (error: any) => {
        toast.error("خطأ أثناء حذف الطلب", {
          description: error.message,
        });
      },
    });
  };

  const handleExport = () => {
    exportOrdersToCSV(filters, {
      onSuccess: (result) => {
        const filename =
          parseFilenameFromContentDisposition(result.headers) || "deliveries.xlsx";
        downloadBlob(result.data, filename);
        toast.success("تم تصدير التسليمات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير التسليمات. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  const handleResetFilters = () => {
    skipNextSyncRef.current = true;
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
    });
    setSearchParams({ page: "1", per_page: per_page.toString() });
  };

  // Check if order can be marked as delivered
  const canMarkAsDelivered = (order: TOrder) => {
    return order.status !== "delivered" && order.status !== "canceled";
  };

  // Check if order can be canceled
  const canCancelOrder = (order: TOrder) => {
    return order.status !== "canceled" && order.status !== "delivered";
  };

  return (
    <div dir="rtl" className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة التسليمات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع التسليمات في النظام
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="ml-2 h-4 w-4" />
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
              {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="order_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الفاتورة</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: 123" {...field} />
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
                              disabled={isPending}
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
                              disabled={isPending}
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
                          <FormLabel>اسم الصنف</FormLabel>
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
                              disabled={isPending}
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
                              disabled={isPending}
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
                              disabled={isPending}
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
                              disabled={isPending}
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
                              disabled={isPending}
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
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleResetFilters}>
                      <X className="ml-2 h-4 w-4" />
                      إعادة تعيين
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 py-8 text-center">
              <p className="text-sm font-medium text-destructive">
                حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
              </p>
              <p className="text-xs text-muted-foreground">{error?.message}</p>
            </div>
          )}

          {!isError && (
            <div className="table-responsive-wrapper">
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
                          <p className="underline hover:text-primary transition-colors">
                            #{order.id}
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
                              <span className="font-normal text-gray-700">
                                {order.client?.national_id ?? "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              الهاتف:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {order.client && (order.client as any).phones && (order.client as any).phones.length > 0
                                  ? formatPhone((order.client as any).phones[0]?.phone, "-")
                                  : "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              هاتف الواتساب:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {order.client && (order.client as any).phones && (order.client as any).phones.length > 1
                                  ? formatPhone((order.client as any).phones[1]?.phone, "-")
                                  : "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              العنوان:{" "}
                              <span className="font-normal text-gray-700">
                                {order.client?.address
                                  ? `${order.client.address.country_name ?? ""}${
                                      order.client.address.city_name
                                        ? ` - ${order.client.address.city_name}`
                                        : ""
                                    }${
                                      order.client.address.street
                                        ? ` - ${order.client.address.street}`
                                        : ""
                                    }${
                                      order.client.address.building
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
                            <p className="font-semibold text-gray-700">
                              تاريخ الفاتورة:{" "}
                              <span className="font-normal">
                                {formatDate(order.created_at)}
                              </span>
                            </p>
                            <p className="text-gray-700">
                              الفرح:{" "}
                              <span className="font-medium">
                                {order.visit_datetime
                                  ? formatDate(order.visit_datetime)
                                  : "-"}
                              </span>
                            </p>
                            <p className="text-gray-700">
                              تسليم:{" "}
                              <span className="font-medium">
                                {order.delivery_date
                                  ? formatDate(order.delivery_date)
                                  : "-"}
                              </span>
                            </p>
                            <p className="text-gray-700">
                              استرجاع:{" "}
                              <span className="font-medium">
                                {order.occasion_datetime
                                  ? formatDate(order.occasion_datetime)
                                  : "-"}
                              </span>
                            </p>
                            <div className="mt-2">
                              <TooltipProvider delayDuration={300}>
                                <div className="flex flex-wrap items-center gap-1 justify-start">
                                  {/* View */}
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

                                  {/* Edit */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => handleEditOrder(order)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      تعديل
                                    </TooltipContent>
                                  </Tooltip>

                                  {/* Mark as Delivered */}
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
                                      <TooltipContent side="top">
                                        تعليم كـ تم التسليم
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* Add Payment */}
                                  {order.status !== "paid" && order.status !== "canceled" && (
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
                                      <TooltipContent side="top">
                                        إضافة دفعة
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                          {/* Create Custody (for rent orders) */}
                          {order.order_type === "rent" && (
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
                                <TooltipContent side="top">
                                  إنشاء ضمان
                                </TooltipContent>
                              </Tooltip>
                            )}

                                  {/* Cancel Order */}
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
                                      <TooltipContent side="top">
                                        إلغاء الحجز
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {/* Delete Order */}
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
                                    <TooltipContent side="top">
                                      حذف الطلب
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
                                      .map((item) => getItemListDisplay(item as Record<string, unknown>))
                                      .join("، ")
                                  : "-"}
                              </span>
                            </p>
                            <p className="text-gray-700">
                              السعر:{" "}
                              <span className="font-medium">
                                {order.total_price} ج.م
                              </span>
                            </p>
                            <p className="text-gray-700">
                              المدفوع:{" "}
                              <span className="font-medium text-green-700">
                                {order.paid} ج.م
                              </span>
                            </p>
                            <p className="text-gray-700">
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
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد تسليمات مطابقة للفلاتر الحالية.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي التسليمات"
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

      {/* Cancel Order Dialog */}
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

      {/* Delete Order Dialog */}
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

      {/* Add Custody Modal (when order has no warranty) */}
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

      {/* Add Payment Modal */}
      {paymentModalOrder && (
        <CreatePaymentModal
          open={!!paymentModalOrder}
          onOpenChange={(open) => {
            if (!open) {
              setPaymentModalOrder(null);
            }
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

export default DeliveriesList;