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
import { CreateWorkshopModal } from "./CreateWorkshopModal";
import { DeleteWorkshopModal } from "./DeleteWorkshopModal";
import { EditWorkshopModal } from "./EditWorkshopModal";
import { WorkshopsTableSkeleton } from "./WorkshopsTableSkeleton";

import { TWorkshopResponse } from "@/api/v2/workshop/workshop.types";
import {
  useExportWorkshopsToCSVMutationOptions,
  useGetWorkshopsQueryOptions,
} from "@/api/v2/workshop/workshops.hooks";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

function Workshop() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] =
    useState<TWorkshopResponse | null>(null);

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetWorkshopsQueryOptions(page, per_page)
  );

  // Export Mutation
  const { mutate: exportWorkshopsToCSV, isPending: isExporting } = useMutation(
    useExportWorkshopsToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (workshop: TWorkshopResponse) => {
    setSelectedWorkshop(workshop);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (workshop: TWorkshopResponse) => {
    setSelectedWorkshop(workshop);
    setIsDeleteModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportWorkshopsToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `workshops-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير الورش بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير الورش. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة الورش</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الورش في النظام.
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
              إنشاء ورشة جديدة
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
                    <TableHead className="text-center">كود الورشة</TableHead>
                    <TableHead className="text-center">اسم الورشة</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">المخزن</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <WorkshopsTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((workshop) => (
                      <TableRow key={workshop.id}>
                        <TableCell className="text-center">
                          <Link
                            to={`/workshop/${workshop.id}`}
                            className="underline hover:text-blue-700"
                          >
                            {workshop.id}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {workshop.workshop_code}
                        </TableCell>
                        <TableCell className="text-center">
                          {workshop.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {workshop.address?.street}{" "}
                          {workshop.address?.building}{" "}
                          {workshop.address?.city?.name}{" "}
                          {workshop.address?.city?.country?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {workshop.inventory?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(workshop)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(workshop)}
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
                        لا توجد ورش لعرضها.
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
            totalElementsLabel="إجمالي الورش"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateWorkshopModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditWorkshopModal
        workshop={selectedWorkshop}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteWorkshopModal
        workshop={selectedWorkshop}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

export default Workshop;
