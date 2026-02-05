import {
  useGetClothesQueryOptions,
  useDeleteClothesMutationOptions,
} from "@/api/v2/clothes/clothes.hooks";
import {
  TClothResponse,
  TGetClothesRequestParams,
} from "@/api/v2/clothes/clothes.types";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import CustomPagination from "@/components/custom/CustomPagination";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import { ControlledConfirmationModal } from "@/components/custom/ControlledConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { TEntity } from "@/lib/types/entity.types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ClothesTableSkeleton } from "./ClothesTableSkeleton";
import { EditClothModal } from "./EditClothModal";
import { toast } from "sonner";

function ClothesTableContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCloth, setSelectedCloth] = useState<TClothResponse | null>(
    null
  );

  // Filter states - initialize from URL params
  const [name, setName] = useState(() => searchParams.get("name") || "");
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category_id") || ""
  );
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>(() => {
    const subcatParam = searchParams.get("subcat_id");
    return subcatParam ? subcatParam.split(",").filter(Boolean) : [];
  });
  const [clothTypeId, setClothTypeId] = useState(
    () => searchParams.get("cloth_type_id") || ""
  );
  const [entityType, setEntityType] = useState<TEntity | undefined>(() => {
    const type = searchParams.get("entity_type");
    return (type as TEntity) || undefined;
  });
  const [entityId, setEntityId] = useState(
    () => searchParams.get("entity_id") || ""
  );

  // Debounce filter values
  const debouncedName = useDebounce({ value: name, delay: 500 });
  const debouncedCategoryId = useDebounce({ value: categoryId, delay: 300 });
  const debouncedSubcategoryIds = useDebounce({
    value: subcategoryIds,
    delay: 300,
  });
  const debouncedClothTypeId = useDebounce({ value: clothTypeId, delay: 300 });
  const debouncedEntityType = useDebounce({ value: entityType, delay: 300 });
  const debouncedEntityId = useDebounce({ value: entityId, delay: 300 });

  // Build query params with debounced values
  const queryParams: TGetClothesRequestParams = {
    page,
    per_page,
    ...(debouncedName && { name: debouncedName }),
    ...(debouncedCategoryId && { category_id: Number(debouncedCategoryId) }),
    ...(debouncedSubcategoryIds.length > 0 && {
      subcat_id: debouncedSubcategoryIds.map(Number),
    }),
    ...(debouncedClothTypeId && {
      cloth_type_id: Number(debouncedClothTypeId),
    }),
    ...(debouncedEntityType && { entity_type: debouncedEntityType }),
    ...(debouncedEntityId && { entity_id: Number(debouncedEntityId) }),
  };

  const { data, isPending, isError, error } = useQuery(
    useGetClothesQueryOptions(queryParams)
  );

  // Delete mutation
  const { mutate: deleteCloth, isPending: isDeleting } = useMutation(
    useDeleteClothesMutationOptions()
  );

  // Modal handlers
  const handleOpenEdit = (cloth: TClothResponse) => {
    setSelectedCloth(cloth);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cloth: TClothResponse) => {
    setSelectedCloth(cloth);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = (onCloseModal: () => void) => {
    if (selectedCloth) {
      deleteCloth(selectedCloth.id, {
        onSuccess: () => {
          toast.success("تم حذف المنتج بنجاح", {
            description: "تم حذف المنتج من النظام.",
          });
          onCloseModal();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء حذف المنتج", {
            description: error.message,
          });
        },
      });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setName("");
    setCategoryId("");
    setSubcategoryIds([]);
    setClothTypeId("");
    setEntityType(undefined);
    setEntityId("");
    // Clear URL params and reset to page 1
    setSearchParams({ page: "1" });
  };

  // Update URL params when debounced values change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedName) params.set("name", debouncedName);
    if (debouncedCategoryId) params.set("category_id", debouncedCategoryId);
    if (debouncedSubcategoryIds.length > 0)
      params.set("subcat_id", debouncedSubcategoryIds.join(","));
    if (debouncedClothTypeId) params.set("cloth_type_id", debouncedClothTypeId);
    if (debouncedEntityType) params.set("entity_type", debouncedEntityType);
    if (debouncedEntityId) params.set("entity_id", debouncedEntityId);

    // Only update if params have changed
    const currentParams = new URLSearchParams(searchParams);
    const paramsChanged =
      currentParams.get("name") !== (debouncedName || null) ||
      currentParams.get("category_id") !== (debouncedCategoryId || null) ||
      currentParams.get("subcat_id") !==
        (debouncedSubcategoryIds.length > 0
          ? debouncedSubcategoryIds.join(",")
          : null) ||
      currentParams.get("cloth_type_id") !== (debouncedClothTypeId || null) ||
      currentParams.get("entity_type") !== (debouncedEntityType || null) ||
      currentParams.get("entity_id") !== (debouncedEntityId || null);

    if (paramsChanged) {
      // Reset to page 1 when filters change
      if (page > 1) params.set("page", "1");
      setSearchParams(params);
    }
  }, [
    debouncedName,
    debouncedCategoryId,
    debouncedSubcategoryIds,
    debouncedClothTypeId,
    debouncedEntityType,
    debouncedEntityId,
    searchParams,
    setSearchParams,
    page,
  ]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ready_for_rent":
        return "success";
      case "rented":
        return "info";
      case "damaged":
      case "burned":
      case "scratched":
        return "warning";
      case "repairing":
        return "warning";
      case "die":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ready_for_rent: "جاهز للإيجار",
      rented: "مؤجر",
      damaged: "تالف",
      burned: "محترق",
      scratched: "مخدوش",
      repairing: "قيد الإصلاح",
      die: "ميت",
    };
    return labels[status] || status;
  };

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>تصفية البحث</CardTitle>
            <CardDescription>
              استخدم الفلاتر التالية للبحث عن المنتجات
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المنتج</label>
                <Input
                  placeholder="ابحث بالاسم..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الموديل</label>
                <ClothModelsSelect
                  value={clothTypeId}
                  onChange={(id) => setClothTypeId(id)}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الفئة</label>
                  <CategoriesSelect
                    value={categoryId}
                    onChange={(id) => {
                      setCategoryId(id);
                      setSubcategoryIds([]);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الفئات الفرعية</label>
                  <SubcategoriesSelect
                    multiple
                    value={subcategoryIds}
                    onChange={(ids) => setSubcategoryIds(ids)}
                    category_id={categoryId ? Number(categoryId) : undefined}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <EntitySelect
                mode="standalone"
                entityType={entityType}
                entityId={entityId}
                onEntityTypeChange={(type) => {
                  setEntityType(type);
                  setEntityId("");
                }}
                onEntityIdChange={setEntityId}
                entityTypeLabel="نوع المكان"
                entityIdLabel="المكان"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}

      {isError && <div className="text-red-500">{error.message}</div>}

      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>المنتجات</CardTitle>
              <CardDescription>
                عرض وإدارة جميع المنتجات في النظام
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">المكان</TableHead>
                    <TableHead className="text-center">الموديل</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending && <ClothesTableSkeleton rows={5} />}
                  {data && data.data.length > 0 ? (
                    data.data.map((cloth: TClothResponse) => (
                      <TableRow key={cloth.id}>
                        <TableCell className="text-center">
                          {cloth.id}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {cloth.code}
                        </TableCell>
                        <TableCell className="text-center">
                          {cloth.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(cloth.status)}>
                            {getStatusLabel(cloth.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {cloth.entity_type === "branch"
                            ? "فرع"
                            : cloth.entity_type === "factory"
                            ? "مصنع"
                            : "ورشة"}{" "}
                          #{cloth.entity_id}
                        </TableCell>
                        <TableCell className="text-center">
                          {cloth.cloth_type_name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="تعديل"
                              onClick={() => handleOpenEdit(cloth)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="حذف"
                              onClick={() => handleOpenDelete(cloth)}
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
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        لا توجد منتجات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <CustomPagination
              totalElementsLabel="إجمالي المنتجات"
              totalElements={data?.total}
              totalPages={data?.total_pages}
              isLoading={isPending}
            />
          </CardFooter>
        </Card>
      </>

      {/* Modals */}
      <EditClothModal
        cloth={selectedCloth}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <ControlledConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        alertTitle="حذف المنتج"
        alertMessage={
          <>
            هل أنت متأكد أنك تريد حذف المنتج{" "}
            <strong>{selectedCloth?.name}</strong>؟
          </>
        }
        handleConfirmation={handleDelete}
        isPending={isDeleting}
        pendingLabel="جاري الحذف..."
        confirmLabel="تأكيد الحذف"
        variant="destructive"
      />
    </>
  );
}

export default ClothesTableContent;
