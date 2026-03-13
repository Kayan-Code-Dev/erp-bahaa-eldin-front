import {
  useGetClothesQueryOptions,
  useDeleteClothesMutationOptions,
} from "@/api/v2/clothes/clothes.hooks";
import {
  TClothResponse,
  TClothesStatus,
  TGetClothesRequestParams,
} from "@/api/v2/clothes/clothes.types";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import CustomPagination from "@/components/custom/CustomPagination";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGetBranchesQueryOptions } from "@/api/v2/branches/branches.hooks";
import { useGetFactoriesQueryOptions } from "@/api/v2/factories/factories.hooks";
import { useGetWorkshopsQueryOptions } from "@/api/v2/workshop/workshops.hooks";
import { Pencil, Trash2, RotateCcw, Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ClothesTableSkeleton } from "./ClothesTableSkeleton";
import { EditClothModal } from "./EditClothModal";
import { toast } from "sonner";

function ClothesTableContent() {
  const navigate = useNavigate();
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

  // Filter states - initialize from URL params (search من الهيدر والفلاتر)
  const [idFilter, setIdFilter] = useState(() => searchParams.get("id") || "");
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category_id") || ""
  );
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>(() => {
    const subcatParam = searchParams.get("subcat_id");
    return subcatParam ? subcatParam.split(",").filter(Boolean) : [];
  });
  const [branchId, setBranchId] = useState(() => searchParams.get("branch_id") || searchParams.get("entity_id") || "");
  const [breastSize, setBreastSize] = useState(() => searchParams.get("breast_size") || "");
  const [waistSize, setWaistSize] = useState(() => searchParams.get("waist_size") || "");
  const [sleeveSize, setSleeveSize] = useState(() => searchParams.get("sleeve_size") || "");
  const [createdFrom, setCreatedFrom] = useState(() => searchParams.get("created_from") || "");
  const [createdTo, setCreatedTo] = useState(() => searchParams.get("created_to") || "");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "");
  const [showFilters, setShowFilters] = useState(false);

  // بحث الهيدر والفلاتر: مصدر واحد من URL
  const headerSearch = searchParams.get("search")?.trim() || "";

  // Debounce filter values
  const debouncedIdFilter = useDebounce({ value: idFilter.trim(), delay: 400 });
  const debouncedCategoryId = useDebounce({ value: categoryId, delay: 300 });
  const debouncedSubcategoryIds = useDebounce({
    value: subcategoryIds,
    delay: 300,
  });
  const debouncedBranchId = useDebounce({ value: branchId, delay: 300 });
  const debouncedBreastSize = useDebounce({ value: breastSize.trim(), delay: 400 });
  const debouncedWaistSize = useDebounce({ value: waistSize.trim(), delay: 400 });
  const debouncedSleeveSize = useDebounce({ value: sleeveSize.trim(), delay: 400 });
  const debouncedCreatedFrom = useDebounce({ value: createdFrom.trim(), delay: 300 });
  const debouncedCreatedTo = useDebounce({ value: createdTo.trim(), delay: 300 });
  const debouncedStatusFilter = useDebounce({ value: statusFilter, delay: 300 });

  // Build query params: search من الهيدر/URL + بقية الفلاتر
  const queryParams: TGetClothesRequestParams = {
    page,
    per_page,
    ...(headerSearch && { search: headerSearch }),
    ...(debouncedIdFilter && { id: debouncedIdFilter }),
    ...(debouncedBranchId && { branch_id: Number(debouncedBranchId) }),
    ...(debouncedBreastSize && { breast_size: debouncedBreastSize }),
    ...(debouncedWaistSize && { waist_size: debouncedWaistSize }),
    ...(debouncedSleeveSize && { sleeve_size: debouncedSleeveSize }),
    ...(debouncedCreatedFrom && { created_from: debouncedCreatedFrom }),
    ...(debouncedCreatedTo && { created_to: debouncedCreatedTo }),
    ...(debouncedCategoryId && { category_id: Number(debouncedCategoryId) }),
    ...(debouncedSubcategoryIds.length > 0 && {
      subcat_id: debouncedSubcategoryIds.map(Number),
    }),
    ...(debouncedStatusFilter && { status: debouncedStatusFilter as TClothesStatus }),
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

  // Reset all filters (لا يمس search في الهيدر - المستخدم يمسحه من الهيدر)
  const skipNextSyncRef = useRef(false);
  const handleResetFilters = () => {
    skipNextSyncRef.current = true;
    setIdFilter("");
    setCategoryId("");
    setSubcategoryIds([]);
    setBranchId("");
    setBreastSize("");
    setWaistSize("");
    setSleeveSize("");
    setCreatedFrom("");
    setCreatedTo("");
    setStatusFilter("");
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      next.set("page", "1");
      const s = prev.get("search");
      if (s) next.set("search", s);
      return next;
    });
  };

  // Update URL params when debounced filter values change (search يبقى من الهيدر)
  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      setSearchParams((prev) => {
        const next = new URLSearchParams();
        next.set("page", prev.get("page") || "1");
        const s = prev.get("search");
        if (s) next.set("search", s);
        return next;
      });
      return;
    }
    const params = new URLSearchParams(searchParamsRef.current);
    const prevSearch = params.get("search") || null;
    const prevId = params.get("id") || null;
    const prevCategoryId = params.get("category_id") || null;
    const prevSubcatId = params.get("subcat_id") || null;
    const prevBranchId = params.get("branch_id") || params.get("entity_id") || null;
    const prevBreast = params.get("breast_size") || null;
    const prevWaist = params.get("waist_size") || null;
    const prevSleeve = params.get("sleeve_size") || null;
    const prevCreatedFrom = params.get("created_from") || null;
    const prevCreatedTo = params.get("created_to") || null;
    const prevStatus = params.get("status") || null;

    const newId = debouncedIdFilter || null;
    const newCategoryId = debouncedCategoryId || null;
    const newSubcatId =
      debouncedSubcategoryIds.length > 0
        ? debouncedSubcategoryIds.join(",")
        : null;
    const newBranchId = debouncedBranchId || null;
    const newBreast = debouncedBreastSize || null;
    const newWaist = debouncedWaistSize || null;
    const newSleeve = debouncedSleeveSize || null;
    const newCreatedFrom = debouncedCreatedFrom || null;
    const newCreatedTo = debouncedCreatedTo || null;
    const newStatus = debouncedStatusFilter || null;

    const paramsChanged =
      prevId !== newId ||
      prevCategoryId !== newCategoryId ||
      prevSubcatId !== newSubcatId ||
      prevBranchId !== newBranchId ||
      prevBreast !== newBreast ||
      prevWaist !== newWaist ||
      prevSleeve !== newSleeve ||
      prevCreatedFrom !== newCreatedFrom ||
      prevCreatedTo !== newCreatedTo ||
      prevStatus !== newStatus;

    if (!paramsChanged) return;

    const nextParams = new URLSearchParams(searchParamsRef.current);
    if (prevSearch) nextParams.set("search", prevSearch);
    if (newId) nextParams.set("id", newId);
    if (newCategoryId) nextParams.set("category_id", newCategoryId);
    if (newSubcatId) nextParams.set("subcat_id", newSubcatId);
    if (newBranchId) nextParams.set("branch_id", newBranchId);
    if (newBreast) nextParams.set("breast_size", newBreast);
    if (newWaist) nextParams.set("waist_size", newWaist);
    if (newSleeve) nextParams.set("sleeve_size", newSleeve);
    if (newCreatedFrom) nextParams.set("created_from", newCreatedFrom);
    if (newCreatedTo) nextParams.set("created_to", newCreatedTo);
    if (newStatus) nextParams.set("status", newStatus);
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }, [
    debouncedIdFilter,
    debouncedCategoryId,
    debouncedSubcategoryIds,
    debouncedBranchId,
    debouncedBreastSize,
    debouncedWaistSize,
    debouncedSleeveSize,
    debouncedCreatedFrom,
    debouncedCreatedTo,
    debouncedStatusFilter,
    setSearchParams,
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
      ready_for_rent: "متوفر",
      rented: "محجوز",
      damaged: "تالف",
      burned: "محترق",
      scratched: "مخدوش",
      repairing: "قيد الصيانة",
      die: "ميت",
    };
    return labels[status] || status;
  };

  const STATUS_FILTER_OPTIONS: { value: TClothesStatus; label: string }[] = [
    { value: "ready_for_rent", label: "متوفر" },
    { value: "rented", label: "محجوز" },
    { value: "repairing", label: "قيد الصيانة" },
    { value: "damaged", label: "تالف" },
    { value: "burned", label: "محترق" },
    { value: "scratched", label: "مخدوش" },
    { value: "die", label: "ميت" },
  ];

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

  /** اسم المنتج: الفئة والفئة الفرعية */
  const getProductName = (cloth: TClothResponse) => {
    const categoryName = cloth.category_name ?? (cloth as { category?: { name?: string } }).category?.name ?? "";
    const subDisplay = getSubcategoryDisplay(cloth);
    if (categoryName && subDisplay) return `${categoryName} (${subDisplay})`;
    if (categoryName) return categoryName;
    if (subDisplay) return subDisplay;
    return "—";
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
            <div className="mb-6 rounded-xl border bg-muted/20 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">الفلاتر</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">تحديد المنتج والموقع</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">ID</label>
                      <Input
                        placeholder="1 أو 1,2,3"
                        value={idFilter}
                        onChange={(e) => setIdFilter(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">الفرع</label>
                      <BranchesSelect
                        value={branchId}
                        onChange={(id) => setBranchId(id || "")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">القسم</label>
                      <CategoriesSelect
                        value={categoryId}
                        onChange={(id) => {
                          setCategoryId(id);
                          setSubcategoryIds([]);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">القسم الفرعي</label>
                      <SubcategoriesSelect
                        multiple
                        value={subcategoryIds}
                        onChange={(ids) => setSubcategoryIds(ids)}
                        category_id={categoryId ? Number(categoryId) : undefined}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">الحالة</label>
                      <Select
                        value={statusFilter || "all"}
                        onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="كل الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الحالات</SelectItem>
                          {STATUS_FILTER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">المقاسات</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">مقاس الصدر</label>
                      <Input
                        placeholder="بحث جزئي"
                        value={breastSize}
                        onChange={(e) => setBreastSize(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">مقاس الخصر</label>
                      <Input
                        placeholder="..."
                        value={waistSize}
                        onChange={(e) => setWaistSize(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">مقاس الكم</label>
                      <Input
                        placeholder="..."
                        value={sleeveSize}
                        onChange={(e) => setSleeveSize(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">تاريخ الإنشاء</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">من</label>
                      <Input
                        type="date"
                        value={createdFrom}
                        onChange={(e) => setCreatedFrom(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">إلى</label>
                      <Input
                        type="date"
                        value={createdTo}
                        onChange={(e) => setCreatedTo(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
            <div className="table-responsive-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-14">م</TableHead>
                    <TableHead className="text-center">اسم المنتج</TableHead>
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">المقاس</TableHead>
                    <TableHead className="text-center">الفرع</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">السعر</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending && <ClothesTableSkeleton rows={5} />}
                  {data && data.data.length > 0 ? (
                    data.data.map((cloth: TClothResponse, index: number) => {
                      const rawPrice = (cloth as { price?: number | string }).price;
                      const price = rawPrice != null && rawPrice !== "" ? Number(rawPrice) : null;
                      const rowNum = (page - 1) * per_page + index + 1;
                      return (
                        <TableRow
                          key={cloth.id}
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => navigate(`/clothes/details/${cloth.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/clothes/details/${cloth.id}`);
                            }
                          }}
                        >
                          <TableCell className="text-center text-muted-foreground tabular-nums w-14">
                            {rowNum}
                          </TableCell>
                          <TableCell className="text-center font-medium min-w-[140px]" title={getProductName(cloth)}>
                            {getProductName(cloth)}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {cloth.code}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {getMeasurementsDisplay(cloth)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getEntityDisplay(cloth)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getStatusBadgeVariant(cloth.status)}>
                              {getStatusLabel(cloth.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {price != null ? `${price.toLocaleString("ar-EG")} ج.م` : "—"}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="تعديل"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(cloth);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                title="حذف"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDelete(cloth);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
