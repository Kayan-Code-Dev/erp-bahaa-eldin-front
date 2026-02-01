import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useGetAllCustodiesQueryOptions } from "@/api/v2/custody/custody.hooks";
import { TOrderCustody, TCustodyType, TCustodyStatus } from "@/api/v2/custody/custody.types";
import { formatDate } from "@/utils/formatDate";
import { CustodyDetailsModal } from "./CustodyDetailsModal";

type Props = {
  orderId: number;
  clientId: number;
};

const getCustodyTypeLabel = (type: TCustodyType): string => {
  const labels: Record<TCustodyType, string> = {
    money: "مال",
    physical_item: "عنصر مادي",
    document: "مستند",
  };
  return labels[type] || type;
};

const getCustodyStatusVariant = (status: TCustodyStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
    case "returned":
      return "bg-green-600 text-white hover:bg-green-600/80";
    case "lost":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    default:
      return "bg-gray-500 text-white hover:bg-gray-500/80";
  }
};

const getCustodyStatusLabel = (status: TCustodyStatus): string => {
  const labels: Record<TCustodyStatus, string> = {
    pending: "قيد الانتظار",
    returned: "تم الإرجاع",
    lost: "مفقود",
  };
  return labels[status] || status;
};

function CustodiesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index}>
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
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
    </TableRow>
  ));
}

export function OrderCustodiesTable({ orderId, clientId }: Props) {
  const [page, setPage] = useState(1);
  const [selectedCustodyId, setSelectedCustodyId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const per_page = 10;

  const { data, isPending } = useQuery({
    ...useGetAllCustodiesQueryOptions({
      order_id: orderId,
      client_id: clientId,
      page,
      per_page,
    }),
    enabled: !!orderId && !!clientId,
  });

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-t">
      <h3 className="text-lg font-semibold mb-4">الضمانات</h3>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">#</TableHead>
              <TableHead className="text-center">النوع</TableHead>
              <TableHead className="text-center">الوصف</TableHead>
              <TableHead className="text-center">القيمة</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center">تاريخ الإرجاع</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <CustodiesTableSkeleton rows={per_page} />
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((custody: TOrderCustody, index: number) => (
                <TableRow key={custody.id}>
                  <TableCell className="text-center font-medium">
                    {(page - 1) * per_page + index + 1}
                  </TableCell>
                  <TableCell className="text-center">
                    {getCustodyTypeLabel(custody.type)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="max-w-[200px] mx-auto text-wrap">
                      {custody.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {custody.type === "money" && custody.value
                      ? `${custody.value} ج.م`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={getCustodyStatusVariant(custody.status)}
                    >
                      {getCustodyStatusLabel(custody.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDate(custody.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    {custody.returned_at ? formatDate(custody.returned_at) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCustodyId(custody.id);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  لا توجد ضمانات لعرضها
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            إجمالي الضمانات: {data.total || 0}
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
                صفحة {page} من {data.total_pages || 1}
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextPage();
                  }}
                  aria-disabled={page === data.total_pages || isPending}
                  className={
                    page === data.total_pages || isPending
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Custody Details Modal */}
      <CustodyDetailsModal
        custodyId={selectedCustodyId}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
}
