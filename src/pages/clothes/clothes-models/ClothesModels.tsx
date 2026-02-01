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
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import { CreateClothesModel } from "./CreateClothesModel";
import { DeleteClothesModel } from "./DeleteClothesModel";
import { EditClothesModel } from "./EditClothesModel";
import { useQuery } from "@tanstack/react-query";
import { TClothesModel } from "@/api/v2/clothes/clothes-models/clothes.models.types";
import { useGetClothesModelsOptions } from "@/api/v2/clothes/clothes-models/clothes.models.hooks";
import { format, parseISO } from "date-fns";
import { arEG } from "date-fns/locale";

// Helper function to format dates safely
const formatDateSafe = (dateString: string) => {
  try {
    return format(parseISO(dateString), "P", { locale: arEG });
  } catch {
    try {
      return format(new Date(dateString), "P", { locale: arEG });
    } catch {
      return dateString;
    }
  }
};

function ClothesModels() {
  const [page, setPage] = useState(1);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TClothesModel | null>(
    null
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetClothesModelsOptions(page, per_page)
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Modal Action Handlers ---
  const handleOpenEdit = (model: TClothesModel) => {
    setSelectedModel(model);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (model: TClothesModel) => {
    setSelectedModel(model);
    setIsDeleteModalOpen(true);
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة موديلات الملابس</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء موديلات الملابس في النظام.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء موديل جديد
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
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">
                      الفئات الفرعية
                    </TableHead>
                    <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <ClothesModelsTableSkeleton rows={7} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="text-center">
                          {model.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {model.code}
                        </TableCell>
                        <TableCell className="text-center">
                          {model.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div
                            className="max-w-[200px] truncate"
                            title={model.description}
                          >
                            {model.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {model.subcategories &&
                            model.subcategories.length > 0 ? (
                              model.subcategories.map((subcat) => (
                                <span
                                  key={subcat.id}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {subcat.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDateSafe(model.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(model)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(model)}
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
                        colSpan={7}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد موديلات لعرضها.
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
            إجمالي الموديلات: {data?.total || 0}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationNext
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
                <PaginationPrevious
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
      <CreateClothesModel
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditClothesModel
        model={selectedModel}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteClothesModel
        model={selectedModel}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

// Helper skeleton component
function ClothesModelsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="h-5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-center">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  ));
}

export default ClothesModels;
