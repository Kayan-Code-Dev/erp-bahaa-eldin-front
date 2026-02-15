import { useQuery } from "@tanstack/react-query";
import { TEmployeeDocument } from "@/api/v2/employees/employee-documents/employee-documents.types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/formatDate";
import { useGetEmployeeDocumentQueryOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";

type Props = {
  document: TEmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShowEmployeeDocumentModal({
  document,
  open,
  onOpenChange,
}: Props) {
  const { data, isPending } = useQuery({
    ...useGetEmployeeDocumentQueryOptions(document?.id || 0),
    enabled: open && !!document?.id,
  });

  const documentData = data || document;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الوثيقة</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالوثيقة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : documentData ? (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الموظف</p>
                  <p className="text-base font-medium">{documentData.employee.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نوع الوثيقة</p>
                  <p className="text-base">{documentData.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">العنوان</p>
                  <p className="text-base">{documentData.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم الوثيقة</p>
                  <p className="text-base">{documentData.document_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ الإصدار</p>
                  <p className="text-base">{formatDate(documentData.issue_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء</p>
                  <p className="text-base">{formatDate(documentData.expiry_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                  <Badge
                    variant={documentData.is_verified ? "default" : "secondary"}
                  >
                    {documentData.is_verified ? "مؤكد" : "غير مؤكد"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">اسم الملف</p>
                  <p className="text-base">{documentData.file_name || "-"}</p>
                </div>
                {documentData.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">الوصف</p>
                    <p className="text-base">{documentData.description}</p>
                  </div>
                )}
              </div>

              {/* Verification Information */}
              {documentData.is_verified && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">معلومات التأكيد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentData.verified_by && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">تم التأكيد بواسطة</p>
                        <p className="text-base">{documentData.verified_by.name}</p>
                        <p className="text-sm text-muted-foreground">{documentData.verified_by.email}</p>
                      </div>
                    )}
                    {documentData.verified_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">تاريخ التأكيد</p>
                        <p className="text-base">{formatDate(documentData.verified_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">معلومات الرفع</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تم الرفع بواسطة</p>
                    <p className="text-base">{documentData.uploaded_by.name}</p>
                    <p className="text-sm text-muted-foreground">{documentData.uploaded_by.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="text-base">{formatDate(documentData.created_at)}</p>
                  </div>
                  {documentData.mime_type && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">نوع الملف</p>
                      <p className="text-base">{documentData.mime_type}</p>
                    </div>
                  )}
                  {documentData.file_size && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">حجم الملف</p>
                      <p className="text-base">
                        {(documentData.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لا توجد بيانات للوثيقة
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

