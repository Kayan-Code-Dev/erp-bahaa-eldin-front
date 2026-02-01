import { useState } from "react";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { DepartmentsTableSkeleton } from "./DepartmentsTableSkeleton";
import { CreateDepartmentModal } from "./CreateDepartmentModal";
import { EditDepartmentModal } from "./EditDepartmentModal";
import { DeleteDepartmentModal } from "./DeleteDepartmentModal";
import { useQuery } from "@tanstack/react-query";
import { TDepartment } from "@/api/v2/content-managment/depratments/departments.types";
import {
  useDepartmentsQueryOptions,
} from "@/api/v2/content-managment/depratments/departments.hooks";
import { TGetDepartmentsParams } from "@/api/v2/content-managment/depratments/departments.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DepartmentsSelect } from "@/components/custom/departments-select";

function Departments() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TGetDepartmentsParams>({
    page: 1,
    per_page: 10,
  });

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<TDepartment | null>(null);

  // Data Fetching
  const queryParams: TGetDepartmentsParams = {
    ...filters,
    page,
    per_page: 10,
  };
  const { data, isPending, isError, error } = useQuery(
    useDepartmentsQueryOptions(queryParams)
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Filter Handlers ---
  const handleFilterChange = (key: keyof TGetDepartmentsParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      per_page: 10,
    });
    setPage(1);
  };

  // --- Modal Action Handlers ---
  const handleOpenEdit = (department: TDepartment) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (department: TDepartment) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الأقسام</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الأقسام في النظام.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء قسم جديد
          </Button>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="is_active_filter">الحالة:</Label>
              <Select
                value={filters.is_active === undefined ? "all" : filters.is_active ? "true" : "false"}
                onValueChange={(value) =>
                  handleFilterChange("is_active", value === "true" ? true : value === "false" ? false : undefined)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="with_children_filter">عرض الأقسام الفرعية:</Label>
              <Select
                value={filters.with_children === undefined ? "all" : filters.with_children ? "true" : "false"}
                onValueChange={(value) =>
                  handleFilterChange("with_children", value === "true" ? true : value === "false" ? false : undefined)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">نعم</SelectItem>
                  <SelectItem value="false">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="parent_id_filter">القسم الأب:</Label>
              <DepartmentsSelect
                value={filters.parent_id ? String(filters.parent_id) : ""}
                onChange={(value) =>
                  handleFilterChange("parent_id", value ? Number(value) : undefined)
                }
                placeholder="جميع الأقسام"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>

        {isError && (
          <CardContent>
            <div className="flex items-center justify-center">
              <p className="text-red-500">حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.</p>
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
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">اسم القسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">القسم الأب</TableHead>
                    <TableHead className="text-center">المدير</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <DepartmentsTableSkeleton rows={7} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="text-center">
                          {department.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {department.code}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {department.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="mx-auto max-w-[300px] text-wrap">
                            {department.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {department.parent?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {department.manager?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={department.is_active ? "default" : "secondary"}
                            className={
                              department.is_active ? "bg-green-600 text-white" : ""
                            }
                          >
                            {department.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(department)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(department)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد أقسام لعرضها.
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
            إجمالي الأقسام: {data?.total || 0}
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
      <CreateDepartmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditDepartmentModal
        department={selectedDepartment}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteDepartmentModal
        department={selectedDepartment}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

export default Departments;

