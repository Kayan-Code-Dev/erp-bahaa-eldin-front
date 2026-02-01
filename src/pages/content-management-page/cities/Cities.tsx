import { useState } from "react";

// Shadcn Components
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
import { Download, Pencil, Trash2, Plus } from "lucide-react";
import { CreateCityModal } from "./CreateCityModal";
import { DeleteCityModal } from "./DeleteCityModal";
import { EditCityModal } from "./EditCityModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { TCity } from "@/api/v2/content-managment/city/city.types";
import {
  useCitiesQueryOptions,
  useExportCitiesToCSVMutationOptions,
} from "@/api/v2/content-managment/city/city.hooks";

// Import Modals

function Cities() {
  const [page, setPage] = useState(1);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<TCity | null>(null);

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(useCitiesQueryOptions(page, per_page));

  // Export Mutation
  const { mutate: exportCitiesToCSV, isPending: isExporting } = useMutation(
    useExportCitiesToCSVMutationOptions()
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Modal Action Handlers ---
  const handleOpenEdit = (city: TCity) => {
    setSelectedCity(city);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (city: TCity) => {
    setSelectedCity(city);
    setIsDeleteModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportCitiesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `cities-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير المدن بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير المدن. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة المدن</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء المدن في النظام.
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
              إنشاء مدينة جديدة
            </Button>
          </div>
        </CardHeader>

        {isError && (
          <CardContent>
            <div className="flex items-center justify-center">
              <p className="text-red-500">حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.</p>
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
                  <TableHead className="text-center">اسم المدينة</TableHead>
                  <TableHead className="text-center">الدولة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <CitiesTableSkeleton rows={7} />
                ) : data && data.data.length > 0 ? (
                  data.data.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="text-center">
                        {city.id}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {city.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {city.country.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="تعديل"
                            onClick={() => handleOpenEdit(city)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="حذف"
                            onClick={() => handleOpenDelete(city)}
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
                      لا توجد مدن لعرضها.
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
            إجمالي المدن: {data?.total || 0}
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
      <CreateCityModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditCityModal
        city={selectedCity}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteCityModal
        city={selectedCity}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

// Helper skeleton component
function CitiesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="h-5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-12" />
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

export default Cities;
