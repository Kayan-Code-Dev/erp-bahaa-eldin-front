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
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BranchesTableSkeleton } from "./BranchesTableSkeleton";
import { CreateBranchModal } from "./CreateBranchModal";
import { EditBranchModal } from "./EditBranchModal";

import {
  useDeleteBranchMutationOptions,
  useExportBranchesToCSVQueryOptions,
  useGetBranchesQueryOptions,
} from "@/api/v2/branches/branches.hooks";
import { TBranchResponse } from "@/api/v2/branches/branches.types";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

function BranchManger() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<TBranchResponse | null>(
    null
  );

  const { mutate: exportBranchesToCSV, isPending: isExporting } = useMutation(
    useExportBranchesToCSVQueryOptions()
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetBranchesQueryOptions(page, per_page)
  );

  // Mutations
  const { mutate: deleteBranch, isPending: isDeleting } = useMutation(
    useDeleteBranchMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (branch: TBranchResponse) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (branch: TBranchResponse) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
  };

  // --- Confirmation Handlers ---
  const handleDelete = (onCloseModal: () => void) => {
    if (selectedBranch) {
      deleteBranch(selectedBranch.id, {
        onSuccess: () => {
          toast.success("تم حذف الفرع بنجاح");
          onCloseModal();
        },
        onError: (error: any) => {
          toast.error("خطأ أثناء حذف الفرع. الرجاء المحاولة مرة أخرى.", {
            description: error.message,
          });
        },
      });
    }
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportBranchesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `branches-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الفروع بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الفروع. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة الفروع</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الفروع في النظام.
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
              إنشاء فرع جديد
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

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">كود الفرع</TableHead>
                    <TableHead className="text-center">اسم الفرع</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">المخزن</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <BranchesTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="text-center">
                          {branch.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {branch.branch_code}
                        </TableCell>
                        <TableCell className="text-center">
                          {branch.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {branch.address?.street} {branch.address?.building}{" "}
                          {branch.address?.city?.name}{" "}
                          {branch.address?.city?.country?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {branch.inventory?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(branch)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(branch)}
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
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد فروع لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي الفروع"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateBranchModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditBranchModal
        branch={selectedBranch}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف الفرع"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف الفرع{" "}
            <strong>{selectedBranch?.name}</strong>؟
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

export default BranchManger;
