import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Banknote, Building2, FileBarChart, Users, Wallet, X } from "lucide-react";
import { useGetBranchesQueryOptions } from "@/api/v2/branches/branches.hooks";
import { useGetEmployeesQueryOptions } from "@/api/v2/employees/employees.hooks";
import {
  TEmployee,
  TEmploymentType,
  TGetEmployeesParams,
} from "@/api/v2/employees/employees.types";
import { TBranchResponse } from "@/api/v2/branches/branches.types";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  intern: "متدرّب",
};

function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "-";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2 })} ج.م`;
}

function getEmploymentTypeLabel(type: TEmploymentType | string | null | undefined): string {
  if (!type) return "-";
  return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}

function groupEmployeesByBranch(
  employees: TEmployee[],
  branches: TBranchResponse[]
): Map<number, TEmployee[]> {
  const byBranch = new Map<number, TEmployee[]>();
  for (const branch of branches) {
    byBranch.set(branch.id, []);
  }
  for (const emp of employees) {
    const empBranches = emp.branches ?? [];
    for (const b of empBranches) {
      const list = byBranch.get(b.id);
      if (list) list.push(emp);
    }
  }
  return byBranch;
}

function EmployeePayrollSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlBranchId = searchParams.get("branch_id") ?? "";
  const urlPage = Number(searchParams.get("page")) || 1;
  const [selectedBranchId, setSelectedBranchId] = useState<string>(urlBranchId);
  const [page, setPage] = useState(urlPage);

  useEffect(() => {
    setSelectedBranchId(urlBranchId);
  }, [urlBranchId]);

  useEffect(() => {
    setPage(urlPage);
  }, [urlPage]);

  const { data: branchesData } = useQuery(
    useGetBranchesQueryOptions(1, 200)
  );
  const branches = useMemo(
    () => branchesData?.data ?? [],
    [branchesData?.data]
  );

  const queryParams: TGetEmployeesParams = useMemo(() => {
    const params: TGetEmployeesParams = {
      page: selectedBranchId ? page : 1,
      per_page: selectedBranchId ? 10 : 500,
    };
    if (selectedBranchId) {
      params.branch_id = Number(selectedBranchId);
    }
    return params;
  }, [selectedBranchId, page]);

  const { data: employeesData, isPending, isError, error } = useQuery(
    useGetEmployeesQueryOptions(queryParams)
  );
  const employees = useMemo(
    () => employeesData?.data ?? [],
    [employeesData?.data]
  );
  const totalPages = employeesData?.total_pages ?? 1;
  const totalCount = employeesData?.total ?? 0;

  const employeesByBranch = useMemo(() => {
    if (selectedBranchId) return new Map<number, TEmployee[]>();
    return groupEmployeesByBranch(employees, branches);
  }, [employees, branches, selectedBranchId]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedBranchId("");
    setPage(1);
    setSearchParams({ page: "1" }, { replace: true });
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("branch_id", value);
        else next.delete("branch_id");
        next.set("page", "1");
        return next;
      },
      { replace: true }
    );
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(1, page - 1);
    setPage(newPage);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(newPage));
        return next;
      },
      { replace: true }
    );
  };
  const handleNextPage = () => {
    const newPage = Math.min(page + 1, totalPages);
    setPage(newPage);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(newPage));
        return next;
      },
      { replace: true }
    );
  };

  const handlePaySalary = (employee: TEmployee) => {
    toast.info("صرف راتب", {
      description: `الموظف: ${employee.user?.name ?? employee.employee_code}`,
    });
  };

  const handlePayAdvance = (employee: TEmployee) => {
    toast.info("صرف سلفة", {
      description: `الموظف: ${employee.user?.name ?? employee.employee_code}`,
    });
  };

  return (
    <div dir="rtl" className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-6 w-6 text-primary" />
              كشف رواتب الموظفين
            </CardTitle>
            <CardDescription>
              عرض الموظفين حسب الفرع مع إجراءات صرف الراتب وصرف السلفة.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="branch_filter" className="text-sm font-medium whitespace-nowrap">
              الفرع:
            </Label>
            <BranchesSelect
              value={selectedBranchId}
              onChange={(value) => {
                handleBranchChange(value);
                handleFilterChange();
              }}
              className="w-[240px]"
            />
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardHeader>

        {isError && (
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 py-8 text-center">
              <p className="text-sm font-medium text-destructive">
                حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
              </p>
              <p className="text-xs text-muted-foreground">{error?.message}</p>
            </div>
          </CardContent>
        )}

        {!isError && (
          <CardContent>
            {selectedBranchId ? (
              <div className="table-responsive-wrapper">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-14">#</TableHead>
                      <TableHead className="text-center">كود الموظف</TableHead>
                      <TableHead className="text-center">اسم الموظف</TableHead>
                      <TableHead className="text-center">الراتب الأساسي</TableHead>
                      <TableHead className="text-center">رصيد الإجازات</TableHead>
                      <TableHead className="text-center">نوع التوظيف</TableHead>
                      <TableHead className="text-center">تاريخ التعيين</TableHead>
                      <TableHead className="text-center min-w-[240px]">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPending ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-10 text-center text-muted-foreground"
                        >
                          جاري التحميل...
                        </TableCell>
                      </TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-10 text-center text-muted-foreground"
                        >
                          لا يوجد موظفين في هذا الفرع.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((emp, idx) => (
                        <TableRow key={emp.id}>
                          <TableCell className="text-center font-medium">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            {emp.employee_code}
                          </TableCell>
                          <TableCell className="text-center">
                            {emp.user?.name ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatMoney((emp as { base_salary?: string | number }).base_salary)}
                          </TableCell>
                          <TableCell className="text-center">
                            {(emp as { vacation_days_balance?: number }).vacation_days_balance ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {getEmploymentTypeLabel((emp as { employment_type?: string }).employment_type)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate((emp as { hire_date?: string }).hire_date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handlePaySalary(emp)}
                              >
                                <Banknote className="h-4 w-4" />
                                صرف راتب
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handlePayAdvance(emp)}
                              >
                                <Wallet className="h-4 w-4" />
                                صرف سلفة
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-6">
                {branches.map((branch) => {
                  const list = employeesByBranch.get(branch.id) ?? [];
                  if (list.length === 0) return null;
                  return (
                    <div
                      key={branch.id}
                      className="rounded-lg border bg-muted/30 overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-3 border-b bg-muted/50 px-4 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-1 flex-wrap items-center gap-2 gap-y-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {branch.name}
                          </h3>
                          <Badge variant="secondary" className="font-mono text-xs font-normal">
                            {branch.branch_code}
                          </Badge>
                          <Badge variant="outline" className="gap-1 font-normal">
                            <Users className="h-3.5 w-3.5" />
                            {list.length} موظف
                          </Badge>
                        </div>
                      </div>
                      <div className="table-responsive-wrapper">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center w-14">#</TableHead>
                              <TableHead className="text-center">كود الموظف</TableHead>
                              <TableHead className="text-center">اسم الموظف</TableHead>
                              <TableHead className="text-center">الراتب الأساسي</TableHead>
                              <TableHead className="text-center">رصيد الإجازات</TableHead>
                              <TableHead className="text-center">نوع التوظيف</TableHead>
                              <TableHead className="text-center">تاريخ التعيين</TableHead>
                              <TableHead className="text-center min-w-[240px]">
                                الإجراءات
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {list.map((emp, idx) => (
                              <TableRow key={emp.id}>
                                <TableCell className="text-center font-medium">
                                  {idx + 1}
                                </TableCell>
                                <TableCell className="text-center">
                                  {emp.employee_code}
                                </TableCell>
                                <TableCell className="text-center">
                                  {emp.user?.name ?? "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatMoney((emp as { base_salary?: string | number }).base_salary)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {(emp as { vacation_days_balance?: number }).vacation_days_balance ?? "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getEmploymentTypeLabel((emp as { employment_type?: string }).employment_type)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatDate((emp as { hire_date?: string }).hire_date)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      className="gap-1.5"
                                      onClick={() => handlePaySalary(emp)}
                                    >
                                      <Banknote className="h-4 w-4" />
                                      صرف راتب
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5"
                                      onClick={() => handlePayAdvance(emp)}
                                    >
                                      <Wallet className="h-4 w-4" />
                                      صرف سلفة
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
                {isPending && (
                  <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                    جاري التحميل...
                  </div>
                )}
                {!isPending && branches.length > 0 && employees.length === 0 && (
                  <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                    لا يوجد موظفين مرتبطين بفروع.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}

        {!isError && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              إجمالي الموظفين:{" "}
              <span className="font-medium text-foreground">
                {selectedBranchId ? totalCount : employees.length}
              </span>
            </p>
            {selectedBranchId && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePreviousPage();
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
                        handleNextPage();
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
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default EmployeePayrollSheet;
