import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { Check, X, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/custom/CustomPagination";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { formatDate } from "@/utils/formatDate";
import {
  useGetTransferClothesQueryOptions,
  useDeleteTransferClothesMutationOptions,
  useApproveTransferClothesMutationOptions,
  useRejectTransferClothesMutationOptions,
  useGetTransferClotheByIdQueryOptions,
  useApprovePartialTransferClothesMutationOptions,
  useRejectPartialTransferClothesMutationOptions,
  useExportTransferClothesToCSVMutationOptions,
} from "@/api/v2/clothes/transfer-clothes/transfer-clothes.hooks";
import {
  TTransferClothesItem,
  TTransferClothesStatus,
} from "@/api/v2/clothes/transfer-clothes/transfer-clothes.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const getStatusVariant = (status: TTransferClothesStatus) => {
  switch (status) {
    case "approved":
      return "bg-green-600 text-white hover:bg-green-600/80";
    case "rejected":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    case "partially_approved":
      return "bg-green-600 text-white hover:bg-green-600/80";
    case "pending":
    case "partially_pending":
    default:
      return "bg-yellow-500 text-white hover:bg-yellow-500/80";
  }
};

const getStatusLabel = (status: TTransferClothesStatus) => {
  const labels: Record<TTransferClothesStatus, string> = {
    pending: "قيد الانتظار",
    approved: "تم القبول",
    rejected: "تم الرفض",
    partially_pending: "قيد الانتظار (جزئي)",
    partially_approved: "تم القبول (جزئي)",
  };
  return labels[status] || status;
};

function TransferClothesReqs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;
  const statusFilter =
    (searchParams.get("status") as TTransferClothesStatus) || undefined;

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TTransferClothesItem | null>(null);
  const [selectedClothIds, setSelectedClothIds] = useState<number[]>([]);

  // Query params
  const queryParams = {
    page,
    per_page,
    ...(statusFilter && { status: statusFilter }),
  };

  // Data fetching
  const { data, isPending, isError, error } = useQuery(
    useGetTransferClothesQueryOptions(queryParams)
  );

  // Mutations
  const { mutate: approveTransfer, isPending: isApproving } = useMutation(
    useApproveTransferClothesMutationOptions()
  );
  const { mutate: rejectTransfer, isPending: isRejecting } = useMutation(
    useRejectTransferClothesMutationOptions()
  );
  const { mutate: deleteTransfer, isPending: isDeleting } = useMutation(
    useDeleteTransferClothesMutationOptions()
  );
  const { mutate: approvePartialTransfer, isPending: isApprovingPartial } =
    useMutation(useApprovePartialTransferClothesMutationOptions());
  const { mutate: rejectPartialTransfer, isPending: isRejectingPartial } =
    useMutation(useRejectPartialTransferClothesMutationOptions());
  const { mutate: exportTransferClothesToCSV, isPending: isExporting } =
    useMutation(useExportTransferClothesToCSVMutationOptions());

  // View details query
  const { data: transferDetails } = useQuery({
    ...useGetTransferClotheByIdQueryOptions(selectedTransfer?.id || 0),
    enabled: !!selectedTransfer?.id && isViewModalOpen,
  });

  // Handlers
  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleOpenApprove = (transfer: TTransferClothesItem) => {
    setSelectedTransfer(transfer);
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (transfer: TTransferClothesItem) => {
    setSelectedTransfer(transfer);
    setIsRejectModalOpen(true);
  };

  const handleOpenDelete = (transfer: TTransferClothesItem) => {
    setSelectedTransfer(transfer);
    setIsDeleteModalOpen(true);
  };

  const handleOpenView = (transfer: TTransferClothesItem) => {
    setSelectedTransfer(transfer);
    setIsViewModalOpen(true);
    setSelectedClothIds([]);
  };

  const handleApprove = (onCloseModal: () => void) => {
    if (selectedTransfer) {
      approveTransfer(selectedTransfer.id, {
        onSuccess: () => {
          toast.success("تم قبول الطلب بنجاح");
          onCloseModal();
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء قبول الطلب", {
            description: error.message,
          });
        },
      });
    }
  };

  const handleReject = (onCloseModal: () => void) => {
    if (selectedTransfer) {
      rejectTransfer(selectedTransfer.id, {
        onSuccess: () => {
          toast.success("تم رفض الطلب بنجاح");
          onCloseModal();
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء رفض الطلب", {
            description: error.message,
          });
        },
      });
    }
  };

  const handleDelete = (onCloseModal: () => void) => {
    if (selectedTransfer) {
      deleteTransfer(selectedTransfer.id, {
        onSuccess: () => {
          toast.success("تم حذف الطلب بنجاح");
          onCloseModal();
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء حذف الطلب", {
            description: error.message,
          });
        },
      });
    }
  };

  // Check if transfer has pending items
  const hasPendingItems = useMemo(() => {
    return (
      transferDetails?.items.some((item) => item.status === "pending") || false
    );
  }, [transferDetails]);

  // Handle checkbox selection
  const handleToggleClothSelection = (clothId: number) => {
    setSelectedClothIds((prev) =>
      prev.includes(clothId)
        ? prev.filter((id) => id !== clothId)
        : [...prev, clothId]
    );
  };

  // Handle select all pending items
  const handleSelectAllPending = () => {
    if (!transferDetails) return;
    const pendingClothIds = transferDetails.items
      .filter((item) => item.status === "pending")
      .map((item) => item.cloth_id);
    
    if (pendingClothIds.every((id) => selectedClothIds.includes(id))) {
      // Deselect all
      setSelectedClothIds([]);
    } else {
      // Select all pending
      setSelectedClothIds(pendingClothIds);
    }
  };

  // Handle partial approve
  const handlePartialApprove = () => {
    if (!selectedTransfer || selectedClothIds.length === 0) {
      toast.error("يرجى اختيار قطعة واحدة على الأقل");
      return;
    }

    approvePartialTransfer(
      { id: selectedTransfer.id, cloth_ids: selectedClothIds },
      {
        onSuccess: () => {
          toast.success("تم قبول القطع المحددة بنجاح");
          setSelectedClothIds([]);
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء قبول القطع", {
            description: error.message,
          });
        },
      }
    );
  };

  // Handle partial reject
  const handlePartialReject = () => {
    if (!selectedTransfer || selectedClothIds.length === 0) {
      toast.error("يرجى اختيار قطعة واحدة على الأقل");
      return;
    }

    rejectPartialTransfer(
      { id: selectedTransfer.id, cloth_ids: selectedClothIds },
      {
        onSuccess: () => {
          toast.success("تم رفض القطع المحددة بنجاح");
          setSelectedClothIds([]);
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء رفض القطع", {
            description: error.message,
          });
        },
      }
    );
  };

  // --- Export Handler ---
  const handleExport = () => {
    exportTransferClothesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `transfer-clothes-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير طلبات نقل المنتجات بنجاح");
      },
      onError: (error: any) => {
        toast.error(
          "خطأ أثناء تصدير طلبات نقل المنتجات. الرجاء المحاولة مرة أخرى.",
          {
            description: error.message,
          }
        );
      },
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>طلبات نقل المنتجات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع طلبات نقل المنتجات بين الفروع والمصانع والورش
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
          </Button>
        </CardHeader>

        <CardContent>
          {/* Status Filter */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium">تصفية حسب الحالة:</label>
            <Select
              value={statusFilter || "all"}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">تم القبول</SelectItem>
                <SelectItem value="rejected">تم الرفض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">من</TableHead>
                  <TableHead className="text-center">إلى</TableHead>
                  <TableHead className="text-center">عدد القطع</TableHead>
                  <TableHead className="text-center">تاريخ النقل</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableSkeleton rows={5} cols={8} />
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-destructive"
                    >
                      {error?.message || "حدث خطأ أثناء جلب البيانات"}
                    </TableCell>
                  </TableRow>
                ) : data && data.data.length > 0 ? (
                  data.data.map((transfer) => {
                    const isPendingStatus = transfer.status === "pending";
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-center">
                          {transfer.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {transfer.from_entity_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {transfer.to_entity_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {transfer.items.length}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(transfer.transfer_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusVariant(transfer.status)}>
                            {getStatusLabel(transfer.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(transfer.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleOpenView(transfer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isPendingStatus && (
                              <>
                                <Button
                                  variant="default"
                                  size="icon"
                                  title="قبول"
                                  className="bg-green-600 hover:bg-green-600/80"
                                  onClick={() => handleOpenApprove(transfer)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  title="رفض"
                                  onClick={() => handleOpenReject(transfer)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  title="حذف"
                                  onClick={() => handleOpenDelete(transfer)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد طلبات نقل لعرضها.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <CustomPagination
            totalElementsLabel="إجمالي الطلبات"
            totalElements={data?.total}
            totalPages={data?.total_pages}
            isLoading={isPending}
          />
        </CardFooter>
      </Card>

      {/* Modals */}
      <ControlledConfirmationModal
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        alertTitle="تأكيد القبول"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد قبول طلب نقل المنتجات رقم{" "}
            <strong>{selectedTransfer?.id}</strong>؟
          </>
        }
        handleConfirmation={handleApprove}
        isPending={isApproving}
        pendingLabel="جاري القبول..."
        confirmLabel="تأكيد القبول"
        variant="default"
        confirmButtonClassName="bg-green-600 hover:bg-green-600/80"
      />

      <ControlledConfirmationModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        alertTitle="تأكيد الرفض"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد رفض طلب نقل المنتجات رقم{" "}
            <strong>{selectedTransfer?.id}</strong>؟
          </>
        }
        handleConfirmation={handleReject}
        isPending={isRejecting}
        pendingLabel="جاري الرفض..."
        confirmLabel="تأكيد الرفض"
        variant="destructive"
      />

      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="تأكيد الحذف"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف طلب نقل المنتجات رقم{" "}
            <strong>{selectedTransfer?.id}</strong>؟
          </>
        }
        handleConfirmation={handleDelete}
        isPending={isDeleting}
        pendingLabel="جاري الحذف..."
        confirmLabel="تأكيد الحذف"
        variant="destructive"
      />

      {/* View Details Modal */}
      <Dialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setSelectedClothIds([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب النقل #{selectedTransfer?.id}</DialogTitle>
            <DialogDescription>عرض تفاصيل طلب نقل المنتجات</DialogDescription>
          </DialogHeader>
          {transferDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    من:
                  </p>
                  <p className="text-base">
                    {transferDetails.from_entity_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    إلى:
                  </p>
                  <p className="text-base">{transferDetails.to_entity_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ النقل:
                  </p>
                  <p className="text-base">
                    {formatDate(transferDetails.transfer_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الحالة:
                  </p>
                  <Badge className={getStatusVariant(transferDetails.status)}>
                    {getStatusLabel(transferDetails.status)}
                  </Badge>
                </div>
                {transferDetails.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      ملاحظات:
                    </p>
                    <p className="text-base">{transferDetails.notes}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    القطع:
                  </p>
                  {hasPendingItems && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-600/80"
                        onClick={handlePartialApprove}
                        disabled={
                          selectedClothIds.length === 0 ||
                          isApprovingPartial ||
                          isRejectingPartial
                        }
                      >
                        {isApprovingPartial
                          ? "جاري القبول..."
                          : `قبول المحدد (${selectedClothIds.length})`}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handlePartialReject}
                        disabled={
                          selectedClothIds.length === 0 ||
                          isApprovingPartial ||
                          isRejectingPartial
                        }
                      >
                        {isRejectingPartial
                          ? "جاري الرفض..."
                          : `رفض المحدد (${selectedClothIds.length})`}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {hasPendingItems && (
                          <TableHead className="text-center w-12">
                            <Checkbox
                              checked={
                                transferDetails.items
                                  .filter((item) => item.status === "pending")
                                  .every((item) =>
                                    selectedClothIds.includes(item.id)
                                  ) &&
                                transferDetails.items.filter(
                                  (item) => item.status === "pending"
                                ).length > 0
                              }
                              onCheckedChange={handleSelectAllPending}
                            />
                          </TableHead>
                        )}
                        <TableHead className="text-center">الكود</TableHead>
                        <TableHead className="text-center">الاسم</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferDetails.items.map((item) => {
                        const isPending = item.status === "pending";
                        const isSelected = selectedClothIds.includes(
                          item.id
                        );
                        return (
                          <TableRow key={item.id}>
                            {hasPendingItems && (
                              <TableCell className="text-center">
                                {isPending ? (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleToggleClothSelection(item.id)
                                    }
                                  />
                                ) : null}
                              </TableCell>
                            )}
                            <TableCell className="text-center">
                              {item.cloth_code}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.cloth_name ?? item.cloth_code}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={getStatusVariant(item.status)}>
                                {getStatusLabel(item.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransferClothesReqs;
