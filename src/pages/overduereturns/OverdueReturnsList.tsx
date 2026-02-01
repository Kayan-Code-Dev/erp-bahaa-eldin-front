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
  useReturnOrderItemMutationOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder } from "@/api/v2/orders/orders.types";
import { formatDate } from "@/utils/formatDate";
import { OrdersTableSkeleton } from "@/pages/orders/OrdersTableSkeleton";
import { OrderDetailsModal } from "@/pages/orders/OrderDetailsModal";
import { getOrderTypeLabel, getStatusVariant, getStatusLabel } from "@/api/v2/orders/order.utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomCalendar } from "@/components/custom/CustomCalendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";

const filterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

function OverdueReturnsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Form for filters
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    },
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  
  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<TOrder | null>(null);

  // Watch form values
  const formValues = form.watch();

  // Debounce form values
  const debouncedFormValues = useDebounce({ value: formValues, delay: 500 });

  // Reset page to 1 when filters change
  const prevFormValuesRef = useRef<FilterFormValues | null>(null);
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
          formValues[key as keyof FilterFormValues] !==
          prevValues[key as keyof FilterFormValues]
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

  // Build filters object
  const filters = useMemo(() => {
    const values = debouncedFormValues;
    return {
      overdue: true,
      date_from: values.date_from || undefined,
      date_to: values.date_to || undefined,
    };
  }, [debouncedFormValues]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (filters.date_from) {
      params.set("date_from", filters.date_from);
    } else {
      params.delete("date_from");
    }
    if (filters.date_to) {
      params.set("date_to", filters.date_to);
    } else {
      params.delete("date_to");
    }
    params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, page, searchParams, setSearchParams]);

  // Data fetching
  const { data, isPending, isError, error, refetch } = useQuery(
    useGetOrdersQueryOptions(page, per_page, filters)
  );

  // Export Mutation
  const { mutate: exportOrdersToCSV, isPending: isExporting } = useMutation(
    useExportOrdersToCSVMutationOptions()
  );

  // Return Order Item Mutation
  const { mutate: returnOrderItem, isPending: isReturning } = useMutation(
    useReturnOrderItemMutationOptions()
  );

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

  const handleReturnItem = (itemId: number, returnData: any) => {
    if (!orderToReturn) return;

    returnOrderItem({
      order_id: orderToReturn.id,
      item_id: itemId,
      data: returnData
    }, {
      onSuccess: () => {
        toast.success("تم إرجاع العنصر بنجاح");
        setShowReturnModal(false);
        setOrderToReturn(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء إرجاع العنصر", {
          description: error.message,
        });
      },
    });
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
          `overdue-returns-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الارجاعات المتأخرة بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الارجاعات المتأخرة. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  const handleResetFilters = () => {
    form.reset({
      date_from: undefined,
      date_to: undefined,
    });
    setSearchParams({ page: "1" });
  };

  // Check if order can be returned
  const canReturnOrder = (order: TOrder) => {
    // Overdue returns are usually returnable
    return order.status !== "canceled";
  };

  return (
    <div dir="rtl">
      <Card className="max-w-screen-lg 2xl:max-w-screen-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الارجاعات المتأخرة</CardTitle>
            <CardDescription>
              عرض وإدارة جميع الارجاعات المتأخرة في النظام
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  ) : data && data.data.length > 0 ? (
                    data.data.map((order) => (
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

                            {/* Return Button */}
                            {canReturnOrder(order) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                                      onClick={() => handleOpenReturn(order)}
                                      disabled={isReturning}
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
                        لا توجد ارجاعات متأخرة لعرضها.
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
            totalElementsLabel="إجمالي الارجاعات المتأخرة"
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

      {/* Return Modal */}
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
                اختر العناصر التي تريد إرجاعها:
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
                      {item.returnable === 0 && (
                        <p className="mt-1 text-xs text-destructive">غير قابل للإرجاع</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (item.returnable === 1) {
                          handleReturnItem(item.id, {
                            entity_type: orderToReturn.entity_type,
                            entity_id: orderToReturn.entity_id,
                            note: `إرجاع طلب متأخر #${orderToReturn.id}`,
                            photos: [],
                          });
                        } else {
                          toast.warning("هذا المنتج غير قابل للإرجاع");
                        }
                      }}
                      disabled={isReturning || item.returnable === 0}
                    >
                      {item.returnable === 1 ? "إرجاع" : "غير قابل"}
                    </Button>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowReturnModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    toast.info("سيتم تنفيذ الإرجاع قريباً");
                    setShowReturnModal(false);
                  }}
                >
                  تأكيد الإرجاع
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OverdueReturnsList;