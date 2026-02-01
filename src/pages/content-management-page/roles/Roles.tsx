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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2, Plus } from "lucide-react";
import { RolesTableSkeleton } from "./RolesTableSkeleton";
import { CreateRoleModal } from "./CreateRoleModal";
import { EditRoleModal } from "./EditRoleModal";
import { ViewRolePermissionsModal } from "./ViewRolePermissionsModal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TRole } from "@/api/v2/content-managment/roles/roles.types";
import {
  useGetRolesQueryOptions,
  useDeleteRoleMutationOptions,
  useExportRolesToCSVMutationOptions,
} from "@/api/v2/content-managment/roles/roles.hooks";
import { useSearchParams } from "react-router";
import CustomPagination from "@/components/custom/CustomPagination";

function Roles() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewPermissionsModalOpen, setIsViewPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<TRole | null>(null);

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetRolesQueryOptions(page, per_page)
  );

  // Mutations
  const { mutate: deleteRole, isPending: isDeleting } = useMutation(
    useDeleteRoleMutationOptions()
  );
  const { mutate: exportRolesToCSV, isPending: isExporting } = useMutation(
    useExportRolesToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (role: TRole) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (role: TRole) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  // --- Confirmation Handlers ---
  const handleDelete = (onCloseModal: () => void) => {
    if (selectedRole) {
      deleteRole(selectedRole.id, {
        onSuccess: () => onCloseModal(),
      });
    }
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportRolesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `roles-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الصلاحيات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الصلاحيات. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };
  const handleOpenViewPermissions = (role: TRole) => {
    setSelectedRole(role);
    setIsViewPermissionsModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الصلاحيات</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الصلاحيات في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="ml-2 h-4 w-4" />
              {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء صلاحية
            </Button>
          </div>
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
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center">الاذونات</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <RolesTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="text-center">{role.id}</TableCell>
                        <TableCell className="font-medium text-center">
                          {role.name}
                        </TableCell>
                        <TableCell
                          className="text-center w-[200px] max-w-[200px] break-words whitespace-normal"
                        >
                          {role.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(role.created_at).toLocaleDateString(
                            "ar-EG"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            
                            title="عرض الاذونات"
                            onClick={() => handleOpenViewPermissions(role)}
                          >
                            عرض الاذونات
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(role)}
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
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد صلاحيات لعرضها.
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
            totalElementsLabel="إجمالي الصلاحيات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateRoleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditRoleModal
        role={selectedRole}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف الصلاحية"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف الصلاحية{" "}
            <strong>{selectedRole?.name}</strong>؟
          </>
        }
        handleConfirmation={handleDelete}
        isPending={isDeleting}
        pendingLabel="جاري الحذف..."
        confirmLabel="تأكيد الحذف"
        variant="destructive"
      />
      <ViewRolePermissionsModal
        role={selectedRole}
        open={isViewPermissionsModalOpen}
        onOpenChange={setIsViewPermissionsModalOpen}
      />
    </div>
  );
}

export default Roles;
