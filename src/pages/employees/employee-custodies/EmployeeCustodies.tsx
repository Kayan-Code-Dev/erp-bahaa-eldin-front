import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  useGetAllEmployeeCustodiesQueryOptions,
  useDeleteEmployeeCustodyMutationOptions,
} from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import {
  TEmployeeCustody,
  TGetEmployeeCustodiesParams,
  TEmployeeCustodyStatus,
} from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeCustodyTypesSelect } from "@/components/custom/EmployeeCustodyTypesSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/custom/CustomPagination";
import { toast } from "sonner";
import { CreateEmployeeCustodyModal } from "./CreateEmployeeCustodyModal";
import { UpdateEmployeeCustodyModal } from "./UpdateEmployeeCustodyModal";
import { MarkAsReturnedModal } from "./MarkAsReturnedModal";
import { MarkAsLostModal } from "./MarkAsLostModal";
import { MarkAsDamagedModal } from "./MarkAsDamagedModal";
import { EmployeeCustodyDetailsModal } from "./EmployeeCustodyDetailsModal";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { formatDate } from "@/utils/formatDate";
import { Link } from "react-router";

const STATUS_OPTIONS: { value: TEmployeeCustodyStatus | "all"; label: string }[] = [
  { value: "all", label: "جميع الحالات" },
  { value: "assigned", label: "معين" },
  { value: "returned", label: "مرجع" },
  { value: "damaged", label: "تالف" },
  { value: "lost", label: "مفقود" },
];

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    assigned: "معين",
    returned: "مرجع",
    damaged: "تالف",
    lost: "مفقود",
  };
  return labels[status] || status;
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    assigned: "default",
    returned: "secondary",
    damaged: "destructive",
    lost: "destructive",
  };
  return variants[status] || "default";
};

function EmployeeCustodies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const [filters, setFilters] = useState<TGetEmployeeCustodiesParams>({
    page: 1,
    per_page: 10,
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReturnedModalOpen, setIsReturnedModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isDamagedModalOpen, setIsDamagedModalOpen] = useState(false);

  const [selectedEmployeeCustody, setSelectedEmployeeCustody] =
    useState<TEmployeeCustody | null>(null);

  // Filter states
  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("all");

  // Build query params
  const queryParams: TGetEmployeeCustodiesParams = useMemo(() => {
    const params: TGetEmployeeCustodiesParams = {
      ...filters,
      page,
      per_page: 10,
    };

    if (employeeId) {
      params.employee_id = Number(employeeId);
    }
    if (type) {
      params.type = type;
    }
    if (status && status !== "all") {
      params.status = status as TEmployeeCustodyStatus;
    }

    return params;
  }, [filters, page, employeeId, type, status]);

  const { data, isPending, isError, error } = useQuery(
    useGetAllEmployeeCustodiesQueryOptions(queryParams)
  );

  // Delete mutation
  const { mutate: deleteEmployeeCustody, isPending: isDeleting } = useMutation(
    useDeleteEmployeeCustodyMutationOptions()
  );

  // --- Filter Handlers ---
  const handleFilterChange = () => {
    // Reset to first page when filter changes
    setSearchParams({ page: "1" });
  };

  const handleClearFilters = () => {
    setEmployeeId("");
    setType("");
    setStatus("all");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSearchParams({ page: "1" });
  };

  // --- Modal Action Handlers ---
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDetails = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsDetailsModalOpen(true);
  };

  const handleOpenReturned = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsReturnedModalOpen(true);
  };

  const handleOpenLost = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsLostModalOpen(true);
  };

  const handleOpenDamaged = (custody: TEmployeeCustody) => {
    setSelectedEmployeeCustody(custody);
    setIsDamagedModalOpen(true);
  };

  const handleDelete = (onCloseModal: () => void) => {
    if (selectedEmployeeCustody) {
      deleteEmployeeCustody(selectedEmployeeCustody.id, {
        onSuccess: () => {
          toast.success("تم حذف الضمان بنجاح", {
            description: "تم حذف الضمان من النظام.",
          });
          onCloseModal();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء حذف الضمان", {
            description: error.message,
          });
        },
      });
    }
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة ضمانات الموظفين</CardTitle>
            <CardDescription>
              عرض وتعديل وإدارة ضمانات الموظفين في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Link to="/employees/custodies/overdue">
                الضمانات المتأخرة
              </Link>
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة ضمان جديد
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
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="type_filter">نوع الضمان:</Label>
              <EmployeeCustodyTypesSelect
                value={type}
                onChange={(value) => {
                  setType(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الأنواع"
                className="w-[200px]"
                allowClear={true}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="status_filter">الحالة:</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                    <TableHead className="text-center">الموظف</TableHead>
                    <TableHead className="text-center">نوع الضمان</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الرقم التسلسلي</TableHead>
                    <TableHead className="text-center">القيمة</TableHead>
                    <TableHead className="text-center">تاريخ التعيين</TableHead>
                    <TableHead className="text-center">تاريخ الإرجاع المتوقع</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-10 text-center">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((custody) => (
                      <TableRow key={custody.id}>
                        <TableCell className="text-center">{custody.id}</TableCell>
                        <TableCell className="text-center">
                          {custody.employee?.user?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">{custody.type}</TableCell>
                        <TableCell className="font-medium text-center">
                          {custody.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {custody.serial_number}
                        </TableCell>
                        <TableCell className="text-center">
                          {custody.value.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(custody.assigned_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(custody.expected_return_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusVariant(custody.status)}>
                            {getStatusLabel(custody.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleOpenDetails(custody)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {custody.status === "assigned" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="تعديل"
                                  onClick={() => handleOpenEdit(custody)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="تسجيل الإرجاع"
                                  onClick={() => handleOpenReturned(custody)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="تسجيل الفقدان"
                                  onClick={() => handleOpenLost(custody)}
                                >
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="تسجيل التلف"
                                  onClick={() => handleOpenDamaged(custody)}
                                >
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(custody)}
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
                        colSpan={10}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا يوجد ضمانات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي الضمانات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateEmployeeCustodyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <UpdateEmployeeCustodyModal
        employeeCustody={selectedEmployeeCustody}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف الضمان"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف الضمان{" "}
            <strong>{selectedEmployeeCustody?.name}</strong>؟
          </>
        }
        handleConfirmation={handleDelete}
        isPending={isDeleting}
        pendingLabel="جاري الحذف..."
        confirmLabel="تأكيد الحذف"
        variant="destructive"
      />
      <EmployeeCustodyDetailsModal
        employeeCustody={selectedEmployeeCustody}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
      <MarkAsReturnedModal
        employeeCustody={selectedEmployeeCustody}
        open={isReturnedModalOpen}
        onOpenChange={setIsReturnedModalOpen}
      />
      <MarkAsLostModal
        employeeCustody={selectedEmployeeCustody}
        open={isLostModalOpen}
        onOpenChange={setIsLostModalOpen}
      />
      <MarkAsDamagedModal
        employeeCustody={selectedEmployeeCustody}
        open={isDamagedModalOpen}
        onOpenChange={setIsDamagedModalOpen}
      />
    </div>
  );
}

export default EmployeeCustodies;
