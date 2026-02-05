import { useGetClothesUnavailableDaysRangesbyIdsQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import {
  useGetOrderDetailsQueryOptions,
  useUpdateOrderMutationOptions,
} from "@/api/v2/orders/orders.hooks";
import { TOrder, TUpdateOrderRequest } from "@/api/v2/orders/orders.types";
import { DatePicker } from "@/components/custom/DatePicker";
import { SimpleDateTimePicker } from "@/components/custom/SimpleDateTimePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ChevronRight, Loader2Icon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import * as z from "zod";
import OrderDetailsSkeleton from "../OrderDetailsSkeleton";

type SelectedCloth = {
  id: number;
  code: string;
  name: string;
  price?: number;
};

type RemovedItemInfo = {
  originalItemId: number;
  replacementId: number | null;
  originalPrice?: number; // Original price of the removed item
};

type LocationState = {
  order: TOrder;
  clothes: SelectedCloth[];
  delivery_date: string;
  removedItems: RemovedItemInfo[];
};

// Zod schema for order item
const orderItemSchema = z
  .object({
    cloth_id: z.number(),
    price: z.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
    type: z.enum(["rent", "buy"], {
      required_error: "يجب اختيار نوع الطلب",
    }),
    days_of_rent: z
      .number()
      .min(1, "عدد أيام الإيجار يجب أن يكون على الأقل يوم واحد")
      .optional(),
    occasion_datetime: z.date({
      required_error: "يجب اختيار تاريخ المناسبة",
    }),
    delivery_date: z.date({
      required_error: "يجب اختيار تاريخ التسليم",
    }),
    has_discount: z.boolean().default(false),
    discount_type: z.enum(["none", "percentage", "fixed"]).optional(),
    discount_value: z.number().min(0).optional(),
    minPrice: z.number().optional(), // Minimum price for validation
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "rent" && !data.days_of_rent) {
        return false;
      }
      return true;
    },
    {
      message: "عدد أيام الإيجار مطلوب لنوع الإيجار",
      path: ["days_of_rent"],
    }
  )
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
  )
  .superRefine((data, ctx) => {
    if (data.minPrice !== undefined && data.price < data.minPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `السعر يجب أن يكون أكبر من أو يساوي ${data.minPrice} ج.م`,
        path: ["price"],
      });
    }
  });

const formSchema = z
  .object({
    paid: z.number().min(0, "المبلغ المدفوع يجب أن يكون أكبر من أو يساوي صفر"),
    visit_datetime: z.date({
      required_error: "يجب اختيار تاريخ ووقت الزيارة",
    }),
    has_order_discount: z.boolean().default(false),
    order_discount_type: z.enum(["none", "percentage", "fixed"]).optional(),
    order_discount_value: z.number().min(0).optional(),
    order_notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1, "يجب اختيار منتج واحد على الأقل"),
    minPaid: z.number().optional(), // Minimum paid amount
  })
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
    // Check minimum paid amount (for existing orders)
    if (data.minPaid !== undefined && data.paid < data.minPaid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `المبلغ المدفوع يجب أن يكون أكبر من أو يساوي ${data.minPaid} ج.م`,
        path: ["paid"],
      });
    }

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

function UpdateOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState | null;

  const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation(
    useUpdateOrderMutationOptions()
  );
  // Fetch full order details to get item prices
  const { data: orderDetails, isPending: isLoadingOrder } = useQuery({
    ...useGetOrderDetailsQueryOptions(locationState?.order?.id || 0),
    enabled: !!locationState?.order?.id,
  });

  const fullOrder = orderDetails || locationState?.order;

  useEffect(() => {
    // Validate state
    if (!locationState) {
      toast.error("يجب عليك اختيار الطلب المنتجات أولاً");
      setTimeout(() => {
        navigate("/orders/list");
      }, 0);
      return;
    }

    const { order, clothes, delivery_date } = locationState;

    // Validate order
    if (!order || typeof order !== "object" || !order.id) {
      toast.error("الطلب غير صحيح");
      setTimeout(() => {
        navigate("/orders/list");
      }, 0);
      return;
    }

    // Validate products array
    if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
      toast.error("يجب اختيار منتج واحد على الأقل");
      setTimeout(() => {
        navigate("/orders/update-clothes-in-order", {
          state: { order },
        });
      }, 0);
      return;
    }

    // Validate delivery_date
    if (!delivery_date || typeof delivery_date !== "string") {
      toast.error("تاريخ التسليم غير صحيح");
      setTimeout(() => {
        navigate("/orders/update-clothes-in-order", {
          state: { order },
        });
      }, 0);
      return;
    }
  }, [locationState, navigate]);

  // Don't render if state is invalid (will redirect)
  if (!locationState || isLoadingOrder) {
    return <OrderDetailsSkeleton />;
  }

  const { clothes, delivery_date } = locationState;
  const removedItems = locationState.removedItems || [];

  // Create a map of order items by id for quick lookup
  const orderItemsMap = useMemo(() => {
    const map = new Map<number, TOrder["items"][0]>();
    if (fullOrder?.items) {
      fullOrder.items.forEach((item) => {
        map.set(item.id, item);
      });
    }
    return map;
  }, [fullOrder?.items]);

  // Get removed items with their details
  const removedItemsDetails = useMemo(() => {
    return removedItems
      .map((removed) => {
        const originalItem = orderItemsMap.get(removed.originalItemId);
        if (!originalItem) return null;
        return {
          originalItemId: removed.originalItemId,
          replacementId: removed.replacementId,
          code: originalItem.code,
          name: originalItem.name,
        };
      })
      .filter(
        (
          item
        ): item is {
          originalItemId: number;
          replacementId: number | null;
          code: string;
          name: string;
        } => item !== null
      );
  }, [removedItems, orderItemsMap]);

  // Create a map of removed items by replacementId to get original prices
  const removedItemsMap = useMemo(() => {
    const map = new Map<number, number>(); // replacementId -> originalPrice
    removedItems.forEach((removed) => {
      if (removed.replacementId !== null) {
        // Use original price from removed item info, or get from clothes array
        const cloth = clothes.find((c) => c.id === removed.replacementId);
        const originalPrice =
          parseFloat(
            (removed.originalPrice || cloth?.price || 0)?.toString() ?? "0"
          ) || 0;
        map.set(removed.replacementId, originalPrice);
      }
    });
    return map;
  }, [removedItems, clothes]);

  // Initialize form with default values from location state
  const defaultValues = useMemo<FormValues>(() => {
    if (!fullOrder) {
      return {
        paid: 0,
        visit_datetime: new Date(),
        has_order_discount: false,
        order_discount_type: "none",
        order_discount_value: 0,
        order_notes: "",
        items: [],
        minPaid: 0,
      };
    }

    const deliveryDate = delivery_date ? parseISO(delivery_date) : new Date();
    const visitDate = fullOrder.visit_datetime
      ? parseISO(fullOrder.visit_datetime)
      : new Date();

    // Get minimum paid amount from order
    const minPaid = parseFloat(fullOrder.paid) || 0;

    // Map clothes to form items with minimum prices
    const items = clothes.map((cloth) => {
      // Check if this is an existing item (in order.items)
      const existingItem = Array.from(orderItemsMap.values()).find(
        (item) => item.id === cloth.id || item.code === cloth.code
      );

      // Check if this is a replacement
      const isReplacement = removedItemsMap.has(cloth.id);
      const replacementMinPrice = removedItemsMap.get(cloth.id) || 0;

      // Determine minimum price
      let minPrice = 0;
      if (existingItem) {
        // Existing item - use price from clothes array (which should be original price)
        minPrice = parseFloat(cloth.price?.toString() ?? "0") || 0;
      } else if (isReplacement) {
        // Replacement item - use original price of removed item
        minPrice = parseFloat(replacementMinPrice?.toString() ?? "0") || 0;
      } else {
        // New item - no minimum (or 0)
        minPrice = 0;
      }

      return {
        cloth_id: cloth.id,
        price: parseFloat(cloth.price?.toString() ?? "0") || minPrice, // Use provided price or minimum
        type: "rent" as const,
        days_of_rent: 1,
        occasion_datetime: new Date(),
        delivery_date: deliveryDate,
        has_discount: false,
        discount_type: "none" as const,
        discount_value: 0,
        minPrice,
        notes: "",
      };
    });

    return {
      paid: minPaid, // Start with current paid amount
      visit_datetime: visitDate,
      has_order_discount:
        fullOrder.discount_type !== undefined &&
        fullOrder.discount_type !== "none",
      order_discount_type: fullOrder.discount_type || "none",
      order_discount_value:
        parseFloat(fullOrder.discount_value?.toString() ?? "0") || 0,
      order_notes: fullOrder.order_notes || "",
      items,
      minPaid,
    };
  }, [fullOrder, clothes, delivery_date, orderItemsMap, removedItemsMap]);

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

  const {
    data: clothesUnavailableDaysRanges,
    isPending: isLoadingUnavailableDaysRanges,
  } = useQuery(
    useGetClothesUnavailableDaysRangesbyIdsQueryOptions(
      clothes.map((cloth) => cloth.id)
    )
  );

  const getClothesUnavailableDaysRanges = (cloth_id: number) => {
    return clothesUnavailableDaysRanges?.results
      .find((result) => result.cloth_id === cloth_id)
      ?.unavailable_ranges.map((range) => ({
        from: new Date(range.start),
        to: new Date(range.end),
      }));
  };

  // Additional validation check before rendering
  if (
    !fullOrder ||
    !fullOrder.id ||
    !clothes ||
    !Array.isArray(clothes) ||
    clothes.length === 0 ||
    !delivery_date
  ) {
    return null;
  }

  const onSubmit = async (_values: FormValues) => {
    try {
      // TODO: Create update order API call
      toast.success("سيتم تحديث الطلب");
      const body: TUpdateOrderRequest = {
        client_id: fullOrder.client_id,
        entity_type: fullOrder.entity_type,
        entity_id: fullOrder.entity_id,
        paid: _values.paid,
        visit_datetime: format(
          new Date(_values.visit_datetime),
          "yyyy-MM-dd HH:mm:ss"
        ),
        order_notes: _values.order_notes || "",
        ...(_values.has_order_discount && {
          discount_type: _values.order_discount_type,
          discount_value: _values.order_discount_value,
        }),
        items: _values.items.map((item) => ({
          cloth_id: item.cloth_id,
          price: item.price,
          type: item.type,
          days_of_rent: item.type === "rent" ? item.days_of_rent || 1 : 0,
          occasion_datetime: format(
            new Date(item.occasion_datetime),
            "yyyy-MM-dd HH:mm:ss"
          ),
          delivery_date: format(
            new Date(item.delivery_date),
            "yyyy-MM-dd HH:mm:ss"
          ),
          ...(item.notes ? { notes: item.notes } : {}),
          ...(item.has_discount &&
          item.discount_type &&
          item.discount_type !== "none"
            ? {
                discount_type: item.discount_type,
                discount_value: item.discount_value,
              }
            : {}),
        })),
      };
      updateOrder(
        { id: fullOrder.id, data: body },
        {
          onSuccess: () => {
            toast.success("تم تحديث الطلب بنجاح");
            navigate(`/orders/${fullOrder.id}`);
          },
          onError: (error: any) => {
            toast.error("خطأ في تحديث الطلب", {
              description: error?.message || "حدث خطأ غير متوقع",
            });
          },
        }
      );
    } catch (error: any) {
      toast.error("خطأ في تحديث الطلب", {
        description: error?.message || "حدث خطأ غير متوقع",
      });
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/orders/list"
          className="hover:text-foreground transition-colors"
        >
          قائمة الطلبات
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to="/orders/update-clothes-in-order"
          className="hover:text-foreground transition-colors"
          state={{ order: fullOrder }}
        >
          تحديث المنتج
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">تحديث الطلب</span>
      </div>

      {/* Order Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات الطلب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">رقم الطلب</p>
              <p className="font-medium">#{fullOrder.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">السعر الإجمالي</p>
              <p className="font-medium">{fullOrder.total_price} ج.م</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المدفوع حالياً</p>
              <p className="font-medium">{fullOrder.paid} ج.م</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removed Items Info */}
      {removedItemsDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المنتجات المحذوفة والمستبدلة</CardTitle>
            <CardDescription>
              قائمة المنتجات التي تم حذفها من الطلب واستبدالها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {removedItemsDetails.map((removed) => {
                const replacementCloth = clothes.find(
                  (c) => c.id === removed.replacementId
                );
                return (
                  <div
                    key={removed.originalItemId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          {removed.code} - {removed.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          تم حذفها
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        {replacementCloth ? (
                          <>
                            <p className="text-sm font-medium text-green-600">
                              {replacementCloth.code} - {replacementCloth.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              تم استبدالها
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            لم يتم اختيار بديل
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Level Fields */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
              <CardDescription>أدخل معلومات الطلب الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        المبلغ المدفوع{" "}
                        {(form.watch("minPaid") ?? 0) > 0 && (
                          <span className="text-muted-foreground text-sm">
                            (الحد الأدنى: {form.watch("minPaid") ?? 0} ج.م)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={form.watch("minPaid") || 0}
                          placeholder="0.00"
                          {...field}
                          disabled={true}
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
                  name="visit_datetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ ووقت الزيارة</FormLabel>
                      <FormControl>
                        <SimpleDateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اختر تاريخ ووقت الزيارة"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="has_order_discount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          إضافة خصم على الطلب
                        </FormLabel>
                        <CardDescription>
                          تفعيل الخصم على مستوى الطلب
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectTrigger>
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

              <Separator />

              <FormField
                control={form.control}
                name="order_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات الطلب</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل ملاحظات حول الطلب..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items Forms */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المنتجات المختارة</CardTitle>
                <CardDescription>أدخل تفاصيل كل منتج مختار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => {
                  const cloth = clothes.find((c) => c.id === field.cloth_id);
                  const itemHasDiscount = useWatch({
                    control: form.control,
                    name: `items.${index}.has_discount`,
                  });
                  const itemType = useWatch({
                    control: form.control,
                    name: `items.${index}.type`,
                  });
                  const minPrice = form.watch(`items.${index}.minPrice`) || 0;
                  const isExisting = orderItemsMap.has(field.cloth_id);
                  const isReplacement = removedItemsMap.has(field.cloth_id);

                  return (
                    <Card key={field.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {cloth?.code} - {cloth?.name}
                          {isExisting && (
                            <Badge variant="outline" className="mr-2">
                              موجود
                            </Badge>
                          )}
                          {isReplacement && (
                            <Badge variant="secondary" className="mr-2">
                              مستبدل
                            </Badge>
                          )}
                          {!isExisting && !isReplacement && (
                            <Badge variant="default" className="mr-2">
                              جديد
                            </Badge>
                          )}
                        </CardTitle>
                        {minPrice > 0 && (
                          <CardDescription>
                            الحد الأدنى للسعر: {minPrice} ج.م
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  السعر
                                  {minPrice > 0 && (
                                    <span className="text-muted-foreground text-sm mr-2">
                                      (الحد الأدنى: {minPrice} ج.م)
                                    </span>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min={minPrice}
                                    placeholder="0.00"
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
                                <FormLabel>نوع الطلب</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
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

                        {itemType === "rent" && (
                          <FormField
                            control={form.control}
                            name={`items.${index}.days_of_rent`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عدد أيام الإيجار</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    value={field.value || 1}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.occasion_datetime`}
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
                            name={`items.${index}.delivery_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>تاريخ التسليم</FormLabel>
                                <FormControl>
                                  {isLoadingUnavailableDaysRanges ? (
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <DatePicker
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="اختر تاريخ التسليم"
                                      allowPastDates={false}
                                      disabledRanges={getClothesUnavailableDaysRanges(
                                        cloth?.id ?? 0
                                      )}
                                    />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.has_discount`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    إضافة خصم على هذه القطعة
                                  </FormLabel>
                                  <CardDescription>
                                    تفعيل الخصم على مستوى القطعة
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <SelectTrigger>
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

                        <Separator />

                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ملاحظات</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="أدخل ملاحظات حول هذه القطعة..."
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              إلغاء
            </Button>
            <Button type="submit" isLoading={isUpdatingOrder}>
              تحديث الطلب
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default UpdateOrder;
