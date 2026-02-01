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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, X } from "lucide-react";
import { EmployeesTableSkeleton } from "./EmployeesTableSkeleton";
import { EmployeeDetailsModal } from "./EmployeeDetailsModal";
import { useGetEmployeesQueryOptions } from "@/api/v2/employees/employees.hooks";
import {
  TEmployee,
  TGetEmployeesParams,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_STATUS,
} from "@/api/v2/employees/employees.types";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesSelect } from "@/components/custom/JobTitlesSelect";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { JobTitlesLevelsSelect } from "@/components/custom/job-titles-levels-select";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { Link } from "react-router";

const getEmploymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contract: "عقد",
    intern: "متدرّب",
  };
  return labels[type] || type;
};

const getEmploymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: "نشط",
    on_leave: "في إجازة",
    suspended: "معلّق",
    terminated: "منتهي",
  };
  return labels[status] || status;
};

const getEmploymentStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    on_leave: "secondary",
    suspended: "outline",
    terminated: "destructive",
  };
  return variants[status] || "default";
};

function Employees() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TGetEmployeesParams>({
    page: 1,
    per_page: 10,
  });

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<TEmployee | null>(
    null
  );

  // Filter states
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [jobTitleId, setJobTitleId] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");
  const [employmentStatus, setEmploymentStatus] = useState<string>("");

  // Debounce search
  const debouncedSearch = useDebounce({ value: search, delay: 500 });

  // Build query params
  const queryParams: TGetEmployeesParams = useMemo(() => {
    const params: TGetEmployeesParams = {
      ...filters,
      page,
      per_page: 10,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (departmentId) {
      params.department_id = Number(departmentId);
    }
    if (jobTitleId) {
      params.job_title_id = Number(jobTitleId);
    }
    if (managerId) {
      params.manager_id = Number(managerId);
    }
    if (level) {
      params.level = level as TGetEmployeesParams["level"];
    }
    if (branchId) {
      params.branch_id = Number(branchId);
    }
    if (employmentType && employmentType !== "all") {
      params.employment_type =
        employmentType as TGetEmployeesParams["employment_type"];
    }
    if (employmentStatus && employmentStatus !== "all") {
      params.employment_status =
        employmentStatus as TGetEmployeesParams["employment_status"];
    }

    return params;
  }, [
    filters,
    page,
    debouncedSearch,
    departmentId,
    jobTitleId,
    managerId,
    level,
    branchId,
    employmentType,
    employmentStatus,
  ]);

  const { data, isPending, isError, error } = useQuery(
    useGetEmployeesQueryOptions(queryParams)
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
    setSearch("");
    setDepartmentId("");
    setJobTitleId("");
    setManagerId("");
    setLevel("");
    setBranchId("");
    setEmploymentType("");
    setEmploymentStatus("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setPage(1);
  };

  // --- Modal Action Handlers ---
  const handleOpenDetails = (employee: TEmployee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الموظفين</CardTitle>
            <CardDescription>
              عرض وتعديل وإدارة الموظفين في النظام.
            </CardDescription>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Label htmlFor="search">البحث:</Label>
              <Input
                id="search"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFilterChange();
                }}
                className="w-[250px]"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="department_filter">القسم:</Label>
              <DepartmentsSelect
                value={departmentId}
                onChange={(value) => {
                  setDepartmentId(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الأقسام"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Job Title Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="job_title_filter">المسمى الوظيفي:</Label>
              <JobTitlesSelect
                value={jobTitleId}
                onChange={(value) => {
                  setJobTitleId(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع المسميات"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Manager Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="manager_filter">المدير:</Label>
              <EmployeesSelect
                params={{ per_page: 10, level: "master_manager" as any }}
                value={managerId}
                onChange={(value) => {
                  setManagerId(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع المديرين"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="level_filter">المستوى:</Label>
              <JobTitlesLevelsSelect
                value={level}
                onChange={(value) => {
                  setLevel(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع المستويات"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="branch_filter">الفرع:</Label>
              <BranchesSelect
                value={branchId}
                onChange={(value) => {
                  setBranchId(value);
                  handleFilterChange();
                }}
                disabled={false}
              />
            </div>

            {/* Employment Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="employment_type_filter">نوع التوظيف:</Label>
              <Select
                value={employmentType || "all"}
                onValueChange={(value) => {
                  setEmploymentType(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEmploymentTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employment Status Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="employment_status_filter">حالة التوظيف:</Label>
              <Select
                value={employmentStatus || "all"}
                onValueChange={(value) => {
                  setEmploymentStatus(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {EMPLOYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getEmploymentStatusLabel(status)}
                    </SelectItem>
                  ))}
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
                    <TableHead className="text-center">كود الموظف</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">
                      البريد الإلكتروني
                    </TableHead>
                    <TableHead className="text-center">القسم</TableHead>
                    <TableHead className="text-center">
                      المسمى الوظيفي
                    </TableHead>
                    <TableHead className="text-center">المدير</TableHead>
                    <TableHead className="text-center">حالة التوظيف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <EmployeesTableSkeleton rows={7} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="text-center">
                          {employee.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.employee_code}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {employee.user.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.user.email}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.department?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.job_title?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.manager?.user?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getEmploymentStatusVariant(
                              employee.employment_status
                            )}
                          >
                            {getEmploymentStatusLabel(
                              employee.employment_status
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleOpenDetails(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل الموظف"
                            >
                              <Link to={`/employees/list/${employee.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
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
                        لا يوجد موظفون لعرضهم.
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
            إجمالي الموظفين: {data?.total || 0}
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
      <EmployeeDetailsModal
        employee={selectedEmployee}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
}

export default Employees;
