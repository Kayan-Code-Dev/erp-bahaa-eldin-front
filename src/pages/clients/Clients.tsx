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
import { Download, Filter, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientsTableSkeleton } from "./ClientsTableSkeleton";
import { CreateClientModal } from "./CreateClientModal";
import { EditClientModal } from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";

import {
  useExportClientsToCSVMutationOptions,
  useGetClientsQueryOptions,
} from "@/api/v2/clients/clients.hooks";
import { TClientResponse } from "@/api/v2/clients/clients.types";
import {
  parseFilenameFromContentDisposition,
  downloadBlob,
} from "@/api/api.utils";
import { formatPhone } from "@/utils/formatPhone";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;
  const source = searchParams.get("source") || undefined;
  const dateOfBirthFrom = searchParams.get("date_of_birth_from") || undefined;
  const dateOfBirthTo = searchParams.get("date_of_birth_to") || undefined;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<TClientResponse | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  const listParams = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(source ? { source } : {}),
      ...(dateOfBirthFrom ? { date_of_birth_from: dateOfBirthFrom } : {}),
      ...(dateOfBirthTo ? { date_of_birth_to: dateOfBirthTo } : {}),
    }),
    [search, source, dateOfBirthFrom, dateOfBirthTo]
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetClientsQueryOptions(page, per_page, Object.keys(listParams).length ? listParams : undefined)
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

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value?.trim()) next.set(key, value.trim());
      else next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("source");
      next.delete("date_of_birth_from");
      next.delete("date_of_birth_to");
      next.set("page", "1");
      return next;
    });
  };

  const handleExport = () => {
    exportClientsToCSV(listParams, {
      onSuccess: (result) => {
        const filename =
          parseFilenameFromContentDisposition(result.headers) || "clients.xlsx";
        downloadBlob(result.data, filename);
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
    <div dir="rtl" className="w-full">
      <Card className="w-full">
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
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="ml-2 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="ml-2 h-4 w-4" />
              {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء عميل جديد
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
        <CardContent className="border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>بحث:</Label>
              <Input
                placeholder="اسم، هوية، هاتف..."
                value={search ?? ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>المصدر:</Label>
              <Input
                placeholder="مصدر العميل"
                value={source ?? ""}
                onChange={(e) => setFilter("source", e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>تاريخ الميلاد من:</Label>
              <Input
                type="date"
                value={dateOfBirthFrom ?? ""}
                onChange={(e) => setFilter("date_of_birth_from", e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>إلى:</Label>
              <Input
                type="date"
                value={dateOfBirthTo ?? ""}
                onChange={(e) => setFilter("date_of_birth_to", e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
        )}

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
            <div className="table-responsive-wrapper">
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
