import {
  useGetClothesQueryOptions,
  useDeleteClothesMutationOptions,
} from "@/api/v2/clothes/clothes.hooks";
import {
  TClothResponse,
  TGetClothesRequestParams,
} from "@/api/v2/clothes/clothes.types";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
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
import { useMemo } from "react";
import { useGetBranchesQueryOptions } from "@/api/v2/branches/branches.hooks";
import { useGetFactoriesQueryOptions } from "@/api/v2/factories/factories.hooks";
import { useGetWorkshopsQueryOptions } from "@/api/v2/workshop/workshops.hooks";
import { Pencil, Trash2, RotateCcw, Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { ClothesTableSkeleton } from "./ClothesTableSkeleton";
import { EditClothModal } from "./EditClothModal";
import { toast } from "sonner";

function ClothesTableContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const page = Number(searchParams.get("page")) || 1;
  const per_page = 10;

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCloth, setSelectedCloth] = useState<TClothResponse | null>(
    null
  );

  // Filter states - initialize from URL params
  const [codeFilter, setCodeFilter] = useState(() => searchParams.get("search") || searchParams.get("code") || "");
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category_id") || ""
  );
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>(() => {
    const subcatParam = searchParams.get("subcat_id");
    return subcatParam ? subcatParam.split(",").filter(Boolean) : [];
  });
  const [entityType, setEntityType] = useState<TEntity | undefined>(() => {
    const type = searchParams.get("entity_type");
    return (type as TEntity) || undefined;
  });
  const [entityId, setEntityId] = useState(
    () => searchParams.get("entity_id") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  // Sync code filter from URL (header uses search param)
  const urlSearch = searchParams.get("search") || searchParams.get("code") || "";
  useEffect(() => {
    setCodeFilter(urlSearch);
  }, [urlSearch]);

  // Debounce filter values
  const debouncedCodeFilter = useDebounce({ value: codeFilter, delay: 500 });
  const debouncedCategoryId = useDebounce({ value: categoryId, delay: 300 });
  const debouncedSubcategoryIds = useDebounce({
    value: subcategoryIds,
    delay: 300,
  });
  const debouncedEntityType = useDebounce({ value: entityType, delay: 300 });
  const debouncedEntityId = useDebounce({ value: entityId, delay: 300 });

  // Build query params with debounced values
  const queryParams: TGetClothesRequestParams = {
    page,
    per_page,
    ...(debouncedCodeFilter && { name: debouncedCodeFilter }),
    ...(debouncedCategoryId && { category_id: Number(debouncedCategoryId) }),
    ...(debouncedSubcategoryIds.length > 0 && {
      subcat_id: debouncedSubcategoryIds.map(Number),
    }),
    ...(debouncedEntityType && { entity_type: debouncedEntityType }),
    ...(debouncedEntityId && { entity_id: Number(debouncedEntityId) }),
  };

  const { data, isPending, isError, error } = useQuery(
    useGetClothesQueryOptions(queryParams)
  );

  const { data: branchesData } = useQuery(useGetBranchesQueryOptions(1, 500));
  const { data: factoriesData } = useQuery(useGetFactoriesQueryOptions(1, 500));
  const { data: workshopsData } = useQuery(useGetWorkshopsQueryOptions(1, 500));

  const entityNamesMap = useMemo(() => {
    const map = new Map<string, string>();
    branchesData?.data?.forEach((b) => map.set(`branch-${b.id}`, b.name));
    factoriesData?.data?.forEach((f) => map.set(`factory-${f.id}`, f.name));
    workshopsData?.data?.forEach((w) => map.set(`workshop-${w.id}`, w.name));
    return map;
  }, [branchesData?.data, factoriesData?.data, workshopsData?.data]);

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
  const skipNextSyncRef = useRef(false);
  const handleResetFilters = () => {
    skipNextSyncRef.current = true;
    setCodeFilter("");
    setCategoryId("");
    setSubcategoryIds([]);
    setEntityType(undefined);
    setEntityId("");
    setSearchParams({ page: "1" });
  };

  // Update URL params when debounced values change (use ref to avoid loop from searchParams dependency)
  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      setSearchParams((prev) => {
        const next = new URLSearchParams();
        next.set("page", prev.get("page") || "1");
        return next;
      });
      return;
    }
    const params = new URLSearchParams(searchParamsRef.current);
    const prevCode = params.get("search") || params.get("code") || null;
    const prevCategoryId = params.get("category_id") || null;
    const prevSubcatId =
      params.get("subcat_id") || null;
    const prevEntityType = params.get("entity_type") || null;
    const prevEntityId = params.get("entity_id") || null;

    const newCode = debouncedCodeFilter || null;
    const newCategoryId = debouncedCategoryId || null;
    const newSubcatId =
      debouncedSubcategoryIds.length > 0
        ? debouncedSubcategoryIds.join(",")
        : null;
    const newEntityType = debouncedEntityType || null;
    const newEntityId = debouncedEntityId || null;

    const paramsChanged =
      prevCode !== newCode ||
      prevCategoryId !== newCategoryId ||
      prevSubcatId !== newSubcatId ||
      prevEntityType !== newEntityType ||
      prevEntityId !== newEntityId;

    if (!paramsChanged) return;

    const nextParams = new URLSearchParams();
    if (newCode) nextParams.set("search", newCode);
    if (newCategoryId) nextParams.set("category_id", newCategoryId);
    if (newSubcatId) nextParams.set("subcat_id", newSubcatId);
    if (newEntityType) nextParams.set("entity_type", newEntityType);
    if (newEntityId) nextParams.set("entity_id", newEntityId);
    nextParams.set("page", paramsChanged ? "1" : String(page));
    setSearchParams(nextParams);
  }, [
    debouncedCodeFilter,
    debouncedCategoryId,
    debouncedSubcategoryIds,
    debouncedEntityType,
    debouncedEntityId,
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

  const getMeasurementsDisplay = (cloth: TClothResponse) => {
    if (cloth.measurements) return cloth.measurements;
    const parts = [
      cloth.breast_size,
      cloth.waist_size,
      cloth.sleeve_size,
    ].filter(Boolean);
    return parts.length ? parts.join(" / ") : "-";
  };

  const getEntityDisplay = (cloth: TClothResponse) => {
    if (cloth.entity_name?.trim()) return cloth.entity_name.trim();
    const key = `${cloth.entity_type}-${cloth.entity_id}`;
    const name = entityNamesMap.get(key);
    if (name) return name;
    const typeLabel =
      cloth.entity_type === "branch"
        ? "فرع"
        : cloth.entity_type === "factory"
          ? "مصنع"
          : "ورشة";
    return `${typeLabel} (${cloth.entity_id})`;
  };

  const getSubcategoryDisplay = (cloth: TClothResponse) => {
    if (cloth.subcategory_names?.length) return cloth.subcategory_names.join("، ");
    const subcategories = (cloth as { subcategories?: { name?: string }[] }).subcategories;
    if (subcategories?.length) return subcategories.map((s) => s.name ?? "").filter(Boolean).join("، ");
    return "";
  };

  return (
    <div className="w-full">
      {isError && <div className="text-red-500">{error.message}</div>}

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المنتجات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع المنتجات في النظام
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="ml-1 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "الفلاتر"}
            </Button>
            {showFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleResetFilters}
              >
                <RotateCcw className="ml-1 h-4 w-4" />
                إعادة تعيين
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          {showFilters && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">الفلاتر</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كود المنتج</label>
                    <Input
                      placeholder="ابحث بالكود..."
                      value={codeFilter}
                      onChange={(e) => setCodeFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">قسم المنتجات</label>
                    <CategoriesSelect
                      value={categoryId}
                      onChange={(id) => {
                        setCategoryId(id);
                        setSubcategoryIds([]);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">أقسام المنتجات الفرعية</label>
                    <SubcategoriesSelect
                      multiple
                      value={subcategoryIds}
                      onChange={(ids) => setSubcategoryIds(ids)}
                      category_id={categoryId ? Number(categoryId) : undefined}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-4">
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
            </div>
          )}

          {/* Table */}
            <div className="table-responsive-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">المقاسات</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">نوع المكان (المكان)</TableHead>
                    <TableHead className="text-center">قسم المنتجات</TableHead>
                    <TableHead className="text-center">أقسام فرعية</TableHead>
                    <TableHead className="text-center">ملاحظات</TableHead>
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
                        <TableCell className="text-center text-muted-foreground">
                          {getMeasurementsDisplay(cloth)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(cloth.status)}>
                            {getStatusLabel(cloth.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getEntityDisplay(cloth)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {cloth.category_name ?? (cloth as { category?: { name?: string } }).category?.name ?? "-"}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground max-w-[160px] truncate" title={getSubcategoryDisplay(cloth)}>
                          {getSubcategoryDisplay(cloth) || "-"}
                        </TableCell>
                        <TableCell className="text-center max-w-[180px] truncate" title={cloth.notes || undefined}>
                          {cloth.notes || "-"}
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
                        colSpan={9}
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
            <strong>{selectedCloth?.code}</strong>؟
          </>
        }
        handleConfirmation={handleDelete}
        isPending={isDeleting}
        pendingLabel="جاري الحذف..."
        confirmLabel="تأكيد الحذف"
        variant="destructive"
      />
    </div>
  );
}

export default ClothesTableContent;
