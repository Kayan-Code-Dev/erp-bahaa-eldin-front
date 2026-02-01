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
import { FactoriesTableSkeleton } from "./FactoriesTableSkeleton";
import { CreateFactoryModal } from "./CreateFactoryModal";
import { EditFactoryModal } from "./EditFactoryModal";
import { DeleteFactoryModal } from "./DeleteFactoryModal";

import {
  useExportFactoriesToCSVMutationOptions,
  useGetFactoriesQueryOptions,
} from "@/api/v2/factories/factories.hooks";
import { TFactoryResponse } from "@/api/v2/factories/factories.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

function Factory() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<TFactoryResponse | null>(
    null
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetFactoriesQueryOptions(page, per_page)
  );

  // Export Mutation
  const { mutate: exportFactoriesToCSV, isPending: isExporting } = useMutation(
    useExportFactoriesToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (factory: TFactoryResponse) => {
    setSelectedFactory(factory);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (factory: TFactoryResponse) => {
    setSelectedFactory(factory);
    setIsDeleteModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportFactoriesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `factories-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير المصانع بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير المصانع. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة المصانع</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء المصانع في النظام.
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
              إنشاء مصنع جديد
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
                    <TableHead className="text-center">كود المصنع</TableHead>
                    <TableHead className="text-center">اسم المصنع</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">المخزن</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <FactoriesTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((factory) => (
                      <TableRow key={factory.id}>
                        <TableCell className="text-center">
                          {factory.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {factory.factory_code}
                        </TableCell>
                        <TableCell className="text-center">
                          {factory.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {factory.address?.street} {factory.address?.building}{" "}
                          {factory.address?.city?.name}{" "}
                          {factory.address?.city?.country?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {factory.inventory?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(factory)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(factory)}
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
                        لا توجد مصانع لعرضها.
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
            totalElementsLabel="إجمالي المصانع"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateFactoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditFactoryModal
        factory={selectedFactory}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteFactoryModal
        factory={selectedFactory}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

export default Factory;
