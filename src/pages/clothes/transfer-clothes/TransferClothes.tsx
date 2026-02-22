import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { TEntity } from "@/lib/types/entity.types";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { useGetClothesQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { useCreateTransferClothesMutationOptions } from "@/api/v2/clothes/transfer-clothes/transfer-clothes.hooks";
import { TClothResponse } from "@/api/v2/clothes/clothes.types";

const formSchema = z.object({
  from_entity_type: z
    .union([z.literal("branch"), z.literal("factory"), z.literal("workshop")])
    .refine((val) => val !== undefined, {
      message: "نوع المصدر مطلوب",
    }),
  from_entity_id: z.string().min(1, "المصدر مطلوب"),
  to_entity_type: z
    .union([z.literal("branch"), z.literal("factory"), z.literal("workshop")])
    .refine((val) => val !== undefined, {
      message: "نوع الوجهة مطلوب",
    }),
  to_entity_id: z.string().min(1, "الوجهة مطلوبة"),
  transfer_date: z.date({
    required_error: "تاريخ النقل مطلوب",
  }),
  notes: z.string().optional(),
  cloth_ids: z.array(z.number()).min(1, "يجب اختيار قطعة واحدة على الأقل"),
});

type FormValues = z.infer<typeof formSchema>;

function TransferClothes() {
  const [fromEntityType, setFromEntityType] = useState<TEntity | undefined>();
  const [fromEntityId, setFromEntityId] = useState<string>("");
  const [toEntityType, setToEntityType] = useState<TEntity | undefined>();
  const [toEntityId, setToEntityId] = useState<string>("");
  const [selectedClothIds, setSelectedClothIds] = useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cloth_ids: [],
      notes: "",
    },
  });

  // Fetch clothes when source entity is selected
  const clothesQueryParams = {
    entity_type: fromEntityType,
    entity_id: fromEntityId ? Number(fromEntityId) : undefined,
    page: 1,
    per_page: 100,
  };

  const { data: clothesData, isPending: isLoadingClothes } = useQuery({
    ...useGetClothesQueryOptions(clothesQueryParams),
    enabled: !!fromEntityType && !!fromEntityId,
  });

  const { mutate: createTransfer, isPending: isSubmitting } = useMutation(
    useCreateTransferClothesMutationOptions()
  );

  // Sync form values with state
  useEffect(() => {
    form.setValue("from_entity_type", fromEntityType as TEntity);
    form.setValue("from_entity_id", fromEntityId);
  }, [fromEntityType, fromEntityId, form]);

  useEffect(() => {
    form.setValue("to_entity_type", toEntityType as TEntity);
    form.setValue("to_entity_id", toEntityId);
  }, [toEntityType, toEntityId, form]);

  const handleClothToggle = (clothId: number) => {
    const newSelectedIds = selectedClothIds.includes(clothId)
      ? selectedClothIds.filter((id) => id !== clothId)
      : [...selectedClothIds, clothId];
    setSelectedClothIds(newSelectedIds);
    form.setValue("cloth_ids", newSelectedIds);
  };

  const handleSelectAll = () => {
    if (!clothesData?.data) return;
    const allClothIds = clothesData.data.map((cloth) => cloth.id);
    const newSelectedIds =
      selectedClothIds.length === allClothIds.length ? [] : allClothIds;
    setSelectedClothIds(newSelectedIds);
    form.setValue("cloth_ids", newSelectedIds);
  };

  const onSubmit = (values: FormValues) => {
    // Validate that source and destination are different
    if (fromEntityType === toEntityType && fromEntityId === toEntityId) {
      toast.error("المصدر والوجهة يجب أن يكونا مختلفين");
      return;
    }

    if (selectedClothIds.length === 0) {
      toast.error("يرجى اختيار قطعة واحدة على الأقل");
      form.setError("cloth_ids", {
        type: "manual",
        message: "يجب اختيار قطعة واحدة على الأقل",
      });
      return;
    }

    // Format date as YYYY-MM-DD
    const formattedDate = values.transfer_date.toISOString().split("T")[0];

    const transferData = {
      from_entity_type: fromEntityType!,
      from_entity_id: Number(fromEntityId),
      to_entity_type: toEntityType!,
      to_entity_id: Number(toEntityId),
      cloth_ids: selectedClothIds,
      transfer_date: formattedDate,
      notes: values.notes || "",
    };

    createTransfer(transferData, {
      onSuccess: () => {
        toast.success("تم إنشاء طلب النقل بنجاح");
        form.reset();
        setFromEntityType(undefined);
        setFromEntityId("");
        setToEntityType(undefined);
        setToEntityId("");
        setSelectedClothIds([]);
        form.setValue("cloth_ids", []);
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء إنشاء طلب النقل", {
          description: error?.message,
        });
      },
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>نقل المنتجات</CardTitle>
          <CardDescription>
            إنشاء طلب جديد لنقل المنتجات بين الفروع والمصانع والورش
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Entity */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">المصدر</Label>
                <EntitySelect
                  mode="standalone"
                  entityType={fromEntityType}
                  entityId={fromEntityId}
                  onEntityTypeChange={(value) => {
                    setFromEntityType(value);
                    setFromEntityId("");
                    setSelectedClothIds([]);
                    form.setValue("cloth_ids", []);
                  }}
                  onEntityIdChange={(value) => {
                    setFromEntityId(value);
                    setSelectedClothIds([]);
                    form.setValue("cloth_ids", []);
                  }}
                  entityTypeLabel="نوع المصدر"
                  entityIdLabel="المصدر"
                  required
                />
              </div>

              {/* Destination Entity */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">الوجهة</Label>
                <EntitySelect
                  mode="standalone"
                  entityType={toEntityType}
                  entityId={toEntityId}
                  onEntityTypeChange={(value) => {
                    setToEntityType(value);
                    setToEntityId("");
                  }}
                  onEntityIdChange={setToEntityId}
                  entityTypeLabel="نوع الوجهة"
                  entityIdLabel="الوجهة"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transfer Date */}
              <div>
                <DatePicker
                  label="تاريخ النقل"
                  value={form.watch("transfer_date")}
                  onChange={(date) =>
                    form.setValue("transfer_date", date || new Date())
                  }
                  showLabel={true}
                />
                {form.formState.errors.transfer_date && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.transfer_date.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="أدخل ملاحظات (اختياري)"
                  rows={3}
                />
              </div>
            </div>

            {/* Products Table */}
            {fromEntityType && fromEntityId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    اختر المنتجات
                  </Label>
                  {clothesData?.data && clothesData.data.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedClothIds.length === clothesData.data.length
                        ? "إلغاء تحديد الكل"
                        : "تحديد الكل"}
                    </Button>
                  )}
                </div>

                <div className="border rounded-md">
                  {isLoadingClothes ? (
                    <TableSkeleton rows={5} cols={5} />
                  ) : clothesData?.data && clothesData.data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">
                            <Checkbox
                              checked={
                                clothesData.data.length > 0 &&
                                selectedClothIds.length ===
                                  clothesData.data.length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="text-center">الكود</TableHead>
                          <TableHead className="text-center">الاسم</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clothesData.data.map((cloth: TClothResponse) => {
                          const isSelected = selectedClothIds.includes(
                            cloth.id
                          );
                          return (
                            <TableRow key={cloth.id}>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleClothToggle(cloth.id)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                {cloth.code}
                              </TableCell>
                              <TableCell className="text-center">
                                {cloth.name ?? cloth.code}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      لا توجد منتجات متاحة في هذا المكان
                    </div>
                  )}
                </div>
                {form.formState.errors.cloth_ids && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cloth_ids.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setFromEntityType(undefined);
                  setFromEntityId("");
                  setToEntityType(undefined);
                  setToEntityId("");
                  setSelectedClothIds([]);
                  form.setValue("cloth_ids", []);
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إنشاء طلب النقل"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TransferClothes;
