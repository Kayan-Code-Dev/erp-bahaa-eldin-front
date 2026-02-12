import { useState, useMemo, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Download, Eye, Check, X, RotateCcw, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useExportPaymentsToCSVMutationOptions,
  useGetPaymentsQueryOptions,
  useMarkPaymentAsPaidMutationOptions,
  useMarkPaymentAsCanceledMutationOptions,
} from "@/api/v2/payments/payments.hooks";
import { TPayment, TPaymentStatus, TPaymentType, TGetPaymentsParams } from "@/api/v2/payments/payments.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { ClientsSelect } from "@/components/custom/ClientsSelect";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import { formatDate } from "@/utils/formatDate";
import useDebounce from "@/hooks/useDebounce";

const PAYMENT_STATUSES: { value: TPaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "معلق" },
  { value: "paid", label: "مدفوع" },
  { value: "canceled", label: "ملغي" },
];

const PAYMENT_TYPES: { value: TPaymentType | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "initial", label: "مبدئي" },
  { value: "fee", label: "رسوم" },
  { value: "normal", label: "عادي" },
];

// Filter form schema
const filterSchema = z.object({
  status: z.enum(["all", "pending", "paid", "canceled"]).optional(),
  payment_type: z.enum(["all", "initial", "fee", "normal"]).optional(),
  client_id: z.string().optional(),
  order_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  amount_min: z.string().optional(),
  amount_max: z.string().optional(),
  payment_date_from: z.string().optional(),
  payment_date_to: z.string().optional(),
  notes: z.string().optional(),
  search: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

const DEFAULT_PER_PAGE = 10;

function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

  // Form for filters
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: (searchParams.get("status") as TPaymentStatus | "all") || undefined,
      payment_type: (searchParams.get("payment_type") as TPaymentType | "all") || undefined,
      client_id: searchParams.get("client_id") || undefined,
      order_id: searchParams.get("order_id") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      amount_min: searchParams.get("amount_min") || undefined,
      amount_max: searchParams.get("amount_max") || undefined,
      payment_date_from: searchParams.get("payment_date_from") || undefined,
      payment_date_to: searchParams.get("payment_date_to") || undefined,
      notes: searchParams.get("notes") || undefined,
      search: searchParams.get("search") || undefined,
    },
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<TPayment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Watch form values
  const formValues = form.watch();

  // Debounce form values (500ms delay for text inputs, 300ms for selects)
  const debouncedFormValues = useDebounce({ 
    value: formValues, 
    delay: 500 
  });

  // Reset page to 1 when filters change (but not on initial load)
  const prevFormValuesRef = useRef<FilterFormValues | null>(null);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevFormValuesRef.current = formValues;
      return;
    }

    const prevValues = prevFormValuesRef.current;
    if (prevValues !== null) {
      // Check if any filter value changed
      const hasChanged = Object.keys(formValues).some(
        (key) => formValues[key as keyof FilterFormValues] !== prevValues[key as keyof FilterFormValues]
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

  // Build params object with debounced values (safe numbers: no NaN sent to API)
  const params: TGetPaymentsParams = useMemo(() => {
    const values = debouncedFormValues;
    const orderIdNum = values.order_id?.trim() ? Number(values.order_id) : NaN;
    const clientIdNum = values.client_id?.trim() ? Number(values.client_id) : NaN;
    const amountMinNum = values.amount_min?.trim() ? Number(values.amount_min) : NaN;
    const amountMaxNum = values.amount_max?.trim() ? Number(values.amount_max) : NaN;
    return {
      page,
      per_page,
      status: (values.status && values.status !== "all" ? values.status : undefined) as TPaymentStatus | undefined,
      payment_type: (values.payment_type && values.payment_type !== "all" ? values.payment_type : undefined) as TPaymentType | undefined,
      order_id: Number.isFinite(orderIdNum) ? orderIdNum : undefined,
      client_id: Number.isFinite(clientIdNum) ? clientIdNum : undefined,
      date_from: values.date_from?.trim() || undefined,
      date_to: values.date_to?.trim() || undefined,
      amount_min: Number.isFinite(amountMinNum) ? amountMinNum : undefined,
      amount_max: Number.isFinite(amountMaxNum) ? amountMaxNum : undefined,
      payment_date_from: values.payment_date_from?.trim() || undefined,
      payment_date_to: values.payment_date_to?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      search: values.search?.trim() || undefined,
    };
  }, [page, per_page, debouncedFormValues]);

  // Synchronize parameters with URL
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("page", String(page));
    next.set("per_page", String(per_page));
    if (params.status) next.set("status", params.status);
    if (params.payment_type) next.set("payment_type", params.payment_type);
    if (params.client_id != null) next.set("client_id", String(params.client_id));
    if (params.order_id != null) next.set("order_id", String(params.order_id));
    if (params.date_from) next.set("date_from", params.date_from);
    if (params.date_to) next.set("date_to", params.date_to);
    if (params.amount_min != null) next.set("amount_min", String(params.amount_min));
    if (params.amount_max != null) next.set("amount_max", String(params.amount_max));
    if (params.payment_date_from) next.set("payment_date_from", params.payment_date_from);
    if (params.payment_date_to) next.set("payment_date_to", params.payment_date_to);
    if (params.notes) next.set("notes", params.notes);
    if (params.search) next.set("search", params.search);
    setSearchParams(next, { replace: true });
  }, [params, page, per_page, setSearchParams]);

  // Data fetching
  const { data, isPending, isError, error } = useQuery(
    useGetPaymentsQueryOptions(params)
  );

  // Mutations
  const markAsPaidMutation = useMutation(
    useMarkPaymentAsPaidMutationOptions()
  );
  const markAsCanceledMutation = useMutation(
    useMarkPaymentAsCanceledMutationOptions()
  );
  const { mutate: exportPaymentsToCSV, isPending: isExporting } = useMutation(
    useExportPaymentsToCSVMutationOptions()
  );

  // Handlers
  const handleViewDetails = (payment: TPayment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handleMarkAsPaid = async (paymentId: number) => {
    try {
      await markAsPaidMutation.mutateAsync(paymentId);
      toast.success("تم تحديث حالة الدفعة إلى مدفوع بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة الدفعة");
    }
  };

  const handleMarkAsCanceled = async (paymentId: number) => {
    try {
      await markAsCanceledMutation.mutateAsync(paymentId);
      toast.success("تم إلغاء الدفعة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء إلغاء الدفعة");
    }
  };

  const handleResetFilters = () => {
    form.reset({
      status: undefined,
      payment_type: undefined,
      client_id: undefined,
      order_id: undefined,
      date_from: undefined,
      date_to: undefined,
      amount_min: undefined,
      amount_max: undefined,
      payment_date_from: undefined,
      payment_date_to: undefined,
      notes: undefined,
      search: undefined,
    });
    setSearchParams({ page: "1", per_page: String(per_page) });
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportPaymentsToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `payments-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير المدفوعات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير المدفوعات. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  const getClientName = (client: {
    name?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  } | null | undefined) => {
    if (!client) return "—";
    if (typeof client.name === "string" && client.name.trim()) return client.name.trim();
    const parts = [client.first_name, client.middle_name, client.last_name].filter(Boolean) as string[];
    return parts.length ? parts.join(" ").trim() : "—";
  };

  const getStatusLabel = (status: TPaymentStatus) => {
    const statusMap = {
      pending: "معلق",
      paid: "مدفوع",
      canceled: "ملغي",
    };
    return statusMap[status];
  };

  const getStatusBadgeClass = (status: TPaymentStatus) => {
    const classMap = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return classMap[status];
  };

  const getPaymentTypeLabel = (type: TPaymentType) => {
    const typeMap = {
      initial: "مبدئي",
      fee: "رسوم",
      normal: "عادي",
    };
    return typeMap[type];
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة المدفوعات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع المدفوعات في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="ml-2 h-4 w-4" />
              {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="ml-2 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
            </Button>
          </div>
        </CardHeader>

        {/* Filters Card */}
        {showFilters && (
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الفلاتر</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Search */}
                      <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>بحث عام</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ابحث..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الحالة</FormLabel>
                            <Select
                              value={field.value || "all"}
                              onValueChange={(value) => field.onChange(value === "all" ? undefined : value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الحالة..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PAYMENT_STATUSES.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {/* Payment Type */}
                      <FormField
                        control={form.control}
                        name="payment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع الدفعة</FormLabel>
                            <Select
                              value={field.value || "all"}
                              onValueChange={(value) => field.onChange(value === "all" ? undefined : value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر النوع..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PAYMENT_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                                value={field.value || ""}
                                onChange={(value) => field.onChange(value || undefined)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Order ID */}
                      <FormField
                        control={form.control}
                        name="order_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الطلب</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="رقم الطلب..."
                                value={field.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, "");
                                  field.onChange(val || "");
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Date From */}
                      <FormField
                        control={form.control}
                        name="date_from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ من</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Date To */}
                      <FormField
                        control={form.control}
                        name="date_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ إلى</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Amount Min */}
                      <FormField
                        control={form.control}
                        name="amount_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المبلغ الأدنى</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="المبلغ الأدنى..."
                                value={field.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  field.onChange(val || "");
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Amount Max */}
                      <FormField
                        control={form.control}
                        name="amount_max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المبلغ الأعلى</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="المبلغ الأعلى..."
                                value={field.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  field.onChange(val || "");
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Payment Date From */}
                      <FormField
                        control={form.control}
                        name="payment_date_from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الدفع من</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Payment Date To */}
                      <FormField
                        control={form.control}
                        name="payment_date_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الدفع إلى</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملاحظات</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ابحث في الملاحظات..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleResetFilters}>
                  <RotateCcw className="ml-2 h-4 w-4" />
                  إعادة تعيين
                </Button>
              </CardFooter>
            </Card>
          </CardContent>
        )}

        {isError && (
          <CardContent>
            <div className="flex items-center justify-center">
              <p className="text-red-500">
                حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
              </p>
              <p className="text-red-500">{error?.message}</p>
            </div>
          </CardContent>
        )}

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">رقم الطلب</TableHead>
                    <TableHead className="text-center">العميل</TableHead>
                    <TableHead className="text-center">المبلغ</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">نوع الدفعة</TableHead>
                    <TableHead className="text-center">تاريخ الدفع</TableHead>
                    <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center">ملاحظات</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-muted-foreground"
                      >
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-center">
                          {payment.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.order_id}
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.order?.client
                            ? getClientName(payment.order.client)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {payment.amount.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              payment.status
                            )}`}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(payment.payment_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="text-center max-w-[200px] text-wrap">
                          {payment.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === "pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="icon"
                                  title="تحديد كمدفوع"
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                  disabled={
                                    markAsPaidMutation.isPending ||
                                    markAsCanceledMutation.isPending
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  title="إلغاء"
                                  onClick={() =>
                                    handleMarkAsCanceled(payment.id)
                                  }
                                  disabled={
                                    markAsPaidMutation.isPending ||
                                    markAsCanceledMutation.isPending
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد مدفوعات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي المدفوعات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />
      )}
    </div>
  );
}

export default Payments;
