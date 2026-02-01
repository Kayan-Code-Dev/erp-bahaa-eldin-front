import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
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
import { Label } from "@/components/ui/label";
import { Eye, Pencil, X } from "lucide-react";
import { Link } from "react-router";
import { useGetCashboxesQueryOptions } from "@/api/v2/cashboxes/cashboxes.hooks";
import { TCashboxesParams, TCashbox } from "@/api/v2/cashboxes/cashboxes.types";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditCashboxModal } from "./EditCashboxModal";
import { Skeleton } from "@/components/ui/skeleton";

function CashboxesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 justify-center">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function Cashboxes() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TCashboxesParams>({
    page: 1,
    per_page: 10,
  });

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCashbox, setSelectedCashbox] = useState<TCashbox | null>(
    null
  );

  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");

  // Build query params
  const queryParams: TCashboxesParams = useMemo(() => {
    const params: TCashboxesParams = {
      ...filters,
      page,
      per_page: 10,
    };

    if (branchId) {
      params.branch_id = Number(branchId);
    }
    if (isActive && isActive !== "all") {
      params.is_active = isActive === "true";
    }

    return params;
  }, [filters, page, branchId, isActive]);

  const { data, isPending, isError, error } = useQuery(
    useGetCashboxesQueryOptions(queryParams)
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Filter Handlers ---
  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setBranchId("");
    setIsActive("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setPage(1);
  };

  // --- Modal Action Handlers ---
  const handleOpenEdit = (cashbox: TCashbox) => {
    setSelectedCashbox(cashbox);
    setIsEditModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الصناديق</CardTitle>
            <CardDescription>
              عرض وتعديل وإدارة الصناديق في النظام.
            </CardDescription>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Branch Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="branch_filter">الفرع:</Label>
              <BranchesSelect
                value={branchId}
                onChange={(value) => {
                  setBranchId(value || "");
                  handleFilterChange();
                }}
                disabled={isPending}
              />
            </div>

            {/* Is Active Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="is_active_filter">الحالة:</Label>
              <Select
                value={isActive}
                onValueChange={(value) => {
                  setIsActive(value);
                  handleFilterChange();
                }}
                disabled={isPending}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>

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
        <CardContent>
          {!isError && (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">اسم الصندوق</TableHead>
                    <TableHead className="text-center">الفرع</TableHead>
                    <TableHead className="text-center">
                      الرصيد الأولي
                    </TableHead>
                    <TableHead className="text-center">
                      الرصيد الحالي
                    </TableHead>
                    <TableHead className="text-center">إيرادات اليوم</TableHead>
                    <TableHead className="text-center">مصروفات اليوم</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <CashboxesTableSkeleton rows={7} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((cashbox) => (
                      <TableRow key={cashbox.id}>
                        <TableCell className="text-center">
                          {cashbox.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {cashbox.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {cashbox.branch.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {cashbox.initial_balance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {cashbox.current_balance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-green-600">
                          {cashbox.today_income.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-red-600">
                          {cashbox.today_expense.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              cashbox.is_active ? "default" : "secondary"
                            }
                          >
                            {cashbox.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {cashbox.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                            >
                              <Link to={`/cashboxes/${cashbox.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل الصندوق"
                              onClick={() => handleOpenEdit(cashbox)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                        لا يوجد صناديق لعرضها.
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
            إجمالي الصناديق: {data?.total || 0}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationNext // RTL: Next arrow for previous page
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
                صفحة {page} من {data?.total_pages || 1}
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious // RTL: Previous arrow for next page
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextPage();
                  }}
                  aria-disabled={page === data?.total_pages || isPending}
                  className={
                    page === data?.total_pages || isPending
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <EditCashboxModal
        cashbox={selectedCashbox}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}

export default Cashboxes;
