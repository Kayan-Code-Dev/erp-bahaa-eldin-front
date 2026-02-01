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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SuppliersTableSkeleton } from "./SuppliersTableSkeleton";
import { CreateSupplierModal } from "./CreateSupplierModal";
import { EditSupplierModal } from "./EditSupplierModal";
import { DeleteSupplierModal } from "./DeleteSupplierModal";

import {
  useGetSuppliersQueryOptions,
  useDeleteSupplierMutationOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import { TSupplierResponse } from "@/api/v2/suppliers/suppliers.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router";
import { formatDate } from "@/utils/formatDate";

function Suppliers() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<TSupplierResponse | null>(
    null
  );

  // Data Fetching
  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetSuppliersQueryOptions(page, per_page)
  );

  // Delete Mutation
  const { mutate: deleteSupplier, isPending: isDeleting } = useMutation(
    useDeleteSupplierMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenEdit = (supplier: TSupplierResponse) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (supplier: TSupplierResponse) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedSupplier) return;
    deleteSupplier(selectedSupplier.id, {
      onSuccess: () => {
        toast.success("تم حذف المورد بنجاح");
        setIsDeleteModalOpen(false);
        setSelectedSupplier(null);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء حذف المورد", {
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
            <CardTitle>عرض الموردين</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الموردين في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/suppliers/orders/add")}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة طلبية
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مورد جديد
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
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">اسم المورد</TableHead>
                    <TableHead className="text-center">كود المورد</TableHead>
                    <TableHead className="text-center">نوع الطلبية</TableHead>
                    <TableHead className="text-center">تاريخ الشراء</TableHead>
                    <TableHead className="text-center">مبلغ الطلبية</TableHead>
                    <TableHead className="text-center">المدفوع</TableHead>
                    <TableHead className="text-center">المتبقي</TableHead>
                    <TableHead className="text-center">معلومات الصنف</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <SuppliersTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="text-center">
                          {supplier.id}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {supplier.supplier_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {supplier.supplier_code}
                        </TableCell>
                        <TableCell className="text-center">
                          {supplier.order_type}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(supplier.purchase_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {supplier.order_amount.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          {supplier.paid_amount.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          {supplier.remaining_amount.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            {supplier.item_name && (
                              <div>الاسم: {supplier.item_name}</div>
                            )}
                            {supplier.item_code && (
                              <div>الكود: {supplier.item_code}</div>
                            )}
                            {supplier.category && (
                              <div>الفئة: {supplier.category.name}</div>
                            )}
                            {supplier.subcategory && (
                              <div>الفئة الفرعية: {supplier.subcategory.name}</div>
                            )}
                            {supplier.model && (
                              <div>الموديل: {supplier.model.name}</div>
                            )}
                            {supplier.branch && (
                              <div>الفرع: {supplier.branch.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(supplier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(supplier)}
                              disabled={isDeleting}
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
                        لا توجد موردين لعرضها.
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
            totalElementsLabel="إجمالي الموردين"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* --- Modals --- */}
      <CreateSupplierModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <EditSupplierModal
        supplier={selectedSupplier}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <DeleteSupplierModal
        supplier={selectedSupplier}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default Suppliers;

