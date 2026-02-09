import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { TClientResponse } from "@/api/v2/clients/clients.types";
import { TEntity } from "@/lib/types/entity.types";
import {
  ChevronRight,
  Loader2,
  User,
  FileText,
  CalendarClock,
  Percent,
  Shirt,
  Banknote,
  StickyNote,
  Tag,
} from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/custom/DatePicker";
import { SimpleDateTimePicker } from "@/components/custom/SimpleDateTimePicker";
import { useCreateOrderMutationOptions } from "@/api/v2/orders/orders.hooks";
import { TCreateOrderRequest } from "@/api/v2/orders/orders.types";
import { useMutation } from "@tanstack/react-query";

type SelectedCloth = {
  id: number;
  code: string;
  name: string;
  price: number;
};

type LocationState = {
  client_id: number;
  entity_type: TEntity;
  entity_id: number;
  delivery_date: string;
  selected_clothes: SelectedCloth[];
  client?: TClientResponse;
};

// Zod schema for order form (تواريخ الإيجار على مستوى الطلب وليس القطعة)
const orderItemSchema = z
  .object({
    cloth_id: z.number(),
    price: z.number().min(1, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
    type: z.enum(["rent", "buy"], {
      required_error: "يجب اختيار نوع الطلب",
    }),
    days_of_rent: z.number().min(1).optional(),
    occasion_datetime: z.date().optional(),
    delivery_date: z.date().optional(),
    has_discount: z.boolean().default(false),
    discount_type: z.enum(["none", "percentage", "fixed"]).optional(),
    discount_value: z.number().min(0).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.has_discount) {
        return (
          data.discount_type &&
          data.discount_type !== "none" &&
          data.discount_value !== undefined
        );
      }
      return true;
    },
    {
      message: "يجب اختيار نوع الخصم وقيمة الخصم",
      path: ["discount_value"],
    }
  );


const formSchema = z
  .object({
    paid: z.number().min(0, "المبلغ المدفوع يجب أن يكون أكبر من أو يساوي صفر"),
    delivery_date: z.date({
      required_error: "يجب اختيار تاريخ التسليم",
    }),
    occasion_datetime: z.date().optional(),
    days_of_rent: z.number().min(1, "عدد أيام الإيجار على الأقل يوم واحد").optional(),
    has_order_discount: z.boolean().default(false),
    order_discount_type: z.enum(["none", "percentage", "fixed"]).optional(),
    order_discount_value: z.number().min(0).optional(),
    order_notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1, "يجب اختيار منتج واحد على الأقل"),
  })
  .refine(
    (data) => {
      const hasRent = data.items.some((i) => i.type === "rent");
      if (hasRent && (!data.days_of_rent || data.days_of_rent < 1)) return false;
      return true;
    },
    { message: "عدد أيام الإيجار مطلوب عند وجود قطع إيجار", path: ["days_of_rent"] }
  )
  .refine(
    (data) => {
      const hasRent = data.items.some((i) => i.type === "rent");
      if (hasRent && !data.occasion_datetime) return false;
      return true;
    },
    { message: "تاريخ المناسبة مطلوب للإيجار", path: ["occasion_datetime"] }
  )
  .refine(
    (data) => {
      if (data.has_order_discount) {
        return (
          data.order_discount_type &&
          data.order_discount_type !== "none" &&
          data.order_discount_value !== undefined
        );
      }
      return true;
    },
    {
      message: "يجب اختيار نوع الخصم وقيمة الخصم",
      path: ["order_discount_value"],
    }
  )
  .superRefine((data, ctx) => {
    // Check if any item is buy type
    const hasBuyItem = data.items.some((item) => item.type === "buy");
    
    // If buy order, must have exactly 1 item
    if (hasBuyItem && data.items.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "طلبات الشراء يجب أن تحتوي على قطعة واحدة فقط",
        path: ["items"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function CreateOrderForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState | null;

  // Initialize form with default values from location state
  const defaultValues = useMemo<FormValues>(() => {
    if (!locationState) {
      return {
        paid: 0,
        delivery_date: new Date(),
        occasion_datetime: undefined,
        days_of_rent: undefined,
        has_order_discount: false,
        order_discount_type: "none",
        order_discount_value: 0,
        order_notes: "",
        items: [],
      };
    }

    const deliveryDate = new Date(locationState.delivery_date);
    const hasRent = locationState.selected_clothes.length > 0;

    return {
      paid: 0,
      delivery_date: deliveryDate,
      occasion_datetime: hasRent ? new Date() : undefined,
      days_of_rent: hasRent ? 1 : undefined,
      has_order_discount: false,
      order_discount_type: "none",
      order_discount_value: 0,
      order_notes: "",
      items: locationState.selected_clothes.map((cloth) => ({
        cloth_id: cloth.id,
        price: cloth.price,
        type: "rent" as const,
        has_discount: false,
        discount_type: "none" as const,
        discount_value: 0,
        notes: "",
      })),
    };
  }, [locationState]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const hasOrderDiscount = useWatch({
    control: form.control,
    name: "has_order_discount",
  });

  const items = useWatch({ control: form.control, name: "items" });
  const hasRentItem = (items ?? []).some((i) => i?.type === "rent");

  const createOrderMutation = useMutation(useCreateOrderMutationOptions());
  const { mutate: createOrder, isPending: isCreatingOrder } =
    createOrderMutation;

  useEffect(() => {
    // Validate required state
    if (!locationState) {
      toast.error("يجب عليك اختيار العميل والمنتجات أولاً");
      navigate("/orders/choose-client");
      return;
    }

    const {
      client_id,
      entity_type,
      entity_id,
      delivery_date,
      selected_clothes,
    } = locationState;

    // Validate each required field
    if (!client_id || typeof client_id !== "number") {
      toast.error("يجب عليك اختيار عميل");
      navigate("/orders/choose-client");
      return;
    }

    if (
      !entity_type ||
      !["branch", "factory", "workshop"].includes(entity_type)
    ) {
      toast.error("يجب عليك اختيار نوع المكان");
      navigate("/orders/choose-clothes", {
        state: locationState.client ? { client: locationState.client } : null,
      });
      return;
    }

    if (!entity_id || typeof entity_id !== "number") {
      toast.error("يجب عليك اختيار المكان");
      navigate("/orders/choose-clothes", {
        state: locationState.client ? { client: locationState.client } : null,
      });
      return;
    }

    if (!delivery_date || typeof delivery_date !== "string") {
      toast.error("يجب عليك اختيار تاريخ التسليم");
      navigate("/orders/choose-clothes", {
        state: locationState.client ? { client: locationState.client } : null,
      });
      return;
    }

    if (
      !selected_clothes ||
      !Array.isArray(selected_clothes) ||
      selected_clothes.length === 0
    ) {
      toast.error("يجب عليك اختيار منتج واحد على الأقل");
      navigate("/orders/choose-clothes", {
        state: locationState.client ? { client: locationState.client } : null,
      });
      return;
    }
  }, [locationState, navigate]);

  // Don't render if state is invalid (will redirect)
  if (!locationState) {
    return null;
  }

  const {
    client_id,
    entity_type,
    entity_id,
    delivery_date,
    selected_clothes,
    client,
  } = locationState;

  // Additional validation check before rendering
  if (
    !client_id ||
    !entity_type ||
    !entity_id ||
    !delivery_date ||
    !selected_clothes ||
    selected_clothes.length === 0
  ) {
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const orderLevelOccasionDatetime = values.occasion_datetime
        ? format(values.occasion_datetime, "yyyy-MM-dd HH:mm:ss")
        : undefined;
      const orderLevelDaysOfRent = values.days_of_rent ?? undefined;

      const requestData: TCreateOrderRequest = {
        existing_client: true,
        client_id,
        entity_type,
        entity_id,
        delivery_date: format(values.delivery_date, "yyyy-MM-dd HH:mm:ss"),
        ...(orderLevelOccasionDatetime && { occasion_datetime: orderLevelOccasionDatetime }),
        ...(orderLevelDaysOfRent != null && { days_of_rent: orderLevelDaysOfRent }),
        ...(values.has_order_discount &&
          values.order_discount_type &&
          values.order_discount_type !== "none" &&
          (values.order_discount_value ?? 0) > 0
          ? {
              discount_type: values.order_discount_type,
              discount_value: values.order_discount_value ?? 0,
            }
          : {}),
        ...(values.order_notes ? { order_notes: values.order_notes } : {}),
        items: values.items.map((item) => {
          const base = {
            cloth_id: item.cloth_id,
            price: item.price,
            quantity: 1,
            paid: 0,
            type: item.type,
            ...(item.has_discount &&
            item.discount_type &&
            item.discount_type !== "none"
              ? {
                  discount_type: item.discount_type,
                  discount_value: item.discount_value ?? 0,
                }
              : {}),
            ...(item.notes ? { notes: item.notes } : {}),
          };
          return base;
        }),
      };

      createOrder(requestData, {
        onSuccess: () => {
          toast.success("تم إنشاء الطلب بنجاح");
          navigate("/orders/list");
        },
        onError: (error: any) => {
          toast.error("خطأ في إنشاء الطلب", {
            description: error?.message || "حدث خطأ غير متوقع",
          });
        },
      });
    } catch (error: any) {
      toast.error("خطأ في إنشاء الطلب", {
        description: error?.message || "حدث خطأ غير متوقع",
      });
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl space-y-6 py-6 px-4">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm"
          aria-label="مسار التنقل"
        >
          <Link
            to="/orders/choose-client"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            اختيار العميل
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <Link
            to="/orders/choose-clothes"
            className="text-muted-foreground transition-colors hover:text-foreground"
            state={client ? { client } : null}
          >
            اختيار المنتجات
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <span className="font-medium text-foreground">إنشاء الطلب</span>
        </nav>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* بطاقة واحدة شاملة لكل تفاصيل الطلب */}
            <Card className="overflow-hidden border shadow-sm">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">إنشاء طلب إيجار جديد</CardTitle>
                    <CardDescription>
                      بيانات العميل، تفاصيل الطلب، والقطع المختارة في بطاقة واحدة مرتبة
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 pt-6">
                {/* معلومات العميل داخل البطاقة */}
                {client && (
                  <section aria-label="معلومات العميل" className="rounded-xl border bg-muted/10 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">معلومات العميل</h2>
                        <p className="text-xs text-muted-foreground">العميل المختار لهذا الطلب</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          الاسم الكامل
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {client.first_name} {client.middle_name} {client.last_name}
                        </p>
                      </div>
                      <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          الرقم القومي
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {client.national_id || "—"}
                        </p>
                      </div>
                      <div className="space-y-1 rounded-lg border bg-card/60 p-3 sm:col-span-2 md:col-span-1">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          أرقام الهاتف
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {client.phones?.map((p) => p.phone).join("، ") || "—"}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                <Separator />

                {/* 1) المبلغ وتاريخ التسليم + تواريخ الإيجار على مستوى الطلب */}
                <section aria-label="تفاصيل الطلب" className="space-y-6">
                  {/* المبلغ وتاريخ التسليم */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      المدفوع وتاريخ التسليم
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="paid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المبلغ المدفوع (ج.م)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="h-10"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ التسليم</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="اختر تاريخ التسليم"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* تواريخ الإيجار على مستوى الطلب */}
                  {hasRentItem && (
                    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
                      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CalendarClock className="h-4 w-4 text-primary" />
                        تواريخ الإيجار (تنطبق على الطلب بالكامل)
                      </h3>
                      <p className="mb-4 text-xs text-muted-foreground">
                        حدد تاريخ ووقت المناسبة وعدد أيام الإيجار لجميع القطع المؤجرة.
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="occasion_datetime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاريخ ووقت المناسبة</FormLabel>
                              <FormControl>
                                <SimpleDateTimePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="اختر تاريخ ووقت المناسبة"
                                  minDate={new Date()}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="days_of_rent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عدد أيام الإيجار</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="1"
                                  className="h-10"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? parseInt(e.target.value, 10) : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </section>

                <Separator />

                {/* 2) خصم الطلب وملاحظات الطلب */}
                <section aria-label="خصم الطلب والملاحظات" className="space-y-6">
                  {/* خصم الطلب */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      خصم الطلب
                    </h3>
                    <FormField
                      control={form.control}
                      name="has_order_discount"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border bg-muted/10 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              إضافة خصم على الطلب
                            </FormLabel>
                            <CardDescription>
                              تفعيل الخصم على مستوى الطلب بالكامل
                            </CardDescription>
                          </div>
                          <FormControl>
                            <Switch
                              dir="ltr"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {hasOrderDiscount && (
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="order_discount_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع الخصم</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="اختر نوع الخصم" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    نسبة مئوية
                                  </SelectItem>
                                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="order_discount_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>قيمة الخصم</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="h-10"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* ملاحظات الطلب */}
                  <FormField
                    control={form.control}
                    name="order_notes"
                    render={({ field }) => (
                      <FormItem>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <StickyNote className="h-4 w-4 text-muted-foreground" />
                          ملاحظات الطلب
                        </h3>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل ملاحظات حول الطلب (اختياري)..."
                            className="resize-none rounded-lg"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator />

                {/* 3) تفاصيل القطع المختارة داخل نفس الكارد */}
                <section aria-label="تفاصيل القطع المختارة" className="space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Shirt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          تفاصيل المنتج المختار
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          أدخل السعر، نوع الطلب، الخصم والملاحظات لكل قطعة — {fields.length} قطعة
                        </p>
                      </div>
                    </div>
                  </div>

                  {fields.map((field, index) => {
                    const cloth = selected_clothes.find(
                      (c) => c.id === field.cloth_id
                    );
                    const itemHasDiscount = items?.[index]?.has_discount;
                    const itemType = items?.[index]?.type;

                    return (
                      <div
                        key={field.id}
                        className="rounded-2xl border-2 border-muted/40 bg-card shadow-sm transition-shadow hover:border-primary/20 hover:shadow-md"
                      >
                        {/* هيدر القطعة: رقم + كود + اسم + badge النوع */}
                        <div className="flex flex-row items-center gap-3 border-b bg-muted/10 px-4 py-4">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                            aria-hidden
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold text-foreground">
                              {cloth?.name}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                              الكود: {cloth?.code}
                            </p>
                          </div>
                          <Badge
                            variant={itemType === "buy" ? "secondary" : "default"}
                            className="shrink-0"
                          >
                            {itemType === "buy" ? "شراء" : "إيجار"}
                          </Badge>
                        </div>

                        <div className="space-y-4 px-4 pb-5 pt-4">
                          {/* السعر ونوع الطلب — في صندوق واحد واضح */}
                          <div className="rounded-xl border bg-muted/5 p-4">
                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Banknote className="h-4 w-4" />
                              السعر ونوع الطلب
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`items.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>السعر (ج.م)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="h-10"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      <span className="flex items-center gap-1.5">
                                        <Tag className="h-4 w-4" />
                                        نوع الطلب
                                      </span>
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-10">
                                          <SelectValue placeholder="اختر نوع الطلب" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="rent">إيجار</SelectItem>
                                        <SelectItem value="buy">شراء</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* خصم القطعة */}
                          <div className="rounded-xl border bg-muted/5 p-4">
                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Percent className="h-4 w-4" />
                              خصم القطعة
                            </p>
                            <FormField
                              control={form.control}
                              name={`items.${index}.has_discount`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-medium">
                                      إضافة خصم على هذه القطعة
                                    </FormLabel>
                                    <CardDescription className="text-xs">
                                      نسبة مئوية أو مبلغ ثابت
                                    </CardDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      dir="ltr"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            {itemHasDiscount && (
                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.discount_type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>نوع الخصم</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-10">
                                            <SelectValue placeholder="اختر نوع الخصم" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="percentage">
                                            نسبة مئوية
                                          </SelectItem>
                                          <SelectItem value="fixed">
                                            مبلغ ثابت
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.discount_value`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>قيمة الخصم</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          placeholder="0.00"
                                          className="h-10"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          {/* ملاحظات القطعة */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem className="rounded-xl border bg-muted/5 p-4">
                                <FormLabel>
                                  <span className="flex items-center gap-1.5">
                                    <StickyNote className="h-4 w-4" />
                                    ملاحظات القطعة
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ملاحظات خاصة بهذه القطعة (اختياري)..."
                                    className="resize-none rounded-lg border-0 bg-transparent focus-visible:ring-0"
                                    rows={2}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </section>
              </CardContent>

              {/* أزرار الإجراء أسفل نفس الكارد */}
              <CardFooter className="flex flex-col gap-3 border-t bg-card pt-6 sm:flex-row sm:justify-end sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="order-2 sm:order-1 h-11 min-w-[120px]"
                  onClick={() => navigate(-1)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="order-1 h-11 min-w-[160px] sm:order-2"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    "إنشاء الطلب"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default CreateOrderForm;
