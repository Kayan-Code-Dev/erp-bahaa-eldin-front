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
import { Pencil, Trash2, Plus, UserRound } from "lucide-react";
import { JobTitlesTableSkeleton } from "./JobTitlesTableSkeleton";
import { CreateJobTitleModal } from "./CreateJobTitleModal";
import { EditJobTitleModal } from "./EditJobTitleModal";
import { DeleteJobTitleModal } from "./DeleteJobTitleModal";
import { ManageJobTitleRolesModal } from "./ManageJobTitleRolesModal";
import { useQuery } from "@tanstack/react-query";
import { TJobTitle } from "@/api/v2/content-managment/job-titles/job-titles.types";
import {
  useGetJobTitlesQueryOptions,
} from "@/api/v2/content-managment/job-titles/job-titles.hooks";
import { TGetJobTitlesParams } from "@/api/v2/content-managment/job-titles/job-titles.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { JobTitlesLevelsSelect } from "@/components/custom/job-titles-levels-select";

function JobTitles() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TGetJobTitlesParams>({
    page: 1,
    per_page: 10,
  });

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<TJobTitle | null>(null);

  // Data Fetching
  const queryParams: TGetJobTitlesParams = {
    ...filters,
    page,
    per_page: 10,
  };
  const { data, isPending, isError, error } = useQuery(
    useGetJobTitlesQueryOptions(queryParams)
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Filter Handlers ---
  const handleFilterChange = (key: keyof TGetJobTitlesParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" || value === "" ? undefined : value,
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
  const handleOpenEdit = (jobTitle: TJobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (jobTitle: TJobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsDeleteModalOpen(true);
  };
  const handleOpenJobTitleRoles = (jobTitle: TJobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsRolesModalOpen(true);
  };
  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة المسميات الوظيفية</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء المسميات الوظيفية في النظام.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء مسمى وظيفي جديد
          </Button>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="department_id_filter">القسم:</Label>
              <DepartmentsSelect
                value={filters.department_id ? String(filters.department_id) : ""}
                onChange={(value) =>
                  handleFilterChange("department_id", value ? Number(value) : undefined)
                }
                placeholder="جميع الأقسام"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="level_filter">المستوى:</Label>
              <JobTitlesLevelsSelect
                value={filters.level || ""}
                onChange={(value) => handleFilterChange("level", value || undefined)}
                placeholder="جميع المستويات"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

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
                    <TableHead className="text-center">اسم المسمية الوظيفية</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">القسم</TableHead>
                    <TableHead className="text-center">المستوى</TableHead>
                    <TableHead className="text-center">الراتب الأدنى</TableHead>
                    <TableHead className="text-center">الراتب الأعلى</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <JobTitlesTableSkeleton rows={7} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((jobTitle) => (
                      <TableRow key={jobTitle.id}>
                        <TableCell className="text-center">
                          {jobTitle.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {jobTitle.code}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {jobTitle.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="mx-auto max-w-[300px] text-wrap">
                            {jobTitle.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {jobTitle.department?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {jobTitle.level || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {jobTitle.min_salary?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {jobTitle.max_salary?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={jobTitle.is_active ? "default" : "secondary"}
                            className={
                              jobTitle.is_active ? "bg-green-600 text-white" : ""
                            }
                          >
                            {jobTitle.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(jobTitle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(jobTitle)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="الصلاحيات"
                              onClick={() => handleOpenJobTitleRoles(jobTitle)}
                            >
                              <UserRound className="h-4 w-4" />
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
                        لا توجد مسميات وظيفية لعرضها.
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
            إجمالي المسميات الوظيفية: {data?.total || 0}
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
      <CreateJobTitleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditJobTitleModal
        jobTitle={selectedJobTitle}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteJobTitleModal
        jobTitle={selectedJobTitle}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
      <ManageJobTitleRolesModal
        jobTitle={selectedJobTitle}
        open={isRolesModalOpen}
        onOpenChange={setIsRolesModalOpen}
      />
    </div>
  );
}

export default JobTitles;
