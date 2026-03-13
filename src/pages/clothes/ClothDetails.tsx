import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  Hash,
  Building2,
  Ruler,
  Banknote,
  FileText,
  Calendar,
  Tag,
  MapPin,
} from "lucide-react";
import { useGetClothByIdQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { TClothResponse } from "@/api/v2/clothes/clothes.types";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/lib/utils";

function getProductName(cloth: TClothResponse): string {
  const categoryName =
    cloth.category_name ??
    (cloth as { category?: { name?: string } }).category?.name ??
    "";
  const subNames = cloth.subcategory_names?.length
    ? cloth.subcategory_names.join("، ")
    : (cloth as { subcategories?: { name?: string }[] }).subcategories
        ?.map((s) => s.name ?? "")
        .filter(Boolean)
        .join("، ") ?? "";
  if (categoryName && subNames) return `${categoryName} (${subNames})`;
  if (categoryName) return categoryName;
  if (subNames) return subNames;
  return "—";
}

function getMeasurementsDisplay(cloth: TClothResponse): string {
  if (cloth.measurements?.trim()) return cloth.measurements;
  const parts = [cloth.breast_size, cloth.waist_size, cloth.sleeve_size].filter(
    Boolean
  );
  return parts.length ? parts.join(" / ") : "—";
}

function getEntityDisplay(cloth: TClothResponse): string {
  if (cloth.entity_name?.trim()) return cloth.entity_name;
  const typeLabel =
    cloth.entity_type === "branch"
      ? "فرع"
      : cloth.entity_type === "factory"
        ? "مصنع"
        : "ورشة";
  return `${typeLabel} (${cloth.entity_id})`;
}

const STATUS_LABELS: Record<string, string> = {
  ready_for_rent: "متوفر",
  rented: "محجوز",
  damaged: "تالف",
  burned: "محترق",
  scratched: "مخدوش",
  repairing: "قيد الصيانة",
  die: "ميت",
};

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function getStatusVariant(
  status: string
): "success" | "info" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "ready_for_rent":
      return "success";
    case "rented":
      return "info";
    case "damaged":
    case "burned":
    case "scratched":
    case "repairing":
      return "warning";
    case "die":
      return "destructive";
    default:
      return "secondary";
  }
}

function StatBox({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        accent && "border-primary/20 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn("text-sm font-semibold text-foreground", accent && "text-primary text-base")}>
        {value}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border/50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={cn("text-sm font-medium text-foreground sm:text-end", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

function ClothDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="h-32 bg-muted/40" />
        <div className="p-6 sm:p-8 -mt-12 relative">
          <Skeleton className="h-16 w-16 rounded-2xl absolute top-0 right-6" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-8 w-3/4 max-w-md" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ClothDetails() {
  const { id } = useParams<{ id: string }>();
  const clothId = id ? parseInt(id, 10) : 0;

  const { data: cloth, isPending, isError, error } = useQuery({
    ...useGetClothByIdQueryOptions(clothId),
    enabled: !!clothId,
  });

  if (isError) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col">
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 -mr-2" asChild>
            <Link to="/clothes/list">
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">تفاصيل المنتج</span>
        </nav>
        <Card className="flex-1 border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center rounded-2xl">
          <CardContent className="py-16 px-6 text-center max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
              <Package className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-semibold text-lg text-foreground mb-2">تعذر تحميل المنتج</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error?.message ?? "حدث خطأ أثناء جلب البيانات. الرجاء المحاولة لاحقاً."}
            </p>
            <Button asChild>
              <Link to="/clothes/list" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للقائمة
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rawPrice = cloth ? (cloth as { price?: number | string }).price : null;
  const price =
    rawPrice != null && rawPrice !== ""
      ? Number(rawPrice).toLocaleString("ar-EG")
      : null;

  return (
    <div dir="rtl" className="space-y-8 pb-4">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" className="gap-1.5 -mr-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/clothes/list">
            <ArrowLeft className="h-4 w-4" />
            المنتجات
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {cloth ? getProductName(cloth) : "تفاصيل المنتج"}
        </span>
      </nav>

      {isPending ? (
        <ClothDetailsSkeleton />
      ) : !cloth ? (
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-5">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-lg text-foreground">لم يتم العثور على المنتج</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              قد يكون المحتوى محذوفاً أو المعرف غير صحيح.
            </p>
            <Button variant="outline" className="mt-6 gap-2" asChild>
              <Link to="/clothes/list">
                <ArrowLeft className="h-4 w-4" />
                العودة للقائمة
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Hero card: صورة رمزية + عنوان + حالة + ملخص سريع */}
          <Card
            className={cn(
              "rounded-2xl border-2 overflow-hidden shadow-sm",
              cloth.status === "ready_for_rent" && "border-l-4 border-l-emerald-500/60",
              cloth.status === "rented" && "border-l-4 border-l-blue-500/60",
              (cloth.status === "repairing" || cloth.status === "damaged" || cloth.status === "burned" || cloth.status === "scratched") &&
                "border-l-4 border-l-amber-500/60",
              cloth.status === "die" && "border-l-4 border-l-rose-500/60"
            )}
          >
            <div className="h-24 sm:h-28 bg-gradient-to-b from-muted/60 to-muted/20" />
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-background border-2 border-border shadow-lg">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-1 pb-0.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight break-words">
                      {getProductName(cloth)}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">{cloth.code}</span>
                      <span>·</span>
                      <span>#{cloth.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {price != null && (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-primary font-bold tabular-nums">
                      <Banknote className="h-4 w-4" />
                      {price} ج.م
                    </div>
                  )}
                  <Badge
                    variant={getStatusVariant(cloth.status)}
                    className="text-sm px-4 py-1.5 rounded-full font-medium"
                  >
                    {getStatusLabel(cloth.status)}
                  </Badge>
                </div>
              </div>

              {/* شريط إحصائيات سريعة */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <StatBox
                  icon={MapPin}
                  label="الفرع"
                  value={getEntityDisplay(cloth)}
                />
                <StatBox
                  icon={Ruler}
                  label="المقاسات"
                  value={getMeasurementsDisplay(cloth)}
                />
                <StatBox
                  icon={Banknote}
                  label="السعر"
                  value={price != null ? `${price} ج.م` : "—"}
                  accent={price != null}
                />
                <StatBox
                  icon={Calendar}
                  label="آخر تحديث"
                  value={formatDate(cloth.updated_at)}
                />
              </div>
            </CardContent>
          </Card>

          {/* بطاقتان: معلومات أساسية | مقاسات وسعر */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl overflow-hidden border-r-4 border-r-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  المعلومات الأساسية
                </CardTitle>
                <CardDescription>بيانات تعريف المنتج والموقع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <DetailRow icon={Hash} label="الكود" value={cloth.code} mono />
                <DetailRow label="اسم المنتج (الفئة)" value={getProductName(cloth)} />
                <DetailRow icon={Building2} label="الفرع / الموقع" value={getEntityDisplay(cloth)} />
                <DetailRow label="تاريخ الإنشاء" value={formatDate(cloth.created_at)} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl overflow-hidden border-r-4 border-r-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  المقاسات والسعر
                </CardTitle>
                <CardDescription>مقاييس المنتج وقيمته</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <DetailRow label="المقاس (عام)" value={getMeasurementsDisplay(cloth)} />
                {(cloth.breast_size || cloth.waist_size || cloth.sleeve_size) && (
                  <>
                    {cloth.breast_size && <DetailRow label="مقاس الصدر" value={cloth.breast_size} />}
                    {cloth.waist_size && <DetailRow label="مقاس الخصر" value={cloth.waist_size} />}
                    {cloth.sleeve_size && <DetailRow label="مقاس الكم" value={cloth.sleeve_size} />}
                  </>
                )}
                <DetailRow
                  icon={Banknote}
                  label="السعر"
                  value={
                    price != null ? (
                      <span className="text-primary font-semibold tabular-nums">{price} ج.م</span>
                    ) : (
                      "—"
                    )
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* الملاحظات */}
          {(cloth.notes?.trim() || cloth.description?.trim()) && (
            <Card className="rounded-2xl overflow-hidden border-r-4 border-r-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  الملاحظات والوصف
                </CardTitle>
                <CardDescription>تفاصيل إضافية عن المنتج</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-muted/30 p-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {[cloth.notes?.trim(), cloth.description?.trim()]
                    .filter(Boolean)
                    .join("\n\n")}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
