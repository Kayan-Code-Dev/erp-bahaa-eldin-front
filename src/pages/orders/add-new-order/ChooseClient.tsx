import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/custom/DatePicker";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { ClientsSelect } from "@/components/custom/ClientsSelect";
import { CitiesSelect } from "@/components/custom/CitiesSelect";
import { PhoneInput } from "@/components/ui/phone-input";
import { TEntity } from "@/lib/types/entity.types";
import {
  TClientResponse,
  TCreateClientRequest,
  CLIENT_SOURCES,
  CLIENT_SOURCE_LABELS,
} from "@/api/v2/clients/clients.types";
import { useGetClientQueryOptions } from "@/api/v2/clients/clients.hooks";
import { formatPhone } from "@/utils/formatPhone";
import { useGetClothesQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCreateOrderMutationOptions } from "@/api/v2/orders/orders.hooks";
import {
  TCreateOrderRequest,
  TCreateOrderWithNewClientRequest,
} from "@/api/v2/orders/orders.types";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Plus,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  X,
  Loader2,
  ShoppingBag,
  Ruler,
  Filter,
  RotateCcw,
  ChevronRight,
  Phone,
  MapPin,
  UserCircle,
  Banknote,
  Tag,
  Percent,
  StickyNote,
} from "lucide-react";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import useDebounce from "@/hooks/useDebounce";
import { EmployeesSelect } from "@/components/custom/EmployeesSelect";
import { TGetEmployeesParams } from "@/api/v2/employees/employees.types";

const newClientFormSchema = z.object({
  name: z.string().min(1, { message: "الاسم مطلوب" }),
  date_of_birth: z.string().optional(),
  national_id: z
    .string()
    .length(14, { message: "الرقم القومي يجب أن يكون 14 رقمًا" })
    .regex(/^\d{14}$/, { message: "الرقم القومي يجب أن يتكون من 14 رقمًا" }),
  source: z.enum(CLIENT_SOURCES),
  address: z.string().min(1, { message: "العنوان مطلوب" }),
  city_id: z.string({ required_error: "المدينة مطلوبة" }),
  notes: z.string().optional(),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  phone2: z.string().optional(),
});

type NewClientFormValues = z.infer<typeof newClientFormSchema>;

const defaultNewClientValues: NewClientFormValues = {
  name: "",
  date_of_birth: "",
  national_id: "",
  source: "other",
  address: "",
  city_id: "",
  notes: "",
  phone: "",
  phone2: "",
};

const ORDER_DRAFT_KEY = "order-choose-client-draft";

function ChooseClient() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state || { client: null };
  const { client: selectedClient } = locationState as { client: TClientResponse | null };

  const [activeTab, setActiveTab] = useState(selectedClient ? "existing" : "new");

  const newClientForm = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientFormSchema),
    defaultValues: defaultNewClientValues,
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(
    selectedClient?.id?.toString() || ""
  );
  const [selectedClientFromList, setSelectedClientFromList] =
    useState<TClientResponse | null>(selectedClient);

  const [entityType, setEntityType] = useState<TEntity | undefined>();
  const [entityId, setEntityId] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(); // Return date
  const [receiveDate, setReceiveDate] = useState<Date | undefined>(); // visit_datetime = Receive date
  const [branchDate, setBranchDate] = useState<Date | undefined>(); // Occasion/wedding date
  const [employeeId, setEmployeeId] = useState<string>(""); // Employee who created the invoice

  const [nameFilter, setNameFilter] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState({
    quantity: "1",
    price: "",
    paid: "",
    date: new Date(),
    weddingDate: undefined as Date | undefined,
    notes: "",
    days_of_rent: "1",
    type: "rent" as "rent" | "buy" | "tailoring",
    discount_type: "none" as "none" | "percentage" | "fixed",
    discount_value: "0",
  });

  const [measurements, setMeasurements] = useState({
    sleeveLength: "",
    forearm: "",
    shoulderWidth: "",
    cuffs: "",
    waist: "",
    chestLength: "",
    totalLength: "",
    hinch: "",
    dressSize: "",
  });

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [orderDiscount, setOrderDiscount] = useState<{
    type: "none" | "percentage" | "fixed";
    value: number;
  }>({ type: "none", value: 0 });

  const debouncedNameFilter = useDebounce({ value: nameFilter, delay: 500 });
  const debouncedCategoryId = useDebounce({ value: categoryId, delay: 300 });
  const debouncedSubcategoryIds = useDebounce({
    value: subcategoryIds,
    delay: 300,
  });
  const debouncedEntityType = useDebounce({ value: entityType, delay: 300 });
  const debouncedEntityId = useDebounce({ value: entityId, delay: 300 });

  const queryParams = useMemo(() => {
    const params: any = {
      page: 1,
      per_page: 10,
      status: "ready_for_rent",
    };
    if (debouncedNameFilter) params.name = debouncedNameFilter;
    if (debouncedCategoryId) params.category_id = Number(debouncedCategoryId);
    if (debouncedSubcategoryIds.length > 0) {
      params.subcat_id = debouncedSubcategoryIds.map(Number);
    }
    if (debouncedEntityType) params.entity_type = debouncedEntityType;
    if (debouncedEntityId) params.entity_id = Number(debouncedEntityId);
    return params;
  }, [
    debouncedNameFilter,
    debouncedCategoryId,
    debouncedSubcategoryIds,
    debouncedEntityType,
    debouncedEntityId,
  ]);

  const { data: clothesData, isPending: isClothesPending, refetch } = useQuery(
    useGetClothesQueryOptions(queryParams)
  );

  const clientIdNum = selectedClientId ? Number(selectedClientId) : 0;
  const { data: clientData } = useQuery({
    ...useGetClientQueryOptions(clientIdNum),
    enabled: clientIdNum > 0,
  });

  const availableClothes = clothesData?.data || [];

  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const totalPaid = selectedProducts.reduce((sum, product) => sum + (product.paid || 0), 0);
  const remainingAmount = totalAmount - totalPaid;

  const createOrderMutation = useMutation(useCreateOrderMutationOptions());
  const { mutate: createOrder, isPending: isCreatingOrder } = createOrderMutation;

  useEffect(() => {
    if (selectedClient) {
      const fullName =
        selectedClient.name?.trim() ||
        [selectedClient.first_name, selectedClient.middle_name, selectedClient.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
      newClientForm.reset({
        ...defaultNewClientValues,
        name: fullName || "",
        phone: selectedClient.phones?.[0]?.phone || "",
        national_id: selectedClient.national_id || "",
      });
      setSelectedClientId(selectedClient.id?.toString() || "");
      setSelectedClientFromList(selectedClient);
      setActiveTab("existing");
    }
  }, [selectedClient, newClientForm]);

  useEffect(() => {
    if (clientData) {
      setSelectedClientFromList(clientData);
    }
  }, [clientData]);

  useEffect(() => {
    if (entityType && entityId && deliveryDate) {
      refetch();
    }
  }, [entityType, entityId, deliveryDate, refetch]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        entityType?: TEntity;
        entityId?: string;
        deliveryDate?: string;
        activeTab?: string;
        selectedClientId?: string;
        newClientFormValues?: NewClientFormValues;
        selectedProducts?: any[];
      };
      if (draft.entityType) setEntityType(draft.entityType);
      if (draft.entityId) setEntityId(draft.entityId);
      if (draft.deliveryDate) setDeliveryDate(new Date(draft.deliveryDate));
      if (draft.activeTab) setActiveTab(draft.activeTab);
      if (draft.selectedClientId) setSelectedClientId(draft.selectedClientId);
      if (draft.newClientFormValues) newClientForm.reset(draft.newClientFormValues);
      if (draft.selectedProducts?.length) {
        const defaultDelivery = draft.deliveryDate ? new Date(draft.deliveryDate) : undefined;
        const restored = draft.selectedProducts.map((p) => ({
          ...p,
          date: p.date ? new Date(p.date) : undefined,
          deliveryDate: p.deliveryDate ? new Date(p.deliveryDate) : defaultDelivery,
          weddingDate: p.weddingDate ? new Date(p.weddingDate) : undefined,
        }));
        setSelectedProducts(restored);
      }
      localStorage.removeItem(ORDER_DRAFT_KEY);
      toast.success("تم استعادة المسودة المحفوظة");
    } catch {
      localStorage.removeItem(ORDER_DRAFT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to restore draft
  }, []);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleClothSelect = (cloth: any) => {
    // If cloth status is not ready for rent, don't allow selection and show rejection reason
    // Disabled code: validation for cloth status before selection
    // if (cloth.status && cloth.status !== "ready_for_rent") {
    //   toast.error("لا يمكن اختيار هذه القطعة", {
    //     description: `حالة القطعة الحالية: ${getStatusLabel(cloth.status)}`,
    //   });
    //   return;
    // }

    setSelectedProduct(cloth);
    setProductDetails({
      ...productDetails,
      price: cloth.price?.toString() || "",
    });
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("يجب اختيار منتج من القائمة");
      return;
    }
    if (!productDetails.price) {
      toast.error("يجب إدخال السعر");
      return;
    }
    const alreadyAdded = selectedProducts.some((p) => p.id === selectedProduct.id);
    if (alreadyAdded) {
      toast.error("هذا المنتج مضاف مسبقاً");
      return;
    }
    const newProduct: any = {
      id: selectedProduct.id,
      cloth_id: selectedProduct.id,
      name: selectedProduct.name,
      code: selectedProduct.code,
      quantity: parseInt(productDetails.quantity),
      price: parseFloat(productDetails.price),
      paid: parseFloat(productDetails.paid) || 0,
      date: productDetails.date,
      deliveryDate: deliveryDate,
      weddingDate: productDetails.weddingDate,
      notes: productDetails.notes,
      status: selectedProduct.status,
      type: productDetails.type,
      days_of_rent:
        productDetails.type === "rent" ? parseInt(productDetails.days_of_rent) : 0,
      discount_type: productDetails.discount_type,
      discount_value: parseFloat(productDetails.discount_value) || 0,
      subtotal: parseFloat(productDetails.price) * parseInt(productDetails.quantity),
    };
    // Attach measurements (if present) to each product, all fields are optional
    const hasMeasurements = Object.values(measurements).some(
      (value) => value != null && String(value).trim() !== ""
    );
    if (hasMeasurements) {
      newProduct.measurements = { ...measurements };
    }
    setSelectedProducts([...selectedProducts, newProduct]);
    setSelectedProduct(null);
    setProductDetails({
      quantity: "1",
      price: "",
      paid: "",
      date: new Date(),
      weddingDate: undefined,
      notes: "",
      days_of_rent: "1",
      type: "rent",
      discount_type: "none",
      discount_value: "0",
    });
    // Reset measurements after adding product to avoid accidentally repeating them with another product
    setMeasurements({
      sleeveLength: "",
      forearm: "",
      shoulderWidth: "",
      cuffs: "",
      waist: "",
      chestLength: "",
      totalLength: "",
      hinch: "",
      dressSize: "",
    });
    toast.success("تم إضافة المنتج إلى الطلب");
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((product) => product.id !== id));
    toast.success("تم إزالة المنتج من الطلب");
  };

  const resetFilters = () => {
    setNameFilter("");
    setCategoryId("");
    setSubcategoryIds([]);
    setEntityType(undefined);
    setEntityId("");
    setDeliveryDate(undefined);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ready_for_rent":
        return "default";
      case "rented":
        return "secondary";
      case "damaged":
      case "burned":
      case "scratched":
        return "destructive";
      case "repairing":
        return "outline";
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

  const firstRentProduct = selectedProducts.find((p) => p.type === "rent");
  const hasRentProduct = !!firstRentProduct;

  // Occasion date at order level
  const orderLevelOccasionDatetime =
    hasRentProduct && branchDate
      ? format(branchDate, "yyyy-MM-dd HH:mm:ss")
      : undefined;

  // Number of rental days at order level
  const orderLevelDaysOfRent = hasRentProduct
    ? firstRentProduct?.days_of_rent
      ? Number(firstRentProduct.days_of_rent)
      : 1
    : undefined;

  const buildOrderItems = () =>
    selectedProducts.map((product) => {
      const hasItemDiscount =
        product.discount_type &&
        product.discount_type !== "none" &&
        (product.discount_value ?? 0) > 0;

      let item: any = {
        cloth_id: product.cloth_id,
        price: product.price,
        quantity: product.quantity ?? 1,
        paid: product.paid ?? 0,
        type: product.type,
        notes: product.notes || undefined,
        ...(hasItemDiscount
          ? {
            discount_type: product.discount_type as "percentage" | "fixed",
            discount_value: Number(product.discount_value),
          }
          : {}),
      };

      // For rental orders, send occasion date and number of days also at item level
      if (product.type === "rent" && orderLevelOccasionDatetime) {
        item = {
          ...item,
          occasion_datetime: orderLevelOccasionDatetime,
          days_of_rent:
            product.days_of_rent != null
              ? Number(product.days_of_rent)
              : orderLevelDaysOfRent ?? 1,
          ...(deliveryDate && {
            delivery_date: format(deliveryDate, "yyyy-MM-dd HH:mm:ss"),
          }),
        };
      }

      if (product.measurements) {
        const m = product.measurements;
        return {
          ...item,
          ...(m.sleeveLength?.trim() && { sleeve_length: m.sleeveLength.trim() }),
          ...(m.forearm?.trim() && { forearm: m.forearm.trim() }),
          ...(m.shoulderWidth?.trim() && { shoulder_width: m.shoulderWidth.trim() }),
          ...(m.cuffs?.trim() && { cuffs: m.cuffs.trim() }),
          ...(m.waist?.trim() && { waist: m.waist.trim() }),
          ...(m.chestLength?.trim() && { chest_length: m.chestLength.trim() }),
          ...(m.totalLength?.trim() && { total_length: m.totalLength.trim() }),
          ...(m.hinch?.trim() && { hinch: m.hinch.trim() }),
          ...(m.dressSize?.trim() && { dress_size: m.dressSize.trim() }),
        };
      }

      return item;
    });

  // Setup employee parameters based on location (branch currently)
  const employeeParams: TGetEmployeesParams = useMemo(() => {
    const base: TGetEmployeesParams = {
      per_page: 20,
      employment_status: "active",
    };
    if (entityType === "branch" && entityId) {
      return {
        ...base,
        branch_id: Number(entityId),
      };
    }
    return base;
  }, [entityType, entityId]);

  const buildOrderPayload = (clientId: number): TCreateOrderRequest => {
    const hasOrderDiscount =
      orderDiscount.type &&
      orderDiscount.type !== "none" &&
      orderDiscount.value > 0;
    return {
      existing_client: true,
      client_id: clientId,
      ...(employeeId && { employee_id: Number(employeeId) }),
      entity_type: entityType!,
      entity_id: Number(entityId),
      delivery_date: deliveryDate ? format(deliveryDate, "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      ...(receiveDate && { visit_datetime: format(receiveDate, "yyyy-MM-dd HH:mm:ss") }),
      ...(orderLevelOccasionDatetime && { occasion_datetime: orderLevelOccasionDatetime }),
      ...(orderLevelDaysOfRent != null && { days_of_rent: orderLevelDaysOfRent }),
      order_notes: selectedProducts.map((p) => p.notes).filter(Boolean).join(" - ") || undefined,
      ...(hasOrderDiscount
        ? {
          discount_type: orderDiscount.type as "percentage" | "fixed",
          discount_value: orderDiscount.value,
        }
        : {}),
      items: buildOrderItems(),
    };
  };

  const buildOrderWithNewClientPayload = (
    values: NewClientFormValues
  ): TCreateOrderWithNewClientRequest => {
    const hasOrderDiscount =
      orderDiscount.type &&
      orderDiscount.type !== "none" &&
      orderDiscount.value > 0;
    const phones: { phone: string; type: string }[] = [
      { phone: values.phone.trim(), type: "mobile" },
    ];
    if (values.phone2?.trim()) phones.push({ phone: values.phone2.trim(), type: "whatsapp" });
    const client: TCreateClientRequest = {
      name: values.name.trim(),
      date_of_birth: values.date_of_birth || undefined,
      national_id: values.national_id || undefined,
      source: values.source,
      address: {
        city_id: Number(values.city_id),
        address: values.address.trim(),
      },
      phones,
    };
    return {
      existing_client: false,
      client,
      ...(employeeId && { employee_id: Number(employeeId) }),
      entity_type: entityType!,
      entity_id: Number(entityId),
      delivery_date: deliveryDate ? format(deliveryDate, "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      ...(receiveDate && { visit_datetime: format(receiveDate, "yyyy-MM-dd HH:mm:ss") }),
      ...(orderLevelOccasionDatetime && { occasion_datetime: orderLevelOccasionDatetime }),
      ...(orderLevelDaysOfRent != null && { days_of_rent: orderLevelDaysOfRent }),
      order_notes: selectedProducts.map((p) => p.notes).filter(Boolean).join(" - ") || undefined,
      ...(hasOrderDiscount
        ? {
          discount_type: orderDiscount.type as "percentage" | "fixed",
          discount_value: orderDiscount.value,
        }
        : {}),
      items: buildOrderItems(),
    };
  };

  const submitOrder = (clientId: number) => {
    createOrder(buildOrderPayload(clientId), {
      onSuccess: () => {
        toast.success("تم إنشاء الطلب بنجاح!");
        navigate("/orders/list");
      },
      onError: (error: any) => {
        toast.error("خطأ في إنشاء الطلب", {
          description: error?.message || "حدث خطأ غير متوقع",
        });
      },
    });
  };

  const handleCreateOrder = async () => {
    if (activeTab === "existing" && !selectedClientId && !selectedClientFromList) {
      toast.error("يجب اختيار عميل");
      return;
    }
    if (!entityType || !entityId) {
      toast.error("يجب اختيار نوع المكان والمكان");
      return;
    }
    if (!employeeId) {
      toast.error("يجب اختيار الموظف الذي أنشأ الفاتورة");
      return;
    }
    if (!receiveDate) {
      toast.error("يجب اختيار تاريخ الاستلام");
      return;
    }
    if (!deliveryDate) {
      toast.error("يجب اختيار تاريخ الاسترجاع");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("يجب إضافة منتجات على الأقل");
      return;
    }
    const hasRent = selectedProducts.some((p) => p.type === "rent");
    if (hasRent && !branchDate) {
      toast.error("تاريخ المناسبة مطلوب للإيجار");
      return;
    }

    if (activeTab === "new") {
      const valid = await newClientForm.trigger();
      if (!valid) {
        toast.error("يرجى إكمال بيانات العميل الجديد بشكل صحيح");
        return;
      }
      handleNewClientSubmitAndCreateOrder(newClientForm.getValues());
      return;
    }

    let clientId: number = 0;
    if (selectedClientFromList?.id) {
      clientId = selectedClientFromList.id;
    } else if (selectedClientId) {
      clientId = parseInt(selectedClientId);
    }
    if (!clientId || clientId <= 0) {
      toast.error("يجب اختيار عميل صالح");
      return;
    }
    submitOrder(clientId);
  };

  const handleSaveDraft = () => {
    const productsForDraft = selectedProducts.map((p) => ({
      ...p,
      date: p.date instanceof Date ? p.date.toISOString() : p.date,
      deliveryDate: p.deliveryDate instanceof Date ? p.deliveryDate.toISOString() : p.deliveryDate,
      weddingDate: p.weddingDate instanceof Date ? p.weddingDate.toISOString() : p.weddingDate,
    }));
    const draft = {
      entityType,
      entityId,
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
      activeTab,
      selectedClientId: selectedClientId || undefined,
      newClientFormValues: activeTab === "new" ? newClientForm.getValues() : undefined,
      selectedProducts: productsForDraft,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
      toast.success("تم حفظ الطلب مؤقتاً");
    } catch {
      toast.error("فشل حفظ المسودة");
    }
  };

  const handleNewClientSubmitAndCreateOrder = (values: NewClientFormValues) => {
    if (!entityType || !entityId) {
      toast.error("يجب اختيار نوع المكان والمكان");
      return;
    }
    const hasRent = selectedProducts.some((p) => p.type === "rent");
    if (hasRent && !branchDate) {
      toast.error("تاريخ المناسبة مطلوب للإيجار");
      return;
    }
    if (!deliveryDate) {
      toast.error("يجب اختيار تاريخ التسليم");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("يجب إضافة منتجات على الأقل");
      return;
    }
    const payload = buildOrderWithNewClientPayload(values);
    createOrder(payload, {
      onSuccess: () => {
        toast.success("تم إنشاء الطلب والعميل بنجاح!");
        navigate("/orders/list");
      },
      onError: (error: any) => {
        toast.error("حدث خطأ أثناء إنشاء الطلب", {
          description: error?.message || "حدث خطأ غير متوقع",
        });
      },
    });
  };

  // Prevent changing location after adding products, but allow selecting other products from the same location
  const handleEntityTypeChangeStandalone = (value: TEntity | undefined) => {
    if (selectedProducts.length > 0) {
      toast.error("لا يمكن تغيير نوع المكان بعد إضافة منتجات للطلب");
      return;
    }
    setEntityType(value);
    setEntityId("");
  };

  const handleEntityIdChangeStandalone = (value: string) => {
    if (selectedProducts.length > 0) {
      toast.error("لا يمكن تغيير المكان بعد إضافة منتجات للطلب");
      return;
    }
    setEntityId(value);
  };

  return (
    <div dir="rtl" className="min-h-screen   ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/orders/list" className="hover:text-foreground transition-colors">
            قائمة الطلبات
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">إنشاء طلب إيجار جديد</span>
        </div>
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900">إنشاء طلب إيجار جديد</h1>
          <p className="text-gray-600 mt-2">
            أدخل بيانات العميل، اختر المنتجات المتاحة، وأدخل تفاصيل الطلب
          </p>
        </div>

        {/* Single comprehensive card for all order creation steps */}
        <Card className="shadow-xl border-gray-200">
          <CardHeader className="border-b bg-white">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
              <div className="p-2 rounded-lg bg-blue-50">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <span>كل خطوات إنشاء طلب الإيجار</span>
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600">
              اختر المكان والتاريخ، حدد أو أنشئ عميل، ثم اختر المنتجات وأدخل التفاصيل والمقاسات من نفس البطاقة.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-8 ">
            <div className="space-y-6 ">
              {/* Left column: Basics + Client data + Order discount + Selected products summary */}
              <div className="space-y-6 ">
                {/* Basics */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-purple-900">الأساسيات</h2>
                      <p className="text-xs text-gray-600 mt-1">
                        اختر نوع المكان، المكان، وتاريخ التسليم قبل اختيار المنتجات
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 w-full">
                    <EntitySelect
                      mode="standalone"
                      entityType={entityType}
                      entityId={entityId}
                      onEntityTypeChange={handleEntityTypeChangeStandalone}
                      onEntityIdChange={handleEntityIdChangeStandalone}
                      entityTypeLabel="نوع المكان"
                      entityIdLabel="المكان"
                      required
                    />
                    {/* Select employee who created the invoice */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        الموظف المسؤول عن الفاتورة
                      </Label>
                      <EmployeesSelect
                        params={employeeParams}
                        value={employeeId}
                        onChange={setEmployeeId}
                        disabled={!entityType || !entityId}
                        placeholder="اختر الموظف..."
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="receive-date" className="text-gray-700 font-medium">
                          تاريخ الاستلام
                        </Label>
                        <DatePicker
                          value={receiveDate}
                          onChange={setReceiveDate}
                          placeholder="اختر تاريخ الاستلام"
                          minDate={new Date()}
                          className="h-12 rounded-lg w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch-date" className="text-gray-700 font-medium">
                          تاريخ الفرح
                        </Label>
                        <DatePicker
                          value={branchDate}
                          onChange={setBranchDate}
                          placeholder="اختر تاريخ الفرح"
                          allowPastDates={true}
                          allowFutureDates={true}
                          className="h-12 rounded-lg w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery-date" className="text-gray-700 font-medium">
                          تاريخ الاسترجاع
                        </Label>
                        <DatePicker
                          value={deliveryDate}
                          onChange={setDeliveryDate}
                          placeholder="اختر تاريخ الاسترجاع"
                          minDate={new Date()}
                          className="h-12 rounded-lg w-full"
                        />
                      </div>
                    </div>
                    {entityType && entityId && deliveryDate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">جاهز لعرض المنتجات المتاحة</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Client data (existing / new) */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-4" dir="rtl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-blue-900">بيانات العميل</h2>
                      <p className="text-xs text-gray-600 mt-1">
                        اختر عميلاً موجوداً أو أضف عميل جديد في نفس المكان
                      </p>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger
                        value="existing"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                      >
                        عميل موجود
                      </TabsTrigger>
                      <TabsTrigger
                        value="new"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                      >
                        عميل جديد
                      </TabsTrigger>
                    </TabsList>

                    {/* Existing client */}
                    <TabsContent value="existing" className="mt-6 space-y-4">
                      {(selectedClientFromList || selectedClient) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex flex-col items-end gap-2 text-right">
                            <p className="font-bold text-green-800">:العميل المختار</p>
                            <p className="font-medium text-gray-900">
                              {(() => {
                                const c = selectedClientFromList ?? selectedClient;
                                return (
                                  c?.name ??
                                  ([c?.first_name, c?.middle_name, c?.last_name]
                                    .filter(Boolean)
                                    .join(" ")
                                    .trim() || "—")
                                );
                              })()}
                            </p>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-gray-600">
                                الرقم القومي:{" "}
                                {selectedClientFromList?.national_id ||
                                  selectedClient?.national_id ||
                                  "-"}
                              </p>
                              <p className="text-sm text-gray-600">
                                الهاتف:{" "}
                                <span dir="ltr">
                                  {formatPhone(
                                    selectedClientFromList?.phones?.[0]?.phone ||
                                      selectedClient?.phones?.[0]?.phone,
                                    "-"
                                  )}
                                </span>
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              مختار
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium text-right block w-full">
                          اختر عميلاً من القائمة
                        </Label>
                        <ClientsSelect
                          value={selectedClientId}
                          onChange={handleClientSelect}
                          disabled={false}
                        />
                      </div>
                    </TabsContent>

                    {/* New client */}
                    <TabsContent value="new" className="mt-6" dir="rtl">
                      <Form {...newClientForm}>
                        <form
                          onSubmit={newClientForm.handleSubmit(handleNewClientSubmitAndCreateOrder)}
                          className="space-y-6 text-right"
                          dir="rtl"
                        >
                          <p className="text-sm text-muted-foreground text-right">
                            أدخل بيانات العميل الجديد وسيتم إنشاء الطلب باسمه بعد الحفظ.
                          </p>

                          {/* Basic information */}
                          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                            <div className="flex items-center gap-2 text-right">
                              <UserCircle className="h-5 w-5 text-primary" />
                              <h3 className="text-sm font-semibold">البيانات الأساسية</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-4">
                                <FormField
                                  control={newClientForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-right">الاسم</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="الاسم الكامل للعميل"
                                          className="h-11 rounded-lg text-right"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={newClientForm.control}
                                  name="national_id"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-right">الرقم القومي</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="14 رقم"
                                          maxLength={14}
                                          className="h-11 rounded-lg font-mono text-right"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="space-y-4">
                                <FormField
                                  control={newClientForm.control}
                                  name="date_of_birth"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-right">
                                        تاريخ الميلاد (اختياري)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          className="h-11 rounded-lg"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={newClientForm.control}
                                  name="source"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-right">المصدر</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-11 rounded-lg">
                                            <SelectValue placeholder="اختر المصدر" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {CLIENT_SOURCES.map((source) => (
                                            <SelectItem key={source} value={source}>
                                              {CLIENT_SOURCE_LABELS[source]}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Phone numbers */}
                          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                            <div className="flex items-center gap-2 text-right">
                              <Phone className="h-5 w-5 text-primary" />
                              <h3 className="text-sm font-semibold">أرقام الهاتف</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={newClientForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem dir="ltr">
                                    <FormLabel className="text-right">
                                      رقم الهاتف (مطلوب)
                                    </FormLabel>
                                    <FormControl>
                                      <PhoneInput
                                        placeholder="أدخل رقم الهاتف"
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isCreatingOrder}
                                        className="h-11 rounded-lg"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={newClientForm.control}
                                name="phone2"
                                render={({ field }) => (
                                  <FormItem dir="ltr">
                                    <FormLabel className="text-right">
                                      رقم الواتس (اختياري)
                                    </FormLabel>
                                    <FormControl>
                                      <PhoneInput
                                        placeholder="أدخل رقم الواتس"
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isCreatingOrder}
                                        className="h-11 rounded-lg"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Address */}
                          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                            <div className="flex items-center gap-2 text-right">
                              <MapPin className="h-5 w-5 text-primary" />
                              <h3 className="text-sm font-semibold">العنوان</h3>
                            </div>
                            <FormField
                              control={newClientForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-right">العنوان</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="الشارع، الحي، رقم المبنى"
                                      className="h-11 rounded-lg"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={newClientForm.control}
                                name="city_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-right">المدينة</FormLabel>
                                    <FormControl>
                                      <CitiesSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isCreatingOrder}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={newClientForm.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-right">
                                      ملاحظات (اختياري)
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="ملاحظات إضافية..."
                                        className="min-h-[44px] rounded-lg resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </section>

                {/* Order-level discount */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-4 ">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Percent className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-amber-900">
                        خصم على الطلب كاملاً (اختياري)
                      </h2>
                      <p className="text-xs text-gray-600 mt-1">
                        يمكنك أيضاً إضافة خصم لكل قطعة من تفاصيل المنتج.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">نوع الخصم</Label>
                      <Select
                        value={orderDiscount.type}
                        onValueChange={(v: "none" | "percentage" | "fixed") =>
                          setOrderDiscount({ ...orderDiscount, type: v })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder="نوع الخصم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">لا يوجد</SelectItem>
                          <SelectItem value="percentage">نسبة مئوية</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {orderDiscount.type !== "none" && (
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">قيمة الخصم</Label>
                        <Input
                          value={orderDiscount.value || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            const numVal = val === "" ? 0 : parseFloat(val) || 0;
                            setOrderDiscount({
                              ...orderDiscount,
                              value: numVal,
                            });
                          }}
                          className="h-11 rounded-lg"
                          placeholder={
                            orderDiscount.type === "percentage" ? "مثال: 10" : "مثال: 50"
                          }
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Selected products summary (at the end) */}
                {selectedProducts.length > 0 && (
                  <section className="rounded-2xl border bg-muted/30 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-green-900">
                          المنتجات المختارة
                        </h2>
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedProducts.length} قطعة مضافة إلى الطلب
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedProducts.map((cloth) => {
                        const measurementLabels: Record<string, string> = {
                          sleeveLength: "طول الكم",
                          forearm: "الزند",
                          shoulderWidth: "عرض الكتف",
                          cuffs: "الإسوار",
                          waist: "الوسط",
                          chestLength: "طول الصدر",
                          totalLength: "الطول الكلي",
                          hinch: "الهش",
                          dressSize: "مقاس الفستان",
                        };
                        const measurementsSummary =
                          cloth.measurements
                            ? Object.entries(cloth.measurements)
                              .filter(([, v]) => v != null && String(v).trim() !== "")
                              .map(([k, v]) => `${measurementLabels[k] ?? k}: ${v}`)
                              .join("، ")
                            : null;
                        return (
                          <div
                            key={cloth.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{cloth.name}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {cloth.code}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${cloth.type === "rent"
                                      ? "bg-blue-50 text-blue-700"
                                      : cloth.type === "tailoring"
                                        ? "bg-purple-50 text-purple-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                  {cloth.type === "rent"
                                    ? "إيجار"
                                    : cloth.type === "tailoring"
                                      ? "تفصيل"
                                      : "شراء"}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700"
                                >
                                  {cloth.quantity} × {cloth.price} ج.م
                                </Badge>
                              </div>
                              {measurementsSummary && (
                                <p
                                  className="text-xs text-muted-foreground mt-2 truncate"
                                  title={measurementsSummary}
                                >
                                  مقاسات هذه القطعة: {measurementsSummary}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              onClick={() => handleRemoveProduct(cloth.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الإجمالي:</span>
                        <span className="font-bold">{totalAmount} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المدفوع:</span>
                        <span className="font-bold text-green-600">{totalPaid} ج.م</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-800 font-bold">المتبقي:</span>
                        <span className="font-bold text-blue-600">{remainingAmount} ج.م</span>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Right column: Product filters + Products table + Item details + Measurements */}
              <div className="space-y-6">
                {/* Product filtering */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Filter className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-amber-900">
                          فلترة المنتجات
                        </h2>
                        <p className="text-xs text-gray-600 mt-1">
                          ابحث عن المنتجات المتاحة حسب الاسم، الفئة والفئات الفرعية
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="ml-2 h-4 w-4" />
                        {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        <RotateCcw className="ml-2 h-4 w-4" />
                        إعادة تعيين
                      </Button>
                    </div>
                  </div>

                  {showFilters && (
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">اسم المنتج</Label>
                          <Input
                            placeholder="ابحث بالاسم..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">الفئة</Label>
                          <CategoriesSelect
                            value={categoryId}
                            onChange={(id) => {
                              setCategoryId(id);
                              setSubcategoryIds([]);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">الفئات الفرعية</Label>
                          <SubcategoriesSelect
                            multiple
                            value={subcategoryIds}
                            onChange={setSubcategoryIds}
                            category_id={categoryId ? Number(categoryId) : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Available products table */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-blue-900">المنتجات المتاحة</h2>
                      <p className="text-xs text-gray-600 mt-1">
                        {entityType && entityId && deliveryDate
                          ? `إجمالي المنتجات المتاحة: ${clothesData?.total || 0}`
                          : "اختر المكان والتاريخ لعرض المنتجات"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    {!entityType || !entityId || !deliveryDate ? (
                      <div className="text-center py-10 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>يرجى اختيار نوع المكان والمكان وتاريخ التسليم أولاً</p>
                      </div>
                    ) : isClothesPending ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-12 bg-gray-200 rounded-lg animate-pulse"
                          ></div>
                        ))}
                      </div>
                    ) : availableClothes.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>لا توجد منتجات متاحة حسب الفلاتر المحددة</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">#</TableHead>
                              <TableHead className="text-center">الكود</TableHead>
                              <TableHead className="text-center">الاسم</TableHead>
                              <TableHead className="text-center">الحالة</TableHead>
                              <TableHead className="text-center">المكان</TableHead>
                              <TableHead className="text-center">السعر</TableHead>
                              <TableHead className="text-center">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableClothes.map((cloth: any) => {
                              const isSelected = selectedProducts.some(
                                (p) => p.id === cloth.id,
                              );
                              return (
                                <TableRow
                                  key={cloth.id}
                                  className={`${isSelected
                                      ? "bg-green-50"
                                      : selectedProduct?.id === cloth.id
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                                >
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
                                  <TableCell className="text-center font-bold text-blue-600">
                                    {cloth.price ? `${cloth.price} ج.م` : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 justify-center">
                                      <Button
                                        variant={isSelected ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => handleClothSelect(cloth)}
                                        disabled={isSelected}
                                      >
                                        {isSelected ? "مضافة" : "اختيار"}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </section>

                {/* Selected product details + Measurements (in one section) */}
                <section className="rounded-2xl border bg-muted/30 p-5 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-foreground">
                        تفاصيل المنتج المختار والمقاسات
                      </h2>
                      {selectedProduct ? (
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedProduct.code} — {selectedProduct.name}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 mt-1">
                          قم باختيار منتج من الجدول لعرض التفاصيل وإدخال المقاسات
                        </p>
                      )}
                    </div>
                  </div>

                  {!selectedProduct ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Ruler className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-base font-medium text-foreground mb-1">
                        قم باختيار المنتج
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        اختر قطعة من جدول المنتجات المتاحة أعلاه، ثم أدخل التفاصيل والمقاسات (اختياري)
                        واضغط إضافة المنتج.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Price, quantity and order type */}
                      <div className="rounded-xl border bg-muted/5 p-4">
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Banknote className="h-4 w-4" />
                          السعر والكمية ونوع الطلب
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="quantity" className="font-medium">
                              الكمية
                            </Label>
                            <Input
                              id="quantity"
                              value={productDetails.quantity}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                setProductDetails({
                                  ...productDetails,
                                  quantity: val || "1",
                                });
                              }}
                              className="h-10 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price" className="font-medium">
                              السعر (ج.م)
                            </Label>
                            <div className="relative">
                              <Input
                                id="price"
                                value={productDetails.price}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  setProductDetails({
                                    ...productDetails,
                                    price: val,
                                  });
                                }}
                                className="h-10 rounded-lg pr-10"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ج.م
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="type"
                              className="flex items-center gap-1.5 font-medium"
                            >
                              <Tag className="h-4 w-4" />
                              نوع الطلب
                            </Label>
                            <Select
                              value={productDetails.type}
                              onValueChange={(value: "rent" | "buy" | "tailoring") =>
                                setProductDetails({ ...productDetails, type: value })
                              }
                            >
                              <SelectTrigger className="h-10 rounded-lg" id="type">
                                <SelectValue placeholder="اختر نوع الطلب" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rent">إيجار</SelectItem>
                                <SelectItem value="buy">شراء</SelectItem>
                                <SelectItem value="tailoring">تفصيل</SelectItem>
                              </SelectContent>
                            </Select>

                          </div>
                          <div className="max-w-xs">
                            <Label htmlFor="paid" className="font-medium">
                              المدفوع (ج.م)
                            </Label>
                            <div className="relative mt-2">
                              <Input
                                id="paid"
                                value={productDetails.paid}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  setProductDetails({
                                    ...productDetails,
                                    paid: val,
                                  });
                                }}
                                className="h-10 rounded-lg pr-10"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Discount */}
                      <div className="rounded-xl border bg-muted/5 p-4">
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Percent className="h-4 w-4" />
                          الخصم
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="discount_type" className="font-medium">
                              نوع الخصم
                            </Label>
                            <Select
                              value={productDetails.discount_type}
                              onValueChange={(value: "none" | "percentage" | "fixed") =>
                                setProductDetails({
                                  ...productDetails,
                                  discount_type: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-10 rounded-lg" id="discount_type">
                                <SelectValue placeholder="اختر نوع الخصم" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">لا يوجد</SelectItem>
                                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {productDetails.discount_type !== "none" && (
                            <div className="space-y-2">
                              <Label htmlFor="discount_value" className="font-medium">
                                قيمة الخصم
                              </Label>
                              <Input
                                id="discount_value"
                                value={productDetails.discount_value}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "");
                                  setProductDetails({
                                    ...productDetails,
                                    discount_value: val,
                                  });
                                }}
                                className="h-10 rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="rounded-xl border bg-muted/5 p-4">
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <StickyNote className="h-4 w-4" />
                          ملاحظات
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="font-medium">
                            ملاحظات حول المنتج
                          </Label>
                          <Input
                            id="notes"
                            placeholder="ملاحظات اختيارية..."
                            value={productDetails.notes}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                notes: e.target.value,
                              })
                            }
                            className="h-10 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Measurements */}
                      <div className="rounded-xl border bg-muted/5 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Ruler className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-purple-900">
                              المقاسات (اختياري)
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              يمكنك إدخال مقاسات هذا المنتج وسيتم إرسالها مع الطلب. جميع الحقول اختيارية.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 pb-2 border-b">
                          تُربط هذه المقاسات بالمنتج عند إضافته للطلب، بغض النظر عن نوع الطلب. جميع
                          الحقول اختيارية.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { key: "sleeveLength", label: "طول الكم", placeholder: "سم" },
                            { key: "forearm", label: "الزند", placeholder: "سم" },
                            { key: "shoulderWidth", label: "عرض الكتف", placeholder: "سم" },
                            { key: "cuffs", label: "الإسوار", placeholder: "سم" },
                            { key: "waist", label: "الوسط", placeholder: "سم" },
                            { key: "chestLength", label: "طول الصدر", placeholder: "سم" },
                            { key: "totalLength", label: "الطول الكلي", placeholder: "سم" },
                            { key: "hinch", label: "الهش", placeholder: "سم" },
                            {
                              key: "dressSize",
                              label: "مقاس الفستان",
                              placeholder: "S, M, L, XL",
                            },
                          ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-2">
                              <Label className="text-gray-700 font-medium">{label}</Label>
                              <Input
                                value={(measurements as any)[key]}
                                onChange={(e) =>
                                  setMeasurements({ ...measurements, [key]: e.target.value })
                                }
                                className="h-11 rounded-lg"
                                placeholder={placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add product button */}
                      <div className="flex justify-center pt-6 mt-2 border-t">
                        <Button
                          onClick={handleAddProduct}
                          className="h-12 px-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                        >
                          <Plus className="ml-2 h-5 w-5" />
                          إضافة المنتج إلى الطلب
                        </Button>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t bg-gray-50 pt-6 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/orders/list")}
              className="h-12 px-6 rounded-lg border-gray-300 hover:border-gray-400"
            >
              <ArrowLeft className="ml-2 h-5 w-5" />
              رجوع للقائمة
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-lg border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={handleSaveDraft}
              >
                حفظ مؤقت
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={selectedProducts.length === 0 || isCreatingOrder}
                className="h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="ml-3 h-5 w-5 animate-spin" />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-3 h-5 w-5" />
                    إنشاء الطلب
                    <ArrowRight className="mr-3 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ChooseClient;
