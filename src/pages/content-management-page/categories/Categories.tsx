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
import { toast } from "sonner";
import { CategoriesTableSkeleton } from "./CategoriesTableSkeleton";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";

import { useQuery, useMutation } from "@tanstack/react-query";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { TCategory } from "@/api/v2/content-managment/category/category.type";
import {
  useCategoriesQueryOptions,
  useDeleteCategoryMutationOptions,
  useExportCategoriesToCSVMutationOptions,
} from "@/api/v2/content-managment/category/category.hooks";
import { useSearchParams } from "react-router";
import CustomPagination from "@/components/custom/CustomPagination";

function Categories() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page"));
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useCategoriesQueryOptions(page || 1, per_page)
  );

  // Mutations
  const { mutate: deleteCategory, isPending: isDeleting } = useMutation(
    useDeleteCategoryMutationOptions()
  );
  const { mutate: exportCategoriesToCSV, isPending: isExporting } = useMutation(
    useExportCategoriesToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (category: TCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (category: TCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  // --- Confirmation Handlers ---
  const handleDelete = (onCloseModal: () => void) => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id, {
        onSuccess: () => {
          toast.success("تم حذف الفئة بنجاح");
          onCloseModal();
        },
        onError: (error: any) => {
          toast.error("خطأ أثناء حذف الفئة. الرجاء المحاولة مرة أخرى.", {
            description: error.message,
          });
        },
      });
    }
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportCategoriesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `categories-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الفئات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الفئات. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة الفئات</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الفئات في النظام.
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
              إنشاء فئة جديدة
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

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <CategoriesTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="text-center">
                          {category.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(category)}
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
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد فئات لعرضها.
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
            totalElementsLabel="إجمالي الفئات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateCategoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditCategoryModal
        category={selectedCategory}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف الفئة"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف الفئة{" "}
            <strong>{selectedCategory?.name}</strong>؟
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

export default Categories;
