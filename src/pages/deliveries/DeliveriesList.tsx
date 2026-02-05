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
// dropdown menu imports تمت إزالتها بعد استبدال القائمة بأزرار مباشرة
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
import { OrdersTableSkeleton } from "@/pages/orders/OrdersTableSkeleton";
import { OrderDetailsModal } from "@/pages/orders/OrderDetailsModal";
import { CreateCustodyModal } from "@/pages/orders/CreateCustodyModal";
import { getOrderTypeLabel, getStatusVariant, getStatusLabel } from "@/api/v2/orders/order.utils";
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
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import { ClientsSelect } from "@/components/custom/ClientsSelect";
import useDebounce from "@/hooks/useDebounce";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      client_id: searchParams.get("client_id") || undefined,
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

  const formValues = form.watch();
  const debouncedFormValues = useDebounce({
    value: formValues,
    delay: FILTER_DEBOUNCE_MS,
  });

  const prevFormValuesRef = useRef<DeliveriesFilterFormValues | null>(null);
  const isInitialMount = useRef(true);

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

  const filters = useMemo(() => {
    const values = debouncedFormValues;
    return {
      date_from: values.date_from || undefined,
      date_to: values.date_to || undefined,
      client_id:
        values.client_id && values.client_id.trim() !== ""
          ? values.client_id
          : undefined,
    };
  }, [debouncedFormValues]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (filters.date_from) params.set("date_from", filters.date_from);
    else params.delete("date_from");
    if (filters.date_to) params.set("date_to", filters.date_to);
    else params.delete("date_to");
    if (filters.client_id) params.set("client_id", String(filters.client_id));
    else params.delete("client_id");
    params.set("page", page.toString());
    params.set("per_page", per_page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, page, per_page, searchParams, setSearchParams]);

  // Data fetching
  const { data, isPending, isError, error, refetch } = useQuery(
    useGetOrdersQueryOptions(page, per_page, filters)
  );

  // فلترة حسب نوع الطلب (إيجار / بيع / تفصيل / مختلط)
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
    navigate(`/orders/${order.id}`);
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
    exportOrdersToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `deliveries-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
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
    form.reset({
      date_from: undefined,
      date_to: undefined,
      client_id: undefined,
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
    <div dir="rtl">
      <Card className="max-w-screen-lg 2xl:max-w-screen-2xl mx-auto">
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
              <Button
                type="button"
                variant={orderTypeFilter === "mixed" ? "default" : "ghost"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => setOrderTypeFilter("mixed")}
              >
                مختلط
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
          {showFilters && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="date_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ من</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ من"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ إلى</FormLabel>
                          <FormControl>
                            <CustomCalendar
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="اختر التاريخ إلى"
                              disabled={isPending}
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
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">#</TableHead>
                    <TableHead className="text-center w-64">التواريخ</TableHead>
                    <TableHead className="text-center w-[40%]">الأصناف / المبالغ / الحالة</TableHead>
                    <TableHead className="text-center w-40">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <OrdersTableSkeleton rows={5} />
                  ) : displayedOrders.length > 0 ? (
                    displayedOrders.map((order) => (
                      <TableRow key={order.id} className="align-top">
                        {/* رقم الطلب */}
                        <TableCell
                          className="font-medium text-center cursor-pointer align-top pt-4"
                          onClick={() => handleViewOrder(order)}
                        >
                          <p className="underline hover:text-primary transition-colors">
                            #{order.id}
                          </p>
                        </TableCell>

                        {/* التواريخ */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1 text-sm text-right">
                            <p className="font-semibold text-gray-700">
                              تاريخ الفاتورة:{" "}
                              <span className="font-normal">
                                {formatDate(order.created_at)}
                              </span>
                            </p>
                            <p className="text-gray-700">
                              تأجير:{" "}
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
                          </div>
                        </TableCell>

                        {/* الأصناف + المبالغ + الحالة */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-2 text-sm text-right">
                            <p className="font-semibold text-gray-900">
                              العميل:
                              <span className="font-normal text-gray-700">
                                {" "}
                                {order.client.name}
                              </span>
                            </p>
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

                        {/* الإجراءات */}
                        <TableCell className="text-center align-top">
                          <div className="flex flex-col items-center justify-start gap-2 text-sm">
                            {/* View Button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => handleOpenView(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>عرض التفاصيل</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Mark as Delivered */}
                            {canMarkAsDelivered(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center"
                                onClick={() => handleMarkAsDelivered(order)}
                                disabled={isDelivering}
                              >
                                <CheckCircle className="ml-1 h-4 w-4 text-emerald-600" />
                                تعليم كـ تم التسليم
                              </Button>
                            )}

                            {/* Add Payment */}
                            {order.status !== "paid" && order.status !== "canceled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center"
                                onClick={() => handleAddPayment(order)}
                              >
                                <CreditCard className="ml-1 h-4 w-4 text-blue-600" />
                                إضافة دفعة
                              </Button>
                            )}

                            {/* Create Custody (للطلبات الإيجار بدون ضمان) */}
                            {order.order_type === "rent" && (() => {
                              const count = (order as TOrder & { custodies_count?: number }).custodies_count;
                              if (count !== undefined && count > 0) return null;
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-center"
                                  onClick={() => setCustodyModalOrder(order)}
                                >
                                  <ShieldPlus className="ml-1 h-4 w-4 text-purple-600" />
                                  إنشاء ضمان
                                </Button>
                              );
                            })()}

                            {/* Edit Order */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-center"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="ml-1 h-4 w-4 text-gray-700" />
                              تعديل الطلب
                            </Button>

                            {/* Cancel Order */}
                            {canCancelOrder(order) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center text-yellow-700 hover:bg-yellow-50"
                                onClick={() => handleOpenCancelDialog(order)}
                              >
                                <Ban className="ml-1 h-4 w-4" />
                                إلغاء الحجز
                              </Button>
                            )}

                            {/* Delete Order */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-center text-red-600 hover:bg-red-50"
                              onClick={() => handleOpenDeleteDialog(order)}
                            >
                              <Trash2 className="ml-1 h-4 w-4" />
                              حذف الطلب
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
    </div>
  );
}

export default DeliveriesList;