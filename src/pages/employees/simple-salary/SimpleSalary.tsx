import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FileBarChart, Filter, Search, Wallet, X } from "lucide-react";
import { useGetEmployeesQueryOptions } from "@/api/v2/employees/employees.hooks";
import type { TEmployee, TGetEmployeesParams } from "@/api/v2/employees/employees.types";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { EmployeePayrollActionModal } from "./modals/EmployeePayrollActionModal";
import useDebounce from "@/hooks/useDebounce";

const PER_PAGE = 15;

function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function SimpleSalary() {
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);

  const debouncedSearch = useDebounce({ value: search, delay: 400 });

  const params: TGetEmployeesParams = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      search: debouncedSearch || undefined,
      branch_id: branchId ? Number(branchId) : undefined,
    }),
    [page, debouncedSearch, branchId]
  );

  const { data: employeesData, isPending, isError, error } = useQuery(
    useGetEmployeesQueryOptions(params)
  );

  const employees = useMemo(() => employeesData?.data ?? [], [employeesData?.data]);
  const totalPages = employeesData?.total_pages ?? 1;
  const totalCount = employeesData?.total ?? 0;

  const handleOpenPayroll = (emp: TEmployee) => {
    setSelectedEmployee({
      id: emp.id,
      name: emp.user?.name ?? emp.employee_code,
      code: emp.employee_code,
    });
    setActionModalOpen(true);
  };

  const handleClosePayroll = (open: boolean) => {
    setActionModalOpen(open);
    if (!open) setSelectedEmployee(null);
  };

  const handlePreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleClearFilters = () => {
    setBranchId("");
    setSearch("");
    setPage(1);
  };

  return (
    <div dir="rtl" className="min-h-0 w-full flex-1">
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-xl border shadow-sm">
          <CardHeader className="space-y-2 border-b border-border/80 bg-muted/20 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileBarChart className="h-5 w-5" />
                </span>
                كشف رواتب الموظفين
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
                className="ms-auto mt-1 h-8 gap-1.5 px-3 text-xs sm:mt-0"
              >
                <Filter className="ml-1 h-3.5 w-3.5" />
                {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
              </Button>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              عرض الموظفين وإجراء عمليات الراتب من عمود الإجراءات في كل صف.
            </CardDescription>
          </CardHeader>

          {showFilters && (
            <CardContent className="grid gap-4 border-b border-border/80 bg-muted/10 px-6 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-end">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">الفرع</Label>
                <BranchesSelect
                  value={branchId}
                  onChange={setBranchId}
                  className="h-9 w-full min-w-[200px] sm:w-[220px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">بحث بالاسم أو الكود</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-full pr-9 text-sm sm:min-w-[200px]"
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9">
                <X className="ml-2 h-4 w-4" />
                مسح الفلاتر
              </Button>
            </CardContent>
          )}

          {isError && (
            <CardContent className="px-6 py-12">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <FileBarChart className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">
                  حدث خطأ أثناء تحميل البيانات
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">{error?.message}</p>
              </div>
            </CardContent>
          )}

          {!isError && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/80 bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-11 w-14 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        #
                      </TableHead>
                      <TableHead className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        كود الموظف
                      </TableHead>
                      <TableHead className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        اسم الموظف
                      </TableHead>
                      <TableHead className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        الراتب الأساسي
                      </TableHead>
                      <TableHead className="h-11 min-w-[140px] px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPending ? (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="border-b border-border/40">
                            <TableCell className="h-14 px-4 text-center">
                              <span className="inline-block h-4 w-6 animate-pulse rounded bg-muted" />
                            </TableCell>
                            <TableCell className="px-4 text-center">
                              <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
                            </TableCell>
                            <TableCell className="px-4 text-center">
                              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
                            </TableCell>
                            <TableCell className="px-4 text-center">
                              <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
                            </TableCell>
                            <TableCell className="px-4 text-center">
                              <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : employees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-40 px-4 text-center text-sm text-muted-foreground"
                        >
                          لا يوجد موظفين لعرضهم. جرّب تغيير الفلاتر.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((emp, idx) => (
                        <TableRow
                          key={emp.id}
                          className="border-b border-border/40 transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="px-4 py-3 text-center text-sm font-medium tabular-nums text-foreground">
                            {(page - 1) * PER_PAGE + idx + 1}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center font-mono text-sm text-foreground">
                            {emp.employee_code}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center text-sm text-foreground">
                            {emp.user?.name ?? "—"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center text-sm font-medium tabular-nums text-foreground">
                            {formatMoney(emp.base_salary)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              className="gap-2 shadow-sm focus-visible:ring-2"
                              onClick={() => handleOpenPayroll(emp)}
                            >
                              <Wallet className="h-4 w-4" />
                              كشف الراتب
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isPending && totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    عرض {(page - 1) * PER_PAGE + 1} – {Math.min(page * PER_PAGE, totalCount)} من {totalCount}
                  </p>
                  <Pagination className="flex items-center gap-1">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePreviousPage();
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-3 text-sm font-medium">
                          {page} / {totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextPage();
                          }}
                          className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {selectedEmployee && (
        <EmployeePayrollActionModal
          open={actionModalOpen}
          onOpenChange={handleClosePayroll}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          employeeCode={selectedEmployee.code}
        />
      )}
    </div>
  );
}
