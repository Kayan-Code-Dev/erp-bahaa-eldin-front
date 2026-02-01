import {
  useDeleteEmployeeCustodyMutationOptions,
  useGetOverdueEmployeeCustodiesQueryOptions,
} from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TEmployeeCustody } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import CustomPagination from "@/components/custom/CustomPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/utils/formatDate";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { EmployeeCustodyDetailsModal } from "./EmployeeCustodyDetailsModal";
import { MarkAsDamagedModal } from "./MarkAsDamagedModal";
import { MarkAsLostModal } from "./MarkAsLostModal";
import { MarkAsReturnedModal } from "./MarkAsReturnedModal";

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

function OverdueEmployeeCustodies() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReturnedModalOpen, setIsReturnedModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isDamagedModalOpen, setIsDamagedModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedEmployeeCustody, setSelectedEmployeeCustody] =
    useState<TEmployeeCustody | null>(null);

  const { data, isPending, isError, error } = useQuery(
    useGetOverdueEmployeeCustodiesQueryOptions(page, per_page)
  );

  // Delete mutation
  const { mutate: deleteEmployeeCustody, isPending: isDeleting } = useMutation(
    useDeleteEmployeeCustodyMutationOptions()
  );

  // --- Modal Action Handlers ---
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
            <CardTitle>الضمانات المتأخرة</CardTitle>
            <CardDescription>
              عرض الضمانات التي تجاوزت تاريخ الإرجاع المتوقع.
            </CardDescription>
          </div>
          <Button variant="outline">
            <Link to="/employees/custodies" className="flex items-center gap-2">
              العودة إلى جميع الضمانات
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

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
                        <TableCell className="text-center text-red-600 font-medium">
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
                        لا توجد ضمانات متأخرة لعرضها.
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
            totalElementsLabel="إجمالي الضمانات المتأخرة"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
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
    </div>
  );
}

export default OverdueEmployeeCustodies;
