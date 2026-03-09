import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowDownCircle, ArrowUpCircle, Eye, Filter } from "lucide-react";
import { CashboxesSelect } from "@/components/custom/CashboxesSelect";
import { useGetTransactionsQueryOptions } from "@/api/v2/transactions/transactions.hooks";
import { TTransaction } from "@/api/v2/transactions/transactions.types";
import { formatDateTime } from "@/utils/formatDate";
import { useGetPaymentByIdQueryOptions } from "@/api/v2/payments/payments.hooks";
import { useGetExpenseByIdQueryOptions } from "@/api/v2/expenses/expenses.hooks";
import { PaymentDetailsModal } from "@/pages/payments/PaymentDetailsModal";
import { ExpenseDetailsModal } from "@/pages/expenses/ExpenseDetailsModal";

const PER_PAGE_DEFAULT = 15;

const formatMoney = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م`;
};

const getCategoryLabel = (category: TTransaction["category"]) => {
  switch (category) {
    case "payment":
      return "دفعة عميل";
    case "expense":
      return "مصروف";
    case "salary_expense":
      return "راتب / رواتب";
    case "receivable_payment":
      return "تحصيل مستحقات";
    default:
      return category;
  }
};

function CashboxTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  );
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null
  );
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isExpenseDetailsOpen, setIsExpenseDetailsOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const per_page = Number(searchParams.get("per_page")) || PER_PAGE_DEFAULT;
  const cashboxIdParam = searchParams.get("cashbox_id") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const sort = (searchParams.get("sort") as "asc" | "desc") || "desc";

  const params = useMemo(
    () => ({
      page,
      per_page,
      cashbox_id: cashboxIdParam ? Number(cashboxIdParam) : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      sort,
    }),
    [page, per_page, cashboxIdParam, startDate, endDate, sort]
  );

  const { data, isPending, isError, error } = useQuery(
    useGetTransactionsQueryOptions(params)
  );

  const { data: paymentDetails } = useQuery(
    selectedPaymentId != null
      ? useGetPaymentByIdQueryOptions(selectedPaymentId)
      : {
          queryKey: ["payment-details-disabled"],
          queryFn: async () => undefined,
          enabled: false,
        }
  );

  const { data: expenseDetails } = useQuery(
    selectedExpenseId != null
      ? useGetExpenseByIdQueryOptions(selectedExpenseId)
      : {
          queryKey: ["expense-details-disabled"],
          queryFn: async () => undefined,
          enabled: false,
        }
  );

  const handlePageChange = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      next.set("per_page", String(per_page));
      return next;
    });
  };

  const handleFiltersChange = (updates: Record<string, string>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      // whenever filters change, reset to first page
      next.set("page", "1");
      if (!next.get("per_page")) next.set("per_page", String(per_page));
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("cashbox_id");
      next.delete("start_date");
      next.delete("end_date");
      next.set("page", "1");
      next.set("per_page", String(PER_PAGE_DEFAULT));
      next.set("sort", "desc");
      return next;
    });
  };

  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  const handleOpenPaymentDetails = (id: number) => {
    setSelectedExpenseId(null);
    setIsExpenseDetailsOpen(false);
    setSelectedPaymentId(id);
    setIsPaymentDetailsOpen(true);
  };

  const handleOpenExpenseDetails = (id: number) => {
    setSelectedPaymentId(null);
    setIsPaymentDetailsOpen(false);
    setSelectedExpenseId(id);
    setIsExpenseDetailsOpen(true);
  };

  return (
    <div dir="rtl" className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>كشف معاملات الخزنة</CardTitle>
            <CardDescription>
              عرض جميع الحركات المالية (مدفوعات ومصروفات والرواتب) المرتبطة
              بالخزائن.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className="ms-auto mt-2 h-8 gap-1.5 px-3 text-xs sm:mt-0"
          >
            <Filter className="ml-1 h-3.5 w-3.5" />
            {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
          </Button>
        </CardHeader>

        {showFilters && (
          <CardContent className="space-y-4 border-b border-border/80 bg-muted/10">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2 min-w-[220px]">
                <Label>الصندوق</Label>
                <CashboxesSelect
                  value={cashboxIdParam}
                  onChange={(val) =>
                    handleFiltersChange({ cashbox_id: val || "" })
                  }
                  placeholder="كل الصناديق"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    handleFiltersChange({ start_date: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    handleFiltersChange({ end_date: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>ترتيب حسب التاريخ</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sort === "desc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFiltersChange({ sort: "desc" })}
                  >
                    الأحدث أولاً
                  </Button>
                  <Button
                    type="button"
                    variant={sort === "asc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFiltersChange({ sort: "asc" })}
                  >
                    الأقدم أولاً
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent className="space-y-4">
          {isError && (
            <div className="flex items-center justify-center py-10 text-red-500 text-sm">
              حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
              {error && <span className="ms-2 text-xs">{String(error)}</span>}
            </div>
          )}

          {!isError && (
            <div className="table-responsive-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                    <TableHead className="text-center">الصندوق</TableHead>
                    <TableHead className="text-center">نوع الحركة</TableHead>
                    <TableHead className="text-center">التصنيف</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">المبلغ</TableHead>
                    <TableHead className="text-center">
                      الرصيد قبل الحركة
                    </TableHead>
                    <TableHead className="text-center">
                      الرصيد بعد الحركة
                    </TableHead>
                    <TableHead className="text-center">المستخدم</TableHead>
                    <TableHead className="text-center">التفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="py-10 text-center text-muted-foreground"
                      >
                        جاري تحميل كشف المعاملات...
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((tx, idx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-center">
                          {(page - 1) * per_page + idx + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDateTime(tx.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.cashbox?.name ?? `#${tx.cashbox_id}`}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              tx.type === "income"
                                ? "inline-flex items-center gap-1 text-green-600"
                                : "inline-flex items-center gap-1 text-red-600"
                            }
                          >
                            {tx.type === "income" ? (
                              <ArrowDownCircle className="h-4 w-4" />
                            ) : (
                              <ArrowUpCircle className="h-4 w-4" />
                            )}
                            {tx.type === "income" ? "إيراد" : "مصروف"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getCategoryLabel(tx.category)}
                        </TableCell>
                        <TableCell className="text-center max-w-[260px]">
                          <span className="line-clamp-2">
                            {tx.description || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {formatMoney(tx.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatMoney(tx.cashbox_balance_before)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatMoney(tx.balance_after)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.creator?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.reference_type?.includes("Payment") &&
                          tx.reference_id ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تفاصيل الدفعة"
                              onClick={() =>
                                handleOpenPaymentDetails(tx.reference_id as number)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : tx.reference_type?.includes("Expense") &&
                            tx.reference_id ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تفاصيل المصروف"
                              onClick={() =>
                                handleOpenExpenseDetails(tx.reference_id as number)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد معاملات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            إجمالي المعاملات: {total}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem className="font-medium">
                صفحة {page} من {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  aria-disabled={page === totalPages || isPending}
                  className={
                    page === totalPages || isPending
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
      {/* Payment Details from transactions */}
      {isPaymentDetailsOpen && paymentDetails && (
        <PaymentDetailsModal
          payment={paymentDetails}
          open={isPaymentDetailsOpen}
          onOpenChange={(open) => {
            setIsPaymentDetailsOpen(open);
            if (!open) setSelectedPaymentId(null);
          }}
        />
      )}

      {/* Expense Details from transactions */}
      {isExpenseDetailsOpen && (
        <ExpenseDetailsModal
          open={isExpenseDetailsOpen}
          onOpenChange={(open) => {
            setIsExpenseDetailsOpen(open);
            if (!open) setSelectedExpenseId(null);
          }}
          expense={expenseDetails ?? null}
        />
      )}
    </div>
  );
}

export default CashboxTransactions;

