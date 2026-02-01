import {
  useGetCustodyDetailsQueryOptions,
  useReturnCustodyMutationOptions,
} from "@/api/v2/custody/custody.hooks";
import {
  TCustodyAction,
  TCustodyStatus,
  TCustodyType,
  TReturnCustodyRequest,
} from "@/api/v2/custody/custody.types";
import { UploadFileField } from "@/components/custom/UploadFile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/formatDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type Props = {
  custodyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const custodyActions: TCustodyAction[] = ["returned_to_user", "forfeit"];

const custodyActionLabels: Record<TCustodyAction, string> = {
  returned_to_user: "تم إرجاعه للعميل",
  forfeit: "مصادرة",
};

// Schema for return custody form
const returnCustodySchema = z.object({
  custody_action: z.enum(["returned_to_user", "forfeit"], {
    required_error: "نوع الإجراء مطلوب",
  }),
  notes: z.string().min(1, { message: "الملاحظات مطلوبة" }),
  reason_of_kept: z.string().optional(),
  acknowledgement_receipt_photos: z
    .array(z.instanceof(File))
    .min(1, { message: "صور إيصال الاستلام مطلوبة" }),
});

export function CustodyDetailsModal({ custodyId, open, onOpenChange }: Props) {
  const [showReturnForm, setShowReturnForm] = useState(false);

  const { data: custodyData, isPending } = useQuery({
    ...useGetCustodyDetailsQueryOptions(custodyId || 0),
    enabled: open && !!custodyId,
  });

  const { mutate: returnCustody, isPending: isReturning } = useMutation(
    useReturnCustodyMutationOptions()
  );

  const form = useForm<z.infer<typeof returnCustodySchema>>({
    resolver: zodResolver(returnCustodySchema),
    defaultValues: {
      custody_action: "returned_to_user",
      notes: "",
      reason_of_kept: "",
      acknowledgement_receipt_photos: undefined,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setShowReturnForm(false);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (values: z.infer<typeof returnCustodySchema>) => {
    if (!custodyId) return;

    const requestData: TReturnCustodyRequest = {
      custody_action: values.custody_action,
      notes: values.notes,
      ...(values.reason_of_kept && { reason_of_kept: values.reason_of_kept }),
      acknowledgement_receipt_photos: values.acknowledgement_receipt_photos,
    };

    returnCustody(
      {
        custody_id: custodyId,
        data: requestData,
      },
      {
        onSuccess: () => {
          toast.success("تم إرجاع الضمان بنجاح", {
            description: "تمت عملية إرجاع الضمان بنجاح.",
          });
          form.reset();
          setShowReturnForm(false);
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء إرجاع الضمان", {
            description: error.message,
          });
        },
      }
    );
  };

  const canReturn = custodyData?.status === "pending";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الضمان</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالضمان
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : custodyData ? (
          <div className="space-y-6 mt-4">
            {/* Custody Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  رقم الضمان
                </p>
                <p className="text-lg font-semibold">#{custodyData.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  الحالة
                </p>
                <Badge
                  variant="secondary"
                  className={getCustodyStatusVariant(custodyData.status)}
                >
                  {getCustodyStatusLabel(custodyData.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  النوع
                </p>
                <p className="text-lg">
                  {getCustodyTypeLabel(custodyData.type)}
                </p>
              </div>
              {custodyData.type === "money" && custodyData.value && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    القيمة
                  </p>
                  <p className="text-lg font-semibold">
                    {custodyData.value} ج.م
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  تاريخ الإنشاء
                </p>
                <p className="text-lg">{formatDate(custodyData.created_at)}</p>
              </div>
              {custodyData.returned_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ الإرجاع
                  </p>
                  <p className="text-lg">
                    {formatDate(custodyData.returned_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">الوصف</h3>
              <p className="text-muted-foreground">{custodyData.description}</p>
            </div>

            {/* Notes */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">الملاحظات</h3>
              <p className="text-muted-foreground">{custodyData.notes}</p>
            </div>

            {/* Photos */}
            {custodyData.photos && custodyData.photos.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">الصور</h3>
                <div className="grid grid-cols-2 gap-4">
                  {custodyData.photos.map((photo, index) => {
                    return (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.photo_url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-md border"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Return Custody Form */}
            {canReturn && (
              <div className="border-t pt-4">
                {!showReturnForm ? (
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setShowReturnForm(true)}
                    className="w-full"
                  >
                    إرجاع الضمان
                  </Button>
                ) : (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                      dir="rtl"
                    >
                      <h3 className="text-lg font-semibold mb-3">
                        إرجاع الضمان
                      </h3>

                      {/* Custody Action */}
                      <FormField
                        control={form.control}
                        name="custody_action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع الإجراء</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع الإجراء" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {custodyActions.map((action) => (
                                  <SelectItem key={action} value={action}>
                                    {custodyActionLabels[action]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الملاحظات</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="أدخل الملاحظات"
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reason of Kept - Only for forfeited */}
                      {form.watch("custody_action") === "forfeit" && (
                        <FormField
                          control={form.control}
                          name="reason_of_kept"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سبب المصادرة</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="أدخل سبب المصادرة"
                                  {...field}
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Acknowledgement Receipt Photos */}
                      <FormField
                        control={form.control}
                        name="acknowledgement_receipt_photos"
                        render={() => (
                          <FormItem>
                            <FormLabel>صور إيصال الاستلام</FormLabel>
                            <FormControl>
                              <UploadFileField
                                name="acknowledgement_receipt_photos"
                                multiple
                                accept="image/*"
                                placeholder="اختر الصور"
                                showPreview
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset();
                            setShowReturnForm(false);
                          }}
                          disabled={isReturning}
                        >
                          إلغاء
                        </Button>
                        <Button
                          type="submit"
                          disabled={isReturning}
                          isLoading={isReturning}
                        >
                          إرجاع الضمان
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            لا توجد بيانات لعرضها.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
