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
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2, CheckCircle2, Plus, X, Clock, UserX } from "lucide-react";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeDeductionTypesSelect } from "@/components/custom/employee-deduction-types-select";
import {
  useGetEmployeeDeductionsQueryOptions,
} from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { TEmployeeDeduction, TGetEmployeeDeductionsParams } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { CreateEmployeeDeductionModal } from "./modals/CreateEmployeeDeductionModal";
import { CreateLateEmployeeDeductionModal } from "./modals/CreateLateEmployeeDeductionModal";
import { CreateAbsenceEmployeeDeductionModal } from "./modals/CreateAbsenceEmployeeDeductionModal";
import { UpdateEmployeeDeductionModal } from "./modals/UpdateEmployeeDeductionModal";
import { DeleteEmployeeDeductionModal } from "./modals/DeleteEmployeeDeductionModal";
import { ShowEmployeeDeductionModal } from "./modals/ShowEmployeeDeductionModal";
import { ApproveEmployeeDeductionModal } from "./modals/ApproveEmployeeDeductionModal";
import { formatDate } from "@/utils/formatDate";

function EmployeeDeductions() {
  const [page, setPage] = useState(1);

  // Filter states
  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [period, setPeriod] = useState<string>("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateLateModalOpen, setIsCreateLateModalOpen] = useState(false);
  const [isCreateAbsenceModalOpen, setIsCreateAbsenceModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<TEmployeeDeduction | null>(null);

  // Build query params
  const queryParams: TGetEmployeeDeductionsParams = useMemo(() => {
    const params: TGetEmployeeDeductionsParams = {
      page,
      per_page: 10,
    };

    if (employeeId) {
      params.employee_id = Number(employeeId);
    }

    if (type) {
      params.type = type;
    }

    if (period) {
      params.period = period; // YYYY-MM format
    }

    return params;
  }, [page, employeeId, type, period]);

  const { data, isPending, isError, error } = useQuery(
    useGetEmployeeDeductionsQueryOptions(queryParams)
  );

  // Pagination handlers
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // Filter handlers
  const handleFilterChange = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setEmployeeId("");
    setType("");
    setPeriod("");
    setPage(1);
  };

  // Action handlers
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateLate = () => {
    setIsCreateLateModalOpen(true);
  };

  const handleOpenCreateAbsence = () => {
    setIsCreateAbsenceModalOpen(true);
  };

  const handleOpenUpdate = (deduction: TEmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setIsUpdateModalOpen(true);
  };

  const handleOpenDelete = (deduction: TEmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setIsDeleteModalOpen(true);
  };

  const handleOpenShow = (deduction: TEmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setIsShowModalOpen(true);
  };

  const handleOpenApprove = (deduction: TEmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setIsApproveModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة خصومات الموظفين</CardTitle>
            <CardDescription>
              عرض وإدارة خصومات الموظفين في النظام.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenCreate}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة خصم جديد
            </Button>
            <Button variant="outline" onClick={handleOpenCreateLate}>
              <Clock className="ml-2 h-4 w-4" />
              خصم تأخير
            </Button>
            <Button variant="outline" onClick={handleOpenCreateAbsence}>
              <UserX className="ml-2 h-4 w-4" />
              خصم غياب
            </Button>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Employee Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="employee_filter">الموظف:</Label>
              <EmployeesSelect
                params={{ per_page: 10 }}
                value={employeeId}
                onChange={(value) => {
                  setEmployeeId(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الموظفين"
                className="w-[250px]"
                allowClear={true}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="type_filter">نوع الخصم:</Label>
              <EmployeeDeductionTypesSelect
                value={type}
                onChange={(value) => {
                  setType(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الأنواع"
                className="w-[250px]"
                allowClear={true}
              />
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="period_filter">الفترة:</Label>
              <Input
                id="period_filter"
                type="month"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  handleFilterChange();
                }}
                className="w-[200px]"
                placeholder="YYYY-MM"
              />
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
                    <TableHead className="text-center">الموظف</TableHead>
                    <TableHead className="text-center">نوع الخصم</TableHead>
                    <TableHead className="text-center">السبب</TableHead>
                    <TableHead className="text-center">المبلغ</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                    <TableHead className="text-center">الفترة</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center">
                        <div className="flex items-center justify-center">
                          جاري التحميل...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((deduction) => (
                      <TableRow key={deduction.id}>
                        <TableCell className="text-center">
                          {deduction.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {deduction.employee.user.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {deduction.type}
                        </TableCell>
                        <TableCell className="text-center">
                          {deduction.reason || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {deduction.amount.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(deduction.date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {deduction.period || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <Badge
                              variant={deduction.is_applied ? "default" : "secondary"}
                            >
                              {deduction.is_applied ? "مطبق" : "غير مطبق"}
                            </Badge>
                            {deduction.approved_by && (
                              <Badge variant="outline" className="text-xs">
                                موافق عليه
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleOpenShow(deduction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل الخصم"
                              onClick={() => handleOpenUpdate(deduction)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!deduction.approved_by && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="الموافقة على الخصم"
                                onClick={() => handleOpenApprove(deduction)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="حذف الخصم"
                              onClick={() => handleOpenDelete(deduction)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                        لا توجد خصومات لعرضها.
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
            إجمالي الخصومات: {data?.total || 0}
          </div>
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
                صفحة {page} من {data?.total_pages || 1}
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
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

      {/* Modals */}
      <CreateEmployeeDeductionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <CreateLateEmployeeDeductionModal
        open={isCreateLateModalOpen}
        onOpenChange={setIsCreateLateModalOpen}
      />

      <CreateAbsenceEmployeeDeductionModal
        open={isCreateAbsenceModalOpen}
        onOpenChange={setIsCreateAbsenceModalOpen}
      />

      <UpdateEmployeeDeductionModal
        deduction={selectedDeduction}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      />

      <DeleteEmployeeDeductionModal
        deduction={selectedDeduction}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />

      <ShowEmployeeDeductionModal
        deduction={selectedDeduction}
        open={isShowModalOpen}
        onOpenChange={setIsShowModalOpen}
      />

      <ApproveEmployeeDeductionModal
        deduction={selectedDeduction}
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
      />
    </div>
  );
}

export default EmployeeDeductions;
