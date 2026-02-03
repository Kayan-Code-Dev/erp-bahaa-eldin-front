import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { TOrderItem } from "@/api/v2/orders/orders.types";
import { getOrderTypeLabel, getStatusLabel } from "@/api/v2/orders/order.utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Calendar,
  Factory,
  Ruler,
  Shirt,
  StickyNote,
} from "lucide-react";
import { Link, useParams } from "react-router";
import OrderDetailsSkeleton from "./OrderDetailsSkeleton";

const getDiscountTypeLabel = (type?: string | null) => {
  if (!type || type === "none") return "—";
  if (type === "percentage") return "نسبة مئوية";
  if (type === "fixed") return "مبلغ ثابت";
  return type;
};

/** عرض حقل مع التسمية — يظهر الصف فقط إن كانت القيمة موجودة إن رغبت */
function FieldRow({
  label,
  value,
  showWhenEmpty = false,
}: {
  label: string;
  value: string | number | null | undefined;
  showWhenEmpty?: boolean;
}) {
  const str =
    value === null || value === undefined
      ? ""
      : String(value).trim();
  if (!showWhenEmpty && !str) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-medium text-foreground">{str || "—"}</p>
    </div>
  );
}

/** قسم المقاسات (من الطلب: sleeve_length, forearm, ...) */
function MeasurementsSection({ item }: { item: TOrderItem }) {
  const fields: { key: keyof TOrderItem; label: string }[] = [
    { key: "sleeve_length", label: "طول الكم" },
    { key: "forearm", label: "الزند" },
    { key: "shoulder_width", label: "عرض الكتف" },
    { key: "cuffs", label: "الإسوار" },
    { key: "waist", label: "الوسط" },
    { key: "chest_length", label: "طول الصدر" },
    { key: "total_length", label: "الطول الكلي" },
    { key: "hinch", label: "الهش" },
    { key: "dress_size", label: "مقاس الفستان" },
  ];
  const hasAny = fields.some(
    (f) => item[f.key] != null && String(item[f.key]).trim() !== ""
  );
  if (!hasAny) return null;
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-3">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">مقاسات الطلب / التفصيل</CardTitle>
            <CardDescription>المقاسات المرسلة مع هذا المنتج في الطلب</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fields.map(({ key, label }) => (
            <FieldRow
              key={key}
              label={label}
              value={item[key] as string | null | undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** مقاسات المنتج (من الـ API على القطعة: breast_size, waist_size, sleeve_size) */
function ProductSizesSection({ item }: { item: TOrderItem }) {
  const hasAny =
    (item.breast_size != null && String(item.breast_size).trim() !== "") ||
    (item.waist_size != null && String(item.waist_size).trim() !== "") ||
    (item.sleeve_size != null && String(item.sleeve_size).trim() !== "");
  if (!hasAny) return null;
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-3">
        <div className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">مقاسات المنتج</CardTitle>
            <CardDescription>مقاس الصدر، الوسط، الكم للقطعة</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="مقاس الصدر" value={item.breast_size} />
          <FieldRow label="مقاس الوسط" value={item.waist_size} />
          <FieldRow label="مقاس الكم" value={item.sleeve_size} />
        </div>
      </CardContent>
    </Card>
  );
}

function OrderItemDetails() {
  const { orderId: orderIdParam, itemId: itemIdParam } = useParams<{
    orderId: string;
    itemId: string;
  }>();
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : 0;
  const itemId = itemIdParam ? parseInt(itemIdParam, 10) : 0;

  const { data: order, isPending } = useQuery({
    ...useGetOrderDetailsQueryOptions(orderId),
    enabled: !!orderId,
  });

  const item = order?.items?.find((i) => i.id === itemId);

  if (isPending) {
    return <OrderDetailsSkeleton />;
  }

  if (!order || !item) {
    return (
      <div className="space-y-4" dir="rtl">
        <Link
          to={orderId ? `/orders/${orderId}` : "/orders/list"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          {orderId ? "العودة لتفاصيل الطلب" : "قائمة الطلبات"}
        </Link>
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              المنتج غير موجود أو تمت إزالته.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6 py-6 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm">
          <Link
            to="/orders/list"
            className="text-muted-foreground hover:text-foreground"
          >
            قائمة الطلبات
          </Link>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <Link
            to={`/orders/${order.id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            الطلب #{order.id}
          </Link>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <span className="font-medium text-foreground">
            {item.code} — {item.name}
          </span>
        </nav>

        {/* عنوان الصفحة */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              تفاصيل المنتج: {item.name}
            </h1>
            <p className="text-muted-foreground">
              الكود: {item.code} • الطلب #{order.id}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/orders/${order.id}`}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لتفاصيل الطلب
            </Link>
          </Button>
        </div>

        {/* أساسيات المنتج */}
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">معلومات أساسية</CardTitle>
                <CardDescription>الكود، الاسم، الوصف، النوع والكمية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FieldRow label="رقم القطعة" value={item.id} showWhenEmpty />
              <FieldRow label="الكود" value={item.code} showWhenEmpty />
              <FieldRow label="الاسم" value={item.name} showWhenEmpty />
              <FieldRow label="الوصف" value={item.description} />
              <FieldRow label="نوع الطلب" value={getOrderTypeLabel(item.type)} showWhenEmpty />
              <FieldRow label="الكمية" value={item.quantity} showWhenEmpty />
              <FieldRow label="الحالة" value={getStatusLabel(item.status)} showWhenEmpty />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  قابل للإرجاع
                </p>
                <p className="font-medium">
                  {item.returnable === 1 ? "نعم" : "لا"}
                </p>
              </div>
              <FieldRow label="تاريخ الإنشاء" value={formatDate(item.created_at)} />
              <FieldRow label="تاريخ التحديث" value={formatDate(item.updated_at)} />
            </div>
          </CardContent>
        </Card>

        {/* مقاسات المنتج (breast_size, waist_size, sleeve_size) */}
        <ProductSizesSection item={item} />

        {/* مقاسات الطلب (sleeve_length, forearm, ...) */}
        <MeasurementsSection item={item} />

        {/* مالية */}
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">المبالغ والخصم</CardTitle>
                <CardDescription>السعر، الخصم، المدفوع والمتبقي للقطعة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FieldRow label="السعر (ج.م)" value={item.price} showWhenEmpty />
              <FieldRow label="نوع الخصم" value={getDiscountTypeLabel(item.discount_type)} />
              <FieldRow
                label="قيمة الخصم"
                value={
                  item.discount_value != null
                    ? item.discount_type === "percentage"
                      ? `${item.discount_value}%`
                      : `${item.discount_value} ج.م`
                    : null
                }
              />
              <FieldRow label="مدفوع القطعة (ج.م)" value={item.item_paid} showWhenEmpty />
              <FieldRow label="متبقي القطعة (ج.م)" value={item.item_remaining} showWhenEmpty />
            </div>
          </CardContent>
        </Card>

        {/* إيجار (إن وجد) */}
        {(item.days_of_rent != null ||
          item.occasion_datetime ||
          item.delivery_date) && (
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">تواريخ الإيجار</CardTitle>
                  <CardDescription>أيام الإيجار، المناسبة، التسليم</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FieldRow label="عدد أيام الإيجار" value={item.days_of_rent} />
                <FieldRow label="تاريخ المناسبة" value={item.occasion_datetime ? formatDate(item.occasion_datetime) : null} />
                <FieldRow label="تاريخ التسليم" value={item.delivery_date ? formatDate(item.delivery_date) : null} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* مصنع */}
        {(item.factory_status != null ||
          item.factory_rejection_reason != null ||
          item.factory_notes != null) && (
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">حالة المصنع</CardTitle>
                  <CardDescription>حالة التفصيل والمصنع</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FieldRow label="حالة المصنع" value={item.factory_status} />
                <FieldRow label="سبب الرفض" value={item.factory_rejection_reason} />
                <FieldRow label="ملاحظات المصنع" value={item.factory_notes} />
                <FieldRow
                  label="تاريخ القبول"
                  value={item.factory_accepted_at ? formatDate(item.factory_accepted_at) : null}
                />
                <FieldRow
                  label="تاريخ الرفض"
                  value={item.factory_rejected_at ? formatDate(item.factory_rejected_at) : null}
                />
                <FieldRow
                  label="تاريخ التسليم المتوقع"
                  value={
                    item.factory_expected_delivery_date
                      ? formatDate(item.factory_expected_delivery_date)
                      : null
                  }
                />
                <FieldRow
                  label="تاريخ التسليم الفعلي"
                  value={
                    item.factory_delivered_at
                      ? formatDate(item.factory_delivered_at)
                      : null
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ملاحظات */}
        {item.notes != null && String(item.notes).trim() !== "" && (
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">ملاحظات القطعة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-foreground">{item.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" asChild>
            <Link to={`/orders/${order.id}`}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لتفاصيل الطلب
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderItemDetails;
