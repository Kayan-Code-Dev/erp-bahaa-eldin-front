import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Trash2, Download, CheckCircle2, XCircle, Plus, X, Loader2 } from "lucide-react";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { EmployeeDocumentTypesSelect } from "@/components/custom/EmployeeDocumentTypesSelect";
import {
  useGetAllEmployeesDocumentsQueryOptions,
  useDownloadEmployeeDocumentQueryOptions,
} from "@/api/v2/employees/employee-documents/employee-documents.hooks";
import { TEmployeeDocument, TGetAllEmployeesDocumentsParams } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { useQueryClient } from "@tanstack/react-query";
import { CreateEmployeeDocumentModal } from "./modals/CreateEmployeeDocumentModal";
import { UpdateEmployeeDocumentModal } from "./modals/UpdateEmployeeDocumentModal";
import { DeleteEmployeeDocumentModal } from "./modals/DeleteEmployeeDocumentModal";
import { ShowEmployeeDocumentModal } from "./modals/ShowEmployeeDocumentModal";
import { VerifyEmployeeDocumentModal } from "./modals/VerifyEmployeeDocumentModal";
import { UnverifyEmployeeDocumentModal } from "./modals/UnverifyEmployeeDocumentModal";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

function EmployeeDocuments() {
  const [page, setPage] = useState(1);

  // Filter states
  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [isVerified, setIsVerified] = useState<string>("all");
  const [expiringSoon, setExpiringSoon] = useState<string>("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isUnverifyModalOpen, setIsUnverifyModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TEmployeeDocument | null>(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Build query params
  const queryParams: TGetAllEmployeesDocumentsParams = useMemo(() => {
    const params: TGetAllEmployeesDocumentsParams = {
      page,
      per_page: 10,
    };

    if (employeeId) {
      params.employee_id = Number(employeeId);
    }

    if (type) {
      params.type = type;
    }

    if (isVerified !== "all") {
      params.is_verified = isVerified === "true";
    }

    if (expiringSoon !== "all") {
      params.expiring_soon = expiringSoon === "true";
    }

    return params;
  }, [page, employeeId, type, isVerified, expiringSoon]);

  const { data, isPending, isError, error } = useQuery(
    useGetAllEmployeesDocumentsQueryOptions(queryParams)
  );

  // Pagination handlers
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data?.total_pages || 1));
  };

  // Filter handlers
  const handleFilterChange = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setEmployeeId("");
    setType("");
    setIsVerified("all");
    setExpiringSoon("all");
    setPage(1);
  };

  // Action handlers
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenUpdate = (document: TEmployeeDocument) => {
    setSelectedDocument(document);
    setIsUpdateModalOpen(true);
  };

  const handleOpenDelete = (document: TEmployeeDocument) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  };

  const handleOpenShow = (document: TEmployeeDocument) => {
    setSelectedDocument(document);
    setIsShowModalOpen(true);
  };

  const handleOpenVerify = (document: TEmployeeDocument) => {
    setSelectedDocument(document);
    setIsVerifyModalOpen(true);
  };

  const handleOpenUnverify = (document: TEmployeeDocument) => {
    setSelectedDocument(document);
    setIsUnverifyModalOpen(true);
  };

  const handleDownload = (doc: TEmployeeDocument) => {
    setDownloadingDocumentId(doc.id);
    const queryOptions = useDownloadEmployeeDocumentQueryOptions(doc.id);
    queryClient
      .fetchQuery(queryOptions)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.file_name || `document-${doc.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("تم تحميل الوثيقة بنجاح");
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء تحميل الوثيقة");
      })
      .finally(() => {
        setDownloadingDocumentId(null);
      });
  };

  return (
    <div dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>إدارة وثائق الموظفين</CardTitle>
            <CardDescription>
              عرض وإدارة وثائق الموظفين في النظام.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة وثيقة جديدة
          </Button>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Employee Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="employee_filter">الموظف:</Label>
              <EmployeesSelect
                params={{ per_page: 10 }}
                value={employeeId}
                onChange={(value) => {
                  setEmployeeId(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الموظفين"
                className="w-[250px]"
                allowClear={true}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="type_filter">نوع الوثيقة:</Label>
              <EmployeeDocumentTypesSelect
                value={type}
                onChange={(value) => {
                  setType(value || "");
                  handleFilterChange();
                }}
                placeholder="جميع الأنواع"
                className="w-[250px]"
                allowClear={true}
              />
            </div>

            {/* Is Verified Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="is_verified_filter">حالة التأكيد:</Label>
              <Select
                value={isVerified}
                onValueChange={(value) => {
                  setIsVerified(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="true">مؤكد</SelectItem>
                  <SelectItem value="false">غير مؤكد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiring Soon Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="expiring_soon_filter">قريب الانتهاء:</Label>
              <Select
                value={expiringSoon}
                onValueChange={(value) => {
                  setExpiringSoon(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">نعم</SelectItem>
                  <SelectItem value="false">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>

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

        <CardContent>
          {!isError && (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">الموظف</TableHead>
                    <TableHead className="text-center">نوع الوثيقة</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">رقم الوثيقة</TableHead>
                    <TableHead className="text-center">تاريخ الإصدار</TableHead>
                    <TableHead className="text-center">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center">
                        <div className="flex items-center justify-center">
                          جاري التحميل...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data && data.data.length > 0 ? (
                    data.data.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="text-center">
                          {document.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {document.employee.user.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {document.type}
                        </TableCell>
                        <TableCell className="text-center">
                          {document.title}
                        </TableCell>
                        <TableCell className="text-center">
                          {document.document_number || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(document.issue_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(document.expiry_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={document.is_verified ? "default" : "secondary"}
                          >
                            {document.is_verified ? "مؤكد" : "غير مؤكد"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              onClick={() => handleOpenShow(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تحميل الوثيقة"
                              onClick={() => handleDownload(document)}
                              disabled={downloadingDocumentId === document.id}
                            >
                              {downloadingDocumentId === document.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل الوثيقة"
                              onClick={() => handleOpenUpdate(document)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {document.is_verified ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="إلغاء التأكيد"
                                onClick={() => handleOpenUnverify(document)}
                              >
                                <XCircle className="h-4 w-4 text-orange-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="تأكيد الوثيقة"
                                onClick={() => handleOpenVerify(document)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="حذف الوثيقة"
                              onClick={() => handleOpenDelete(document)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد وثائق لعرضها.
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
            إجمالي الوثائق: {data?.total || 0}
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
                صفحة {page} من {data?.total_pages || 1}
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
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

      {/* Modals */}
      <CreateEmployeeDocumentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <UpdateEmployeeDocumentModal
        document={selectedDocument}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      />

      <DeleteEmployeeDocumentModal
        document={selectedDocument}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />

      <ShowEmployeeDocumentModal
        document={selectedDocument}
        open={isShowModalOpen}
        onOpenChange={setIsShowModalOpen}
      />

      <VerifyEmployeeDocumentModal
        document={selectedDocument}
        open={isVerifyModalOpen}
        onOpenChange={setIsVerifyModalOpen}
      />

      <UnverifyEmployeeDocumentModal
        document={selectedDocument}
        open={isUnverifyModalOpen}
        onOpenChange={setIsUnverifyModalOpen}
      />
    </div>
  );
}

export default EmployeeDocuments;
