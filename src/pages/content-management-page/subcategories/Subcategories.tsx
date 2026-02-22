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
import { SubcategoriesTableSkeleton } from "./SubcategoriesTableSkeleton";
import { CreateSubcategoryModal } from "./CreateSubcategoryModal";
import { EditSubcategoryModal } from "./EditSubcategoryModal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TSubcategory } from "@/api/v2/content-managment/subcategory/subcategory.types";
import {
  useSubcategoriesQueryOptions,
  useDeleteSubcategoryMutationOptions,
  useExportSubcategoriesToCSVMutationOptions,
} from "@/api/v2/content-managment/subcategory/subcategory.hooks";
import { useSearchParams } from "react-router";
import CustomPagination from "@/components/custom/CustomPagination";

function Subcategories() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page"));

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<TSubcategory | null>(null);

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useSubcategoriesQueryOptions(page || 1, per_page)
  );

  // Mutations
  const { mutate: deleteSubcategory, isPending: isDeleting } = useMutation(
    useDeleteSubcategoryMutationOptions()
  );
  const { mutate: exportSubcategoriesToCSV, isPending: isExporting } = useMutation(
    useExportSubcategoriesToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (subcategory: TSubcategory) => {
    setSelectedSubcategory(subcategory);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (subcategory: TSubcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  // --- Confirmation Handlers ---
  const handleDelete = (onCloseModal: () => void) => {
    if (selectedSubcategory) {
      deleteSubcategory(selectedSubcategory.id, {
        onSuccess: () => onCloseModal(),
      });
    }
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportSubcategoriesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `subcategories-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير أقسام المنتجات الفرعية بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير أقسام المنتجات الفرعية. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة أقسام المنتجات الفرعية</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء أقسام المنتجات الفرعية في النظام.
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
              إنشاء فئة فرعية
            </Button>
          </div>
        </CardHeader>

        {isError && (
          <CardContent>
            <div className="flex items-center justify-center">
              <p className="text-red-500">
                حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
              </p>
              <p className="text-red-500">{error.message}</p>
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
                    <TableHead className="text-center">
                      قسم المنتجات الرئيسي
                    </TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <SubcategoriesTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((subcategory) => (
                      <TableRow key={subcategory.id}>
                        <TableCell className="text-center">
                          {subcategory.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {subcategory.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {subcategory.category?.name || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {subcategory.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(subcategory)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(subcategory)}
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
                        لا توجد فئات فرعية لعرضها.
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
            totalElementsLabel="إجمالي أقسام المنتجات الفرعية"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateSubcategoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditSubcategoryModal
        subcategory={selectedSubcategory}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف قسم المنتجات الفرعي"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف قسم المنتجات الفرعي{" "}
            <strong>{selectedSubcategory?.name}</strong>؟
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

export default Subcategories;
