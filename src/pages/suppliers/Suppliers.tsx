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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Banknote, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SuppliersTableSkeleton } from "./SuppliersTableSkeleton";
import { CreateSupplierModal } from "./CreateSupplierModal";
import { CreateSupplierOrderModal } from "./CreateSupplierOrderModal";
import { DeleteSupplierModal } from "./DeleteSupplierModal";

import {
  useGetSuppliersQueryOptions,
  useDeleteSupplierMutationOptions,
} from "@/api/v2/suppliers/suppliers.hooks";
import { TSupplierResponse } from "@/api/v2/suppliers/suppliers.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router";
import { toEnglishNumerals } from "@/utils/formatDate";

function formatSupplierCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "-";
  return `${num.toLocaleString("en-EG", { minimumFractionDigits: 2 })} ج.م`;
}

/** صافي الرصيد = إجمالي المشتريات - إجمالي المرتجعات */
function getNetBalance(
  totalPurchases: string | number | null | undefined,
  totalRefunds: string | number | null | undefined
): number {
  const p = totalPurchases != null && totalPurchases !== "" ? Number(totalPurchases) : 0;
  const r = totalRefunds != null && totalRefunds !== "" ? Number(totalRefunds) : 0;
  if (Number.isNaN(p) || Number.isNaN(r)) return 0;
  return p - r;
}

function Suppliers() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<TSupplierResponse | null>(
    null
  );

  const per_page = 10;
  const { data, isPending, isError, error } = useQuery(
    useGetSuppliersQueryOptions(page, per_page, search)
  );

  // Delete Mutation
  const { mutate: deleteSupplier, isPending: isDeleting } = useMutation(
    useDeleteSupplierMutationOptions()
  );

  // --- Modal Action Handlers ---
  const handleOpenDelete = (supplier: TSupplierResponse) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleViewSupplierOrders = (supplier: TSupplierResponse) => {
    navigate(`/suppliers/orders?supplier_id=${supplier.id}`);
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
    <div dir="rtl" className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>عرض الموردين</CardTitle>
            <CardDescription>
              عرض وتعديل وإنشاء الموردين في النظام.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/suppliers/orders")}>
              طلبيات الموردين
            </Button>
            <Button onClick={() => setIsCreateOrderModalOpen(true)}>
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
            <div className="table-responsive-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">#</TableHead>
                    <TableHead className="text-right w-64">بيانات المورد</TableHead>
                    <TableHead className="text-right w-48">المشتريات والمرتجعات</TableHead>
                    <TableHead className="text-right w-48">الحساب</TableHead>
                    <TableHead className="text-right w-40">الرصيد</TableHead>
                    <TableHead className="text-center w-40">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <SuppliersTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((supplier) => (
                      <TableRow key={supplier.id}>
                        {/* العمود الأول: الرقم */}
                        <TableCell
                          className="font-medium text-center cursor-pointer align-top pt-4"
                          onClick={() => handleViewSupplierOrders(supplier)}
                        >
                          <p className="underline text-sm"><span dir="ltr" className="tabular-nums">#{toEnglishNumerals(supplier.id)}</span></p>
                        </TableCell>

                        {/* العمود الثاني: بيانات المورد */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1 text-sm text-right">
                            <p className="font-semibold text-gray-900">
                              اسم المورد:{" "}
                              <span className="font-normal text-gray-700">
                                {supplier.name ?? "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              كود المورد:{" "}
                              <span className="font-normal text-gray-700">
                                {supplier.code ?? "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              رقم المورد:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {toEnglishNumerals(supplier.phone?.trim()) || "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              العنوان:{" "}
                              <span className="font-normal text-gray-700">
                                {supplier.address?.trim() ?? "-"}
                              </span>
                            </p>
                          </div>
                        </TableCell>

                        {/* العمود الثالث: المشتريات والمرتجعات (orders_count, refund_orders_count من الـ API) */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1 text-sm text-right">
                            <p className="font-semibold text-gray-900">
                              عدد المشتريات:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {toEnglishNumerals(supplier.orders_count ?? supplier.purchases_count) || "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              عدد المرتجعات:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {toEnglishNumerals(supplier.refund_orders_count ?? supplier.returns_count) || "-"}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              صافي المشتريات:{" "}
                              <span className="font-normal text-gray-700" dir="ltr">
                                {(() => {
                                  const o = supplier.orders_count ?? supplier.purchases_count;
                                  const r = supplier.refund_orders_count ?? supplier.returns_count;
                                  if (supplier.net_purchases_count != null) return toEnglishNumerals(supplier.net_purchases_count);
                                  if (o != null && r != null) return toEnglishNumerals(Number(o) - Number(r));
                                  return "-";
                                })()}
                              </span>
                            </p>
                          </div>
                        </TableCell>

                        {/* العمود الرابع: الحساب (total_order_amount, total_refund, total_remaining من الـ API) */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1 text-sm text-right">
                            <p className="font-semibold text-gray-900">
                              إجمالي المشتريات:{" "}
                              <span className="font-normal text-gray-700 tabular-nums" dir="ltr">
                                {toEnglishNumerals(formatSupplierCurrency(supplier.total_order_amount ?? supplier.total_purchases))}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              إجمالي المرتجعات:{" "}
                              <span className="font-normal text-gray-700 tabular-nums" dir="ltr">
                                {toEnglishNumerals(formatSupplierCurrency(supplier.total_refund ?? supplier.total_returns))}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              صافي الرصيد:{" "}
                              <span className="font-normal text-gray-700 tabular-nums" dir="ltr">
                                {toEnglishNumerals(
                                  formatSupplierCurrency(
                                    getNetBalance(
                                      supplier.total_order_amount ?? supplier.total_purchases,
                                      supplier.total_refund ?? supplier.total_returns
                                    )
                                  )
                                )}
                              </span>
                            </p>
                          </div>
                        </TableCell>

                        {/* العمود الخامس: الرصيد (total_payment, total_remaining من الـ API) */}
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1 text-sm text-right">
                            <p className="font-semibold text-gray-900">
                              المدفوع:{" "}
                              <span className="font-medium text-green-700 tabular-nums" dir="ltr">
                                {toEnglishNumerals(formatSupplierCurrency(supplier.total_payment ?? supplier.paid))}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-900">
                              المتبقي:{" "}
                              <span className="font-medium text-blue-700 tabular-nums" dir="ltr">
                                {toEnglishNumerals(formatSupplierCurrency(supplier.total_remaining ?? supplier.remaining))}
                              </span>
                            </p>
                          </div>
                        </TableCell>

                        {/* العمود السادس: الإجراءات */}
                        <TableCell className="align-top pt-4">
                          <TooltipProvider delayDuration={300}>
                            <div className="flex flex-wrap items-center gap-1 justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleViewSupplierOrders(supplier)}
                                    title="طلبيات المورد"
                                  >
                                    <Banknote className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  إضافة دفعة لطلبية
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    title="حذف المورد"
                                    onClick={() => handleOpenDelete(supplier)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  حذف المورد
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
      <CreateSupplierOrderModal
        open={isCreateOrderModalOpen}
        onOpenChange={setIsCreateOrderModalOpen}
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

