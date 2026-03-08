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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchesTableSkeleton } from "./BranchesTableSkeleton";
import { CreateBranchModal } from "./CreateBranchModal";
import { EditBranchModal } from "./EditBranchModal";

import {
  useDeleteBranchMutationOptions,
  useExportBranchesToCSVQueryOptions,
  useGetBranchesQueryOptions,
} from "@/api/v2/branches/branches.hooks";
import { TBranchResponse } from "@/api/v2/branches/branches.types";
import {
  parseFilenameFromContentDisposition,
  downloadBlob,
} from "@/api/api.utils";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

function BranchManger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;
  const vatEnabledParam = searchParams.get("vat_enabled");

  const listParams = useMemo(() => {
    const p: { search?: string; vat_enabled?: boolean } = {};
    if (search?.trim()) p.search = search.trim();
    if (vatEnabledParam === "true") p.vat_enabled = true;
    if (vatEnabledParam === "false") p.vat_enabled = false;
    return Object.keys(p).length ? p : undefined;
  }, [search, vatEnabledParam]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<TBranchResponse | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  const { mutate: exportBranchesToCSV, isPending: isExporting } = useMutation(
    useExportBranchesToCSVQueryOptions()
  );

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value !== "" && value !== "all") next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("vat_enabled");
      next.set("page", "1");
      return next;
    });
  };

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetBranchesQueryOptions(page, per_page, listParams)
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

  const handleExport = () => {
    exportBranchesToCSV(listParams, {
      onSuccess: (result) => {
        if (!result) return;
        const filename =
          parseFilenameFromContentDisposition(result.headers) || "branches.xlsx";
        downloadBlob(result.data, filename);
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
    <div dir="rtl" className="w-full">
      <Card className="w-full">
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
              إنشاء فرع جديد
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
        <CardContent className="border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>بحث:</Label>
              <Input
                placeholder="اسم، كود، هاتف، عملة..."
                value={search ?? ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-[220px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>ضريبة القيمة المضافة:</Label>
              <Select
                value={vatEnabledParam ?? "all"}
                onValueChange={(v) => setFilter("vat_enabled", v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">مفعّل</SelectItem>
                  <SelectItem value="false">غير مفعّل</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead className="text-center">صورة الفرع</TableHead>
                    <TableHead className="text-center">كود الفرع</TableHead>
                    <TableHead className="text-center">اسم الفرع</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">المخزن</TableHead>
                    <TableHead className="text-center">العملة</TableHead>
                    <TableHead className="text-center">الضريبة (VAT)</TableHead>
                    <TableHead className="text-center">رقم الهاتف</TableHead>
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
                        <TableCell className="text-center">
                          <img
                            src={
                              (branch.image_url || (branch.image as string)) ??
                              "/dressnmore-logo.jpg"
                            }
                            alt={branch.name}
                            className="mx-auto h-10 w-10 rounded-full object-cover border"
                          />
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
                        <TableCell className="text-center">
                          {branch.currency_name ||
                          branch.currency_code ||
                          branch.currency_symbol
                            ? `${branch.currency_name ?? ""}${
                                branch.currency_code
                                  ? ` (${branch.currency_code})`
                                  : ""
                              }${
                                branch.currency_symbol
                                  ? ` ${branch.currency_symbol}`
                                  : ""
                              }`.trim()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {branch.vat_enabled
                            ? branch.vat_type && branch.vat_value != null
                              ? branch.vat_type === "percentage"
                                ? `${branch.vat_value}% نسبة`
                                : `${branch.vat_value} ثابت`
                              : "مفعّل"
                            : "غير مفعّل"}
                        </TableCell>
                        <TableCell className="text-center">
                          {branch.phone || "-"}
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
                        colSpan={10}
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
