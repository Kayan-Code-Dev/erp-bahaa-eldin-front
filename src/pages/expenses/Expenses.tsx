import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/custom/CustomPagination";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { CashboxesSelect } from "@/components/custom/CashboxesSelect";
import { useGetExpensesQueryOptions } from "@/api/v2/expenses/expenses.hooks";
import {
  ExpenseCategories,
  TExpense,
  TExpenseStatus,
  TGetExpensesParams,
} from "@/api/v2/expenses/expenses.types";
import useDebounce from "@/hooks/useDebounce";
import {
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  DollarSign,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { CreateExpenseModal } from "./CreateExpenseModal";
import { UpdateExpenseModal } from "./UpdateExpenseModal";
import { DeleteExpenseModal } from "./DeleteExpenseModal";
import { ApproveExpenseModal } from "./ApproveExpenseModal";
import { CancelExpenseModal } from "./CancelExpenseModal";
import { PayExpenseModal } from "./PayExpenseModal";
import { ExpenseDetailsModal } from "./ExpenseDetailsModal";
import { DatePicker } from "@/components/custom/DatePicker";

const STATUS_OPTIONS: { value: TExpenseStatus | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "معلق" },
  { value: "approved", label: "معتمد" },
  { value: "paid", label: "مدفوع" },
  { value: "cancelled", label: "ملغي" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "الكل" },
  ...ExpenseCategories.map((c) => ({ value: c.id, label: c.name })),
];

const filterSchema = z.object({
  branch_id: z.string().optional(),
  cashbox_id: z.string().optional(),
  status: z
    .enum(["all", "pending", "approved", "paid", "cancelled"])
    .optional(),
  category: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  vendor: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

const getStatusLabel = (status: TExpenseStatus) => {
  const map: Record<TExpenseStatus, string> = {
    pending: "معلق",
    approved: "معتمد",
    paid: "مدفوع",
    cancelled: "ملغي",
  };
  return map[status] || status;
};

const getStatusBadgeClass = (status: TExpenseStatus) => {
  const map: Record<TExpenseStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return map[status];
};

// ------ Main Page ------

function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  const [showFilters, setShowFilters] = useState(false);
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<TExpense | null>(null);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      branch_id: searchParams.get("branch_id") || undefined,
      cashbox_id: searchParams.get("cashbox_id") || undefined,
      status: (searchParams.get("status") as TExpenseStatus | "all") || "all",
      category: searchParams.get("category") || undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      search: searchParams.get("search") || undefined,
      vendor: searchParams.get("vendor") || undefined,
    },
  });

  // Watch individual fields
  const branchId = form.watch("branch_id");
  const cashboxId = form.watch("cashbox_id");
  const status = form.watch("status");
  const category = form.watch("category");
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const search = form.watch("search");
  const vendor = form.watch("vendor");

  // Debounce only text inputs (search, vendor) to avoid object identity issues
  const debouncedSearch = useDebounce({ value: search, delay: 500 });
  const debouncedVendor = useDebounce({ value: vendor, delay: 500 });

  // Keep search params in sync with filters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));

    if (branchId) params.set("branch_id", String(branchId));
    if (cashboxId) params.set("cashbox_id", String(cashboxId));
    if (status && status !== "all") params.set("status", String(status));
    if (category && category !== "all")
      params.set("category", String(category));
    if (startDate) params.set("start_date", String(startDate));
    if (endDate) params.set("end_date", String(endDate));
    if (debouncedSearch) params.set("search", String(debouncedSearch));
    if (debouncedVendor) params.set("vendor", String(debouncedVendor));

    setSearchParams(params, { replace: true });
  }, [
    page,
    branchId,
    cashboxId,
    status,
    category,
    startDate,
    endDate,
    debouncedSearch,
    debouncedVendor,
    setSearchParams,
  ]);

  const queryParams: TGetExpensesParams = useMemo(() => {
    return {
      page,
      per_page,
      branch_id: branchId ? Number(branchId) : undefined,
      cashbox_id: cashboxId ? Number(cashboxId) : undefined,
      status:
        status && status !== "all" ? (status as TExpenseStatus) : undefined,
      category: category && category !== "all" ? category : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      search: (debouncedSearch as string | undefined) || undefined,
      vendor: (debouncedVendor as string | undefined) || undefined,
    };
  }, [
    page,
    per_page,
    branchId,
    cashboxId,
    status,
    category,
    startDate,
    endDate,
    debouncedSearch,
    debouncedVendor,
  ]);

  const { data, isPending, isError, error } = useQuery(
    useGetExpensesQueryOptions(queryParams)
  );

  const handleResetFilters = () => {
    form.reset({
      branch_id: undefined,
      cashbox_id: undefined,
      status: "all",
      category: undefined,
      start_date: undefined,
      end_date: undefined,
      search: undefined,
      vendor: undefined,
    });
    setSearchParams({ page: "1" });
  };

  const openDetails = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  const openUpdate = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  const openDelete = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const openApprove = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsApproveModalOpen(true);
  };

  const openCancel = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsCancelModalOpen(true);
  };

  const openPay = (expense: TExpense) => {
    setSelectedExpense(expense);
    setIsPayModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة المصروفات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع المصروفات في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="ml-2 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مصروف
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">الفلاتر</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>بحث عام</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ابحث عن مورد أو وصف أو رقم مرجع..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vendor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المورد</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="اسم المورد..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الحالة</FormLabel>
                            <Select
                              value={field.value || "all"}
                              onValueChange={(value) =>
                                field.onChange(
                                  value === "all" ? undefined : value
                                )
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الحالة..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الفئة</FormLabel>
                            <Select
                              value={field.value || "all"}
                              onValueChange={(value) =>
                                field.onChange(
                                  value === "all" ? undefined : value
                                )
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الفئة..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((c) => (
                                  <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branch_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الفرع</FormLabel>
                            <FormControl>
                              <BranchesSelect
                                value={field.value || ""}
                                onChange={(value) =>
                                  field.onChange(value || undefined)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cashbox_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الصندوق</FormLabel>
                            <FormControl>
                              <CashboxesSelect
                                value={field.value || ""}
                                onChange={(value) =>
                                  field.onChange(value || undefined)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ من</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) =>
                                  field.onChange(
                                    date
                                      ? date.toISOString().slice(0, 10)
                                      : undefined
                                  )
                                }
                                placeholder="اختر التاريخ..."
                                allowFutureDates={true}
                                allowPastDates={true}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ إلى</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) =>
                                  field.onChange(
                                    date
                                      ? date.toISOString().slice(0, 10)
                                      : undefined
                                  )
                                }
                                placeholder="اختر التاريخ..."
                                allowFutureDates={true}
                                allowPastDates={true}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetFilters}
                      >
                        إعادة تعيين الفلاتر
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </CardContent>
        )}

        {isError && (
          <CardContent>
            <p className="text-red-500 text-center">
              حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
            </p>
            <p className="text-red-500 text-center text-sm mt-2">
              {(error as any)?.message}
            </p>
          </CardContent>
        )}

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">الفرع</TableHead>
                    <TableHead className="text-center">الصندوق</TableHead>
                    <TableHead className="text-center">الفئة</TableHead>
                    <TableHead className="text-center">المورد</TableHead>
                    <TableHead className="text-center">المبلغ</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-muted-foreground"
                      >
                        جاري تحميل البيانات...
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-center font-medium">
                          {expense.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.branch?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.cashbox?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {
                            ExpenseCategories.find(
                              (c) => c.id === expense.category
                            )?.name
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.vendor}
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.amount} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(expense.expense_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeClass(expense.status)}
                          >
                            {getStatusLabel(expense.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => openDetails(expense)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => openUpdate(expense)}
                              disabled={expense.status !== "pending"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="حذف"
                              onClick={() => openDelete(expense)}
                              disabled={expense.status !== "pending"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="اعتماد"
                              onClick={() => openApprove(expense)}
                              disabled={expense.status !== "pending"}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="إلغاء"
                              onClick={() => openCancel(expense)}
                              disabled={expense.status !== "pending"}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="دفع"
                              onClick={() => openPay(expense)}
                              disabled={expense.status !== "approved"}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
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
                        لا توجد مصروفات لعرضها.
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
            totalElementsLabel="إجمالي المصروفات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* Modals */}
      <CreateExpenseModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <UpdateExpenseModal
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        expense={selectedExpense}
      />
      <DeleteExpenseModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        expense={selectedExpense}
      />
      <ApproveExpenseModal
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        expense={selectedExpense}
      />
      <CancelExpenseModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        expense={selectedExpense}
      />
      <PayExpenseModal
        open={isPayModalOpen}
        onOpenChange={setIsPayModalOpen}
        expense={selectedExpense}
      />
      <ExpenseDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        expense={selectedExpense}
      />
    </div>
  );
}

export default Expenses;
