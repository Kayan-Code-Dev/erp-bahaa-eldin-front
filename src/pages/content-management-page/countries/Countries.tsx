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
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { TCountry } from "@/api/v2/content-managment/country/country.types";
import {
  useCoutriesQueryOptions,
  useExportCountriesToCSVMutationOptions,
} from "@/api/v2/content-managment/country/country.hooks";
import { CreateCountryModal } from "./CreateCountryModal";
import { EditCountryModal } from "./EditCountryModal";
import { DeleteCountryModal } from "./DeleteCountryModal";

function Countries() {
  const [page, setPage] = useState(1);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<TCountry | null>(null);

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(useCoutriesQueryOptions(page, per_page));

  // Export Mutation
  const { mutate: exportCountriesToCSV, isPending: isExporting } = useMutation(
    useExportCountriesToCSVMutationOptions()
  );

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // --- Modal Action Handlers ---
  const handleOpenEdit = (country: TCountry) => {
    setSelectedCountry(country);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (country: TCountry) => {
    setSelectedCountry(country);
    setIsDeleteModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportCountriesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `countries-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الدول بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الدول. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة الدول</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الدول في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <Download className="ml-2 h-4 w-4" />
              {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="ml-2 h-4 w-4" />
              إنشاء دولة جديدة
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
                  <TableHead className="text-center">اسم الدولة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <CountriesTableSkeleton rows={5} />
                ) : data && data.data.length > 0 ? (
                  data.data.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell className="text-center">
                        {country.id}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {country.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="تعديل"
                            onClick={() => handleOpenEdit(country)}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="حذف"
                            onClick={() => handleOpenDelete(country)}
                            className="cursor-pointer"
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
                      colSpan={3}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد دول لعرضها.
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
            إجمالي الدول: {data?.total || 0}
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
      <CreateCountryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditCountryModal
        country={selectedCountry}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteCountryModal
        country={selectedCountry}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

// Helper skeleton component
function CountriesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="h-5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
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

export default Countries;
