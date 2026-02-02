import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router";
import { Download, Eye, Filter, X, RotateCcw } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomPagination from "@/components/custom/CustomPagination";
import {
  useExportOrdersToCSVMutationOptions,
  useGetOrdersQueryOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate } from "@/utils/formatDate";
import { OrdersTableSkeleton } from "@/pages/orders/OrdersTableSkeleton";
import { OrderDetailsModal } from "@/pages/orders/OrderDetailsModal";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";
import { ReturnOrderItemModal } from "@/pages/orders/ReturnOrderItemModal";
import { DEFAULT_PER_PAGE, FILTER_DEBOUNCE_MS, RETURNS_FILTER } from "./constants";
import {
  returnsFilterSchema,
  type ReturnsFilterFormValues,
} from "./returnsFilter.schema";

function ReturnsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

  const form = useForm<ReturnsFilterFormValues>({
    resolver: zodResolver(returnsFilterSchema),
    defaultValues: {
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      client_id: searchParams.get("client_id") || undefined,
    },
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  
  // Return Modal State: list of items to choose from
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<TOrder | null>(null);
  // Return item modal (with photos required)
  const [showReturnItemModal, setShowReturnItemModal] = useState(false);
  const [itemToReturn, setItemToReturn] = useState<{ id: number; name?: string } | null>(null);

  // Watch form values
  const formValues = form.watch();

  const debouncedFormValues = useDebounce({
    value: formValues,
    delay: FILTER_DEBOUNCE_MS,
  });

  const prevFormValuesRef = useRef<ReturnsFilterFormValues | null>(null);
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
          formValues[key as keyof ReturnsFilterFormValues] !==
          prevValues[key as keyof ReturnsFilterFormValues]
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
      ...RETURNS_FILTER,
      date_from: values.date_from || undefined,
      date_to: values.date_to || undefined,
      client_id:
        values.client_id && values.client_id.trim() !== ""
          ? values.client_id
          : undefined,
    };
  }, [debouncedFormValues]);

  // Update URL params when filters change
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

  // API returns delivered orders (تم التسليم); show all
  const displayedOrders = useMemo(() => data?.data ?? [], [data?.data]);

  // Export Mutation
  const { mutate: exportOrdersToCSV, isPending: isExporting } = useMutation(
    useExportOrdersToCSVMutationOptions()
  );

  // Return Order Item Mutation
  // Modal handlers
  const handleOpenView = (order: TOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleViewOrder = (order: TOrder) => {
    navigate(`/orders/${order.id}`);
  };

  // Handle Return
  const handleOpenReturn = (order: TOrder) => {
    setOrderToReturn(order);
    setShowReturnModal(true);
  };

  const handleOpenReturnItem = (item: { id: number; name?: string }) => {
    setItemToReturn(item);
    setShowReturnModal(false);
    setShowReturnItemModal(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportOrdersToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `returns-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الارجاعات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الارجاعات. الرجاء المحاولة مرة أخرى.", {
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

  // Check if order can be returned
  const canReturnOrder = (order: TOrder) => {
    return order.status === "delivered" || order.status === "partially_paid";
  };

  return (
    <div dir="rtl">
      <Card className="max-w-screen-lg 2xl:max-w-screen-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الارجاعات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع الارجاعات في النظام
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="ml-2 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "الفلاتر"}
            </Button>
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
                    <TableHead className="text-center">رقم الطلب</TableHead>
                    <TableHead className="text-center">العميل</TableHead>
                    <TableHead className="text-center">السعر الإجمالي</TableHead>
                    <TableHead className="text-center">المدفوع</TableHead>
                    <TableHead className="text-center">المتبقي</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">تاريخ الزيارة</TableHead>
                    <TableHead className="text-center">نوع الطلب</TableHead>
                    <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <OrdersTableSkeleton rows={5} />
                  ) : displayedOrders.length > 0 ? (
                    displayedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell
                          className="font-medium text-center cursor-pointer"
                          onClick={() => handleViewOrder(order)}
                        >
                          <p className="underline hover:text-primary transition-colors">
                            #{order.id}
                          </p>
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
                          {formatDate(order.visit_datetime)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getOrderTypeLabel(order.order_type)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            {/* View Button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                    title="عرض التفاصيل"
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

                            {/* Return Button - only for returnable orders */}
                            {canReturnOrder(order) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                                      title="إرجاع الطلب"
                                      onClick={() => handleOpenReturn(order)}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>إرجاع الطلب</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد أوردرات مرجعة لعرضها.
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
            totalElementsLabel="إجمالي الارجاعات"
            totalElements={data?.total ?? 0}
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

      {/* Return Modal: list of items */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              إرجاع الطلب {orderToReturn ? `#${orderToReturn.id}` : ""}
            </DialogTitle>
          </DialogHeader>
          {orderToReturn && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                اختر العنصر الذي تريد إرجاعه (يُطلب إرفاق صور في الخطوة التالية):
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orderToReturn.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">كود: {item.code}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReturnItem({ id: item.id, name: item.name })}
                    >
                      إرجاع
                    </Button>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowReturnModal(false)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return item modal: form with photos (required by API) */}
      {orderToReturn && itemToReturn && (
        <ReturnOrderItemModal
          open={showReturnItemModal}
          onOpenChange={(open) => {
            setShowReturnItemModal(open);
            if (!open) setItemToReturn(null);
          }}
          orderId={orderToReturn.id}
          itemId={itemToReturn.id}
          itemName={itemToReturn.name}
          onSuccess={() => {
            refetch();
            setOrderToReturn(null);
            setItemToReturn(null);
          }}
        />
      )}
    </div>
  );
}

export default ReturnsList;