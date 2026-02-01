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
  MoreVertical,
  CheckCircle,
  Edit
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import useDebounce from "@/hooks/useDebounce";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const filterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

function DeliveriesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
    },
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  
  // States for dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToAction, setOrderToAction] = useState<TOrder | null>(null);

  const formValues = form.watch();
  const debouncedFormValues = useDebounce({ value: formValues, delay: 500 });

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

  const filters = useMemo(() => {
    const values = debouncedFormValues;
    return {
      status: "delivered",
      date_from: values.date_from || undefined,
      date_to: values.date_to || undefined,
    };
  }, [debouncedFormValues]);

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
    });
    setSearchParams({ page: "1" });
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
                    <TableHead className="text-center w-32">الإجراءات</TableHead>
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
                          {order.client.first_name} {order.client.middle_name}{" "}
                          {order.client.last_name}
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
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
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

                            {/* Mark as Delivered Button */}
                            {canMarkAsDelivered(order) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                      onClick={() => handleMarkAsDelivered(order)}
                                      disabled={isDelivering}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>تسليم الطلب</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {/* Add Payment Button */}
                            {order.status !== "paid" && order.status !== "canceled" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
                                      onClick={() => handleAddPayment(order)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>إضافة دفعة</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {/* Actions Dropdown */}
                            <DropdownMenu>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-100"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>المزيد من الإجراءات</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                  <Edit className="ml-2 h-4 w-4" />
                                  تعديل الطلب
                                </DropdownMenuItem>
                                
                                {canCancelOrder(order) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleOpenCancelDialog(order)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Ban className="ml-2 h-4 w-4" />
                                      إلغاء الحجز
                                    </DropdownMenuItem>
                                  </>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleOpenDeleteDialog(order)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="ml-2 h-4 w-4" />
                                  حذف الطلب
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                        لا توجد تسليمات لعرضها.
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
    </div>
  );
}

export default DeliveriesList;