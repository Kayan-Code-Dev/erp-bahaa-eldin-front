import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { TClientResponse } from "@/api/v2/clients/clients.types";
import { TEntity } from "@/lib/types/entity.types";
import { ChevronRight, Loader2, Loader2Icon } from "lucide-react";
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
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/custom/DatePicker";
import { SimpleDateTimePicker } from "@/components/custom/SimpleDateTimePicker";
import { useCreateOrderMutationOptions } from "@/api/v2/orders/orders.hooks";
import { TCreateOrderRequest } from "@/api/v2/orders/orders.types";
import { useGetClothesUnavailableDaysRangesbyIdsQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { useMutation, useQuery } from "@tanstack/react-query";

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

// Zod schema for order form
const orderItemSchema = z
  .object({
    cloth_id: z.number(),
    price: z.number().min(1, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
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
  );


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
    items: z.array(orderItemSchema).min(1, "يجب اختيار ملابس على الأقل"),
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
        visit_datetime: new Date(),
        has_order_discount: false,
        order_discount_type: "none",
        order_discount_value: 0,
        order_notes: "",
        items: [],
      };
    }

    const deliveryDate = new Date(locationState.delivery_date);

    return {
      paid: 0,
      visit_datetime: new Date(),
      has_order_discount: false,
      order_discount_type: "none",
      order_discount_value: 0,
      order_notes: "",
      items: locationState.selected_clothes.map((cloth) => ({
        cloth_id: cloth.id,
        price: cloth.price,
        type: "rent" as const,
        days_of_rent: 1,
        occasion_datetime: new Date(),
        delivery_date: deliveryDate,
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

  const createOrderMutation = useMutation(useCreateOrderMutationOptions());
  const { mutate: createOrder, isPending: isCreatingOrder } =
    createOrderMutation;

  useEffect(() => {
    // Validate required state
    if (!locationState) {
      toast.error("يجب عليك اختيار العميل والملابس أولاً");
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
      toast.error("يجب عليك اختيار ملابس على الأقل");
      navigate("/orders/choose-clothes", {
        state: locationState.client ? { client: locationState.client } : null,
      });
      return;
    }
  }, [locationState, navigate]);

  const {
    data: clothesUnavailableDaysRanges,
    isPending: isLoadingUnavailableDaysRanges,
  } = useQuery(
    useGetClothesUnavailableDaysRangesbyIdsQueryOptions(
      (locationState?.selected_clothes ?? []).map((cloth) => cloth.id)
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
      const requestData: TCreateOrderRequest = {
        client_id,
        entity_type,
        entity_id,
        visit_datetime: format(values.visit_datetime, "yyyy-MM-dd HH:mm:ss"),
        ...(values.has_order_discount &&
          values.order_discount_type &&
          values.order_discount_type !== "none"
          ? {
              discount_type: values.order_discount_type,
              discount_value: values.order_discount_value ?? 0,
            }
          : { discount_type: "none" as const, discount_value: 0 }),
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
          if (item.type === "rent") {
            return {
              ...base,
              days_of_rent: item.days_of_rent ?? 1,
              occasion_datetime: format(
                item.occasion_datetime,
                "yyyy-MM-dd HH:mm:ss"
              ),
              delivery_date: format(item.delivery_date, "yyyy-MM-dd"),
            };
          }
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
    <div dir="rtl" className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/orders/choose-client"
          className="hover:text-foreground transition-colors"
        >
          اختيار العميل
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to="/orders/choose-clothes"
          className="hover:text-foreground transition-colors"
          state={client ? { client } : null}
        >
          اختيار الملابس
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">إنشاء الطلب</span>
      </div>

      {/* Client Info */}
      {client && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الاسم الكامل</p>
                <p className="font-medium">
                  {client.first_name} {client.middle_name} {client.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرقم القومي</p>
                <p className="font-medium">{client.national_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">أرقام الهاتف</p>
                <p className="font-medium">
                  {client.phones?.map((p) => p.phone).join(", ") || "-"}
                </p>
              </div>
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
                      <FormLabel>المبلغ المدفوع</FormLabel>
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
                <CardTitle>الملابس المختارة</CardTitle>
                <CardDescription>أدخل تفاصيل كل قطعة ملابس</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => {
                  const cloth = selected_clothes.find(
                    (c) => c.id === field.cloth_id
                  );
                  const itemHasDiscount = useWatch({
                    control: form.control,
                    name: `items.${index}.has_discount`,
                  });
                  const itemType = useWatch({
                    control: form.control,
                    name: `items.${index}.type`,
                  });

                  return (
                    <Card key={field.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {cloth?.code} - {cloth?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>السعر</FormLabel>
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
                                    <SelectItem value="buy">
                                      شراء
                                    </SelectItem>
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
            <Button type="submit" disabled={isCreatingOrder}>
              {isCreatingOrder && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              إنشاء الطلب
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateOrderForm;
