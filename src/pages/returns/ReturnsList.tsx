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
import useDebounce from "@/hooks/useDebounce";
import { ReturnOrderFullModal } from "@/pages/orders/ReturnOrderFullModal";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
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

  // Today's date to display returns for today by default
  const today = new Date().toISOString().split("T")[0];
  const initialDateFrom = searchParams.get("date_from") || today;
  const initialDateTo = searchParams.get("date_to") || today;

  const form = useForm<ReturnsFilterFormValues>({
    resolver: zodResolver(returnsFilterSchema),
    defaultValues: {
      date_from: initialDateFrom,
      date_to: initialDateTo,
      client_id: searchParams.get("client_id") || undefined,
    },
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  
  // Return entire order
  const [orderToReturn, setOrderToReturn] = useState<TOrder | null>(null);

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
      // Filtering is by return date but using parameter names date_from / date_to as required by API
      date_from: values.date_from || undefined,
      date_to: values.date_to || undefined,
      client_id:
        values.client_id && values.client_id.trim() !== ""
          ? values.client_id
          : undefined,
    };
  }, [debouncedFormValues]);

  // Update URL params when filters change (synchronize form values)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedFormValues.date_from) params.set("date_from", debouncedFormValues.date_from);
    else params.delete("date_from");
    if (debouncedFormValues.date_to) params.set("date_to", debouncedFormValues.date_to);
    else params.delete("date_to");
    if (filters.client_id) params.set("client_id", String(filters.client_id));
    else params.delete("client_id");
    params.set("page", page.toString());
    params.set("per_page", per_page.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedFormValues, filters.client_id, page, per_page, searchParams, setSearchParams]);

  // Data fetching
  const { data, isPending, isError, error, refetch } = useQuery(
    useGetOrdersQueryOptions(page, per_page, filters)
  );

  // API returns delivered orders; show all
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

  const handleOpenReturn = (order: TOrder) => {
    setOrderToReturn(order);
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
                              <span className="font-normal text-gray-700">
                                {order.client && (order.client as any).phones && (order.client as any).phones.length > 0
                                  ? (order.client as any).phones[0]?.phone
                                  : "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              هاتف الواتساب:{" "}
                              <span className="font-normal text-gray-700">
                                {order.client && (order.client as any).phones && (order.client as any).phones.length > 1
                                  ? (order.client as any).phones[1]?.phone
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

                                  {/* Return entire order */}
                                  {canReturnOrder(order) && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 shrink-0"
                                          onClick={() => handleOpenReturn(order)}
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        إرجاع الطلب
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
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
                                        item.code
                                          ? `${item.name} (${item.code})`
                                          : item.name
                                      )
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

      {/* Return entire order */}
      <ReturnOrderFullModal
        open={!!orderToReturn}
        onOpenChange={(open) => !open && setOrderToReturn(null)}
        order={orderToReturn}
        onSuccess={() => {
          refetch();
          setOrderToReturn(null);
        }}
      />
    </div>
  );
}

export default ReturnsList;