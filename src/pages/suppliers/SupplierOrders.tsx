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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";

import { useGetSupplierOrdersQueryOptions } from "@/api/v2/suppliers/suppliers.hooks";
import { TSupplierOrderResponse } from "@/api/v2/suppliers/suppliers.types";
import CustomPagination from "@/components/custom/CustomPagination";
import { formatDate } from "@/utils/formatDate";

import { SupplierOrdersTableSkeleton } from "./SupplierOrdersTableSkeleton";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  const s = (status || "").toLowerCase();
  if (s === "pending" || s === "قيد الانتظار") return "warning";
  if (s === "completed" || s === "مكتمل" || s === "delivered") return "success";
  if (s === "cancelled" || s === "ملغى") return "destructive";
  return "secondary";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    completed: "مكتمل",
    cancelled: "ملغى",
    delivered: "تم التسليم",
  };
  return labels[(status || "").toLowerCase()] || status || "—";
}

function formatCurrency(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = parseFloat(String(value));
  if (Number.isNaN(num)) return "—";
  return `${num.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م`;
}

function SupplierOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Data Fetching
  const { data, isPending, isError, error } = useQuery(
    useGetSupplierOrdersQueryOptions(page, per_page)
  );

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>طلبيات الموردين</CardTitle>
            <CardDescription>
              عرض وإدارة جميع طلبيات الموردين في النظام.
            </CardDescription>
          </div>
          <Button onClick={() => navigate("/suppliers/orders/add")}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة طلبية
          </Button>
        </CardHeader>

        {isError && (
          <CardContent>
            <div className="flex justify-center rounded-md border border-destructive/50 bg-destructive/10 py-6">
              <p className="text-destructive">
                {error?.message ?? "حدث خطأ أثناء تحميل البيانات."}
              </p>
            </div>
          </CardContent>
        )}

        {!isError && (
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-center whitespace-nowrap w-12">#</TableHead>
                    <TableHead className="text-center whitespace-nowrap">رقم الطلبية</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المورد</TableHead>
                    <TableHead className="text-center whitespace-nowrap">التاريخ</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الإجمالي</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المدفوع</TableHead>
                    <TableHead className="text-center whitespace-nowrap">المتبقي</TableHead>
                    <TableHead className="text-center whitespace-nowrap">الفرع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <SupplierOrdersTableSkeleton rows={5} />
                  ) : data && data.data.length > 0 ? (
                    data.data.map((order: TSupplierOrderResponse) => (
                      <TableRow key={order.id} className="transition-colors">
                        <TableCell className="text-center font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {order.order_number ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {order.supplier?.name ?? "—"}
                          </span>
                          {order.supplier?.code && (
                            <span className="text-muted-foreground text-xs block">
                              {order.supplier.code}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {order.order_date ? formatDate(order.order_date) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium tabular-nums">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {formatCurrency(order.payment_amount)}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {formatCurrency(order.remaining_payment)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {order.branch?.name ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-32 text-center text-muted-foreground"
                      >
                        لا توجد طلبيات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}

        {!isError && data && (
          <CardFooter className="flex items-center justify-between border-t bg-muted/30">
            <CustomPagination
              totalElementsLabel="إجمالي الطلبيات"
              totalElements={data?.total}
              totalPages={data?.total_pages}
              isLoading={isPending}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default SupplierOrders;
