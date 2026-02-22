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
import { ClientsTableSkeleton } from "./ClientsTableSkeleton";
import { CreateClientModal } from "./CreateClientModal";
import { EditClientModal } from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";

import {
  useExportClientsToCSVMutationOptions,
  useGetClientsQueryOptions,
} from "@/api/v2/clients/clients.hooks";
import { TClientResponse } from "@/api/v2/clients/clients.types";
import { formatPhone } from "@/utils/formatPhone";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

function Clients() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TClientResponse | null>(
    null
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetClientsQueryOptions(page, per_page)
  );

  // Export Mutation
  const { mutate: exportClientsToCSV, isPending: isExporting } = useMutation(
    useExportClientsToCSVMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (client: TClientResponse) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (client: TClientResponse) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportClientsToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `clients-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير العملاء بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير العملاء. الرجاء المحاولة مرة أخرى.", {
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
            <CardTitle>إدارة العملاء</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء العملاء في النظام.
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
              إنشاء عميل جديد
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
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">تاريخ الميلاد</TableHead>
                    <TableHead className="text-center">الرقم القومي</TableHead>
                    <TableHead className="text-center">أرقام الهاتف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <ClientsTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((client: TClientResponse) => (
                      <TableRow key={client.id}>
                        <TableCell className="text-center">
                          {client.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {client.name ?? ([client.first_name, client.middle_name, client.last_name].filter(Boolean).join(" ").trim() || "—")}
                        </TableCell>
                        <TableCell className="text-center">
                          {client?.date_of_birth ? client.date_of_birth : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {client?.national_id ? client.national_id : "—"}
                        </TableCell>
                        <TableCell className="text-center" dir="ltr">
                          {client.phones?.map((p, idx) => (
                            <span key={idx} className="block" dir="ltr">
                              {formatPhone(p.phone, "-")}
                            </span>
                          )) || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(client)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(client)}
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
                        لا يوجد عملاء لعرضها.
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
            totalElementsLabel="إجمالي العملاء"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateClientModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditClientModal
        client={selectedClient}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteClientModal
        client={selectedClient}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
}

export default Clients;
