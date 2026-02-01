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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  useGetClientQueryOptions,
  useCreateClientMutationOptions,
} from "@/api/v2/clients/clients.hooks";
import { useGetClothesQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCreateOrderMutationOptions } from "@/api/v2/orders/orders.hooks";
import { TCreateOrderRequest } from "@/api/v2/orders/orders.types";
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
} from "lucide-react";
import { CategoriesSelect } from "@/components/custom/CategoriesSelect";
import { ClothModelsSelect } from "@/components/custom/ClothModelsSelect";
import { SubcategoriesSelect } from "@/components/custom/SubcategoriesSelect";
import useDebounce from "@/hooks/useDebounce";

const newClientFormSchema = z.object({
  first_name: z.string().min(1, { message: "الاسم الأول مطلوب" }),
  last_name: z.string().min(1, { message: "الاسم الأخير مطلوب" }),
  date_of_birth: z.string().min(1, { message: "تاريخ الميلاد مطلوب" }),
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
  first_name: "",
  last_name: "",
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
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();

  const [nameFilter, setNameFilter] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [clothTypeId, setClothTypeId] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState({
    quantity: "1",
    price: "",
    paid: "",
    date: new Date(),
    weddingDate: undefined as Date | undefined,
    notes: "",
    days_of_rent: "1",
    type: "rent" as "rent" | "buy",
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

  const debouncedNameFilter = useDebounce({ value: nameFilter, delay: 500 });
  const debouncedCategoryId = useDebounce({ value: categoryId, delay: 300 });
  const debouncedSubcategoryIds = useDebounce({
    value: subcategoryIds,
    delay: 300,
  });
  const debouncedClothTypeId = useDebounce({ value: clothTypeId, delay: 300 });
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
    if (debouncedClothTypeId) params.cloth_type_id = Number(debouncedClothTypeId);
    if (debouncedEntityType) params.entity_type = debouncedEntityType;
    if (debouncedEntityId) params.entity_id = Number(debouncedEntityId);
    return params;
  }, [
    debouncedNameFilter,
    debouncedCategoryId,
    debouncedSubcategoryIds,
    debouncedClothTypeId,
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

  const createClientMutation = useMutation(useCreateClientMutationOptions());
  const { mutate: createClient, isPending: isCreatingClient } = createClientMutation;

  useEffect(() => {
    if (selectedClient) {
      newClientForm.reset({
        ...defaultNewClientValues,
        first_name: selectedClient.first_name || "",
        last_name: selectedClient.last_name || "",
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
    const newProduct = {
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
      cloth_type: selectedProduct.cloth_type,
      subtotal: parseFloat(productDetails.price) * parseInt(productDetails.quantity),
    };
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
    setClothTypeId("");
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

  const buildOrderPayload = (clientId: number): TCreateOrderRequest => ({
    client_id: clientId,
    entity_type: entityType!,
    entity_id: Number(entityId),
    paid: totalPaid,
    visit_datetime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    order_notes: selectedProducts.map((p) => p.notes).filter(Boolean).join(" - "),
    items: selectedProducts.map((product) => ({
      cloth_id: product.cloth_id,
      price: product.price,
      type: product.type,
      days_of_rent: product.days_of_rent,
      occasion_datetime: product.weddingDate
        ? format(product.weddingDate, "yyyy-MM-dd HH:mm:ss")
        : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      delivery_date: format(deliveryDate!, "yyyy-MM-dd"),
      discount_type: product.discount_type !== "none" ? product.discount_type : undefined,
      discount_value: product.discount_value > 0 ? product.discount_value : undefined,
      notes: product.notes || "",
    })),
  });

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
    if (!deliveryDate) {
      toast.error("يجب اختيار تاريخ التسليم");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("يجب إضافة منتجات على الأقل");
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
    if (!deliveryDate) {
      toast.error("يجب اختيار تاريخ التسليم");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("يجب إضافة منتجات على الأقل");
      return;
    }
    const phones = [{ phone: values.phone }];
    if (values.phone2) phones.push({ phone: values.phone2 });
    const requestData: TCreateClientRequest = {
      first_name: values.first_name,
      middle_name: "",
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      national_id: values.national_id,
      source: values.source,
      address: {
        street: values.address,
        building: "",
        city_id: Number(values.city_id),
        notes: values.notes || "",
      },
      phones,
    };
    createClient(requestData, {
      onSuccess: (data) => {
        if (!data) return;
        toast.success("تم إنشاء العميل بنجاح");
        submitOrder(data.id);
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء إنشاء العميل", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 lg:p-6">
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
            أدخل بيانات العميل، اختر الملابس المتاحة، وأدخل تفاصيل الطلب
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* القائمة اليسارية */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-white border-b">
                <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    الأساسيات
                    <CardDescription className="text-gray-600 mt-1">
                      اختر المكان والتاريخ الأساسي
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 w-full">
                <EntitySelect
                  mode="standalone"
                  entityType={entityType}
                  entityId={entityId}
                  onEntityTypeChange={setEntityType}
                  onEntityIdChange={setEntityId}
                  entityTypeLabel="نوع المكان"
                  entityIdLabel="المكان"
                  required
                />
                <div className="space-y-2">
                  <Label htmlFor="delivery-date" className="text-gray-700 font-medium">
                    تاريخ التسليم
                  </Label>
                  <DatePicker
                    value={deliveryDate}
                    onChange={setDeliveryDate}
                    placeholder="اختر تاريخ التسليم"
                    minDate={new Date()}
                    className="h-12 rounded-lg w-full"
                  />
                </div>
                {entityType && entityId && deliveryDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">جاهز لعرض الملابس المتاحة</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-white border-b">
                <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    بيانات العميل
                    <CardDescription className="text-gray-600 mt-1">
                      اختر عميلاً أو أضف عميلاً جديداً
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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

                  <TabsContent value="existing" className="mt-6 space-y-4">
                    {(selectedClientFromList || selectedClient) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-green-800">العميل المختار:</p>
                            <p className="font-medium text-gray-900">
                              {selectedClientFromList?.first_name || selectedClient?.first_name}{" "}
                              {selectedClientFromList?.middle_name || selectedClient?.middle_name}{" "}
                              {selectedClientFromList?.last_name || selectedClient?.last_name}
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                الرقم القومي:{" "}
                                {selectedClientFromList?.national_id ||
                                  selectedClient?.national_id ||
                                  "-"}
                              </p>
                              <p className="text-sm text-gray-600">
                                الهاتف:{" "}
                                {selectedClientFromList?.phones?.[0]?.phone ||
                                  selectedClient?.phones?.[0]?.phone ||
                                  "-"}
                              </p>
                            </div>
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

                  <TabsContent value="new" className="mt-6">
                    <Form {...newClientForm}>
                      <form
                        onSubmit={newClientForm.handleSubmit(handleNewClientSubmitAndCreateOrder)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={newClientForm.control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right block w-full">الاسم الأول</FormLabel>
                                <FormControl>
                                  <Input placeholder="محمد" className="h-12 rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={newClientForm.control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right block w-full">اسم العائلة</FormLabel>
                                <FormControl>
                                  <Input placeholder="علي" className="h-12 rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={newClientForm.control}
                            name="date_of_birth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right block w-full">تاريخ الميلاد</FormLabel>
                                <FormControl>
                                  <Input type="date" className="h-12 rounded-lg" {...field} />
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
                                <FormLabel className="text-right block w-full">الرقم القومي</FormLabel>
                                <FormControl>
                                  <Input placeholder="14 رقم" maxLength={14} className="h-12 rounded-lg" {...field} />
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
                                <FormLabel className="text-right block w-full">المصدر</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-lg">
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
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="text-sm font-medium text-right">أرقام الهاتف</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={newClientForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem dir="ltr">
                                  <FormLabel className="text-right block w-full">رقم الهاتف (مطلوب)</FormLabel>
                                  <FormControl>
                                    <PhoneInput
                                      placeholder="أدخل رقم الهاتف"
                                      value={field.value}
                                      onChange={field.onChange}
                                      disabled={isCreatingClient}
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
                                  <FormLabel className="text-right block w-full">رقم الهاتف الثاني (اختياري)</FormLabel>
                                  <FormControl>
                                    <PhoneInput
                                      placeholder="أدخل رقم الهاتف الثاني"
                                      value={field.value}
                                      onChange={field.onChange}
                                      disabled={isCreatingClient}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="text-sm font-medium text-right">العنوان</h3>
                          <FormField
                            control={newClientForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right block w-full">العنوان</FormLabel>
                                <FormControl>
                                  <Input placeholder="أدخل العنوان الكامل" className="h-12 rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={newClientForm.control}
                            name="city_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right block w-full">المدينة</FormLabel>
                                <FormControl>
                                  <CitiesSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isCreatingClient}
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
                                <FormLabel className="text-right block w-full">ملاحظات (اختياري)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="ملاحظات إضافية..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {selectedProducts.length > 0 && (
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gradient-to-l from-green-50 to-white border-b">
                  <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      الملابس المختارة
                      <CardDescription className="text-gray-600 mt-1">
                        {selectedProducts.length} قطعة
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedProducts.map((cloth) => (
                      <div
                        key={cloth.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{cloth.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cloth.code}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                cloth.type === "rent"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {cloth.type === "rent" ? "إيجار" : "شراء"}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              {cloth.quantity} × {cloth.price} ج.م
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveProduct(cloth.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* القائمة اليمينية */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-l from-amber-50 to-white border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl text-amber-800">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Filter className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      فلترة الملابس
                      <CardDescription className="text-gray-600 mt-1">
                        ابحث عن الملابس المتاحة
                      </CardDescription>
                    </div>
                  </CardTitle>
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
              </CardHeader>
              {showFilters && (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">اسم الملابس</Label>
                        <Input
                          placeholder="ابحث بالاسم..."
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">الموديل</Label>
                        <ClothModelsSelect value={clothTypeId} onChange={setClothTypeId} />
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
                </CardContent>
              )}
            </Card>

            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-white border-b">
                <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-800" />
                  </div>
                  <div>
                    الملابس المتاحة
                    <CardDescription className="text-gray-600 mt-1">
                      {entityType && entityId && deliveryDate
                        ? `إجمالي الملابس المتاحة: ${clothesData?.total || 0}`
                        : "اختر المكان والتاريخ لعرض الملابس"}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                    <p>لا توجد ملابس متاحة حسب الفلاتر المحددة</p>
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
                          <TableHead className="text-center">الموديل</TableHead>
                          <TableHead className="text-center">السعر</TableHead>
                          <TableHead className="text-center">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableClothes.map((cloth: any) => {
                          const isSelected = selectedProducts.some((p) => p.id === cloth.id);
                          return (
                            <TableRow
                              key={cloth.id}
                              className={`${
                                isSelected ? "bg-green-50" : selectedProduct?.id === cloth.id ? "bg-blue-50" : ""
                              }`}
                            >
                              <TableCell className="text-center">{cloth.id}</TableCell>
                              <TableCell className="text-center font-medium">
                                {cloth.code}
                              </TableCell>
                              <TableCell className="text-center">{cloth.name}</TableCell>
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
              </CardContent>
            </Card>

            {selectedProduct && (
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gradient-to-l from-green-50 to-white border-b">
                  <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                    <div>
                      تفاصيل المنتج المختار
                      <CardDescription className="text-gray-600 mt-1">
                        {selectedProduct.code} - {selectedProduct.name}
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity" className="text-gray-700 font-medium">
                          الكمية
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={productDetails.quantity}
                          onChange={(e) =>
                            setProductDetails({ ...productDetails, quantity: e.target.value })
                          }
                          className="h-12 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-gray-700 font-medium">
                          السعر (ج.م)
                        </Label>
                        <div className="relative">
                          <Input
                            id="price"
                            type="number"
                            value={productDetails.price}
                            onChange={(e) =>
                              setProductDetails({ ...productDetails, price: e.target.value })
                            }
                            className="h-12 rounded-lg pr-12"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            ج.م
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="type" className="text-gray-700 font-medium">
                          نوع الطلب
                        </Label>
                        <Select
                          value={productDetails.type}
                          onValueChange={(value: "rent" | "buy") =>
                            setProductDetails({ ...productDetails, type: value })
                          }
                        >
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="اختر نوع الطلب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">إيجار</SelectItem>
                            <SelectItem value="buy">شراء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {productDetails.type === "rent" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="days_of_rent" className="text-gray-700 font-medium">
                            أيام الإيجار
                          </Label>
                          <Input
                            id="days_of_rent"
                            type="number"
                            min="1"
                            value={productDetails.days_of_rent}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                days_of_rent: e.target.value,
                              })
                            }
                            className="h-12 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paid" className="text-gray-700 font-medium">
                            المدفوع (ج.م)
                          </Label>
                          <div className="relative">
                            <Input
                              id="paid"
                              type="number"
                              value={productDetails.paid}
                              onChange={(e) =>
                                setProductDetails({ ...productDetails, paid: e.target.value })
                              }
                              className="h-12 rounded-lg pr-12"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              ج.م
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="wedding-date" className="text-gray-700 font-medium">
                            ميعاد الفرح
                          </Label>
                          <DatePicker
                            value={productDetails.weddingDate}
                            onChange={(date) =>
                              setProductDetails({
                                ...productDetails,
                                weddingDate: date,
                              })
                            }
                            minDate={new Date()}
                            className="h-12 rounded-lg w-full"
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="discount_type" className="text-gray-700 font-medium">
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
                          <SelectTrigger className="h-12 rounded-lg">
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
                        <div>
                          <Label htmlFor="discount_value" className="text-gray-700 font-medium">
                            قيمة الخصم
                          </Label>
                          <Input
                            id="discount_value"
                            type="number"
                            min="0"
                            value={productDetails.discount_value}
                            onChange={(e) =>
                              setProductDetails({
                                ...productDetails,
                                discount_value: e.target.value,
                              })
                            }
                            className="h-12 rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="notes" className="text-gray-700 font-medium">
                          ملاحظات
                        </Label>
                        <Input
                          id="notes"
                          placeholder="ملاحظات حول المنتج..."
                          value={productDetails.notes}
                          onChange={(e) =>
                            setProductDetails({
                              ...productDetails,
                              notes: e.target.value,
                            })
                          }
                          className="h-12 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={handleAddProduct}
                        className="h-12 px-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                      >
                        <Plus className="ml-2 h-5 w-5" />
                        إضافة المنتج إلى الطلب
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-white border-b">
                <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Ruler className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    المقاسات (اختياري)
                    <CardDescription className="text-gray-600 mt-1">
                      أدخل مقاسات العميل
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 mt-8 border-t">
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
              disabled={
                selectedProducts.length === 0 ||
                isCreatingOrder ||
                (activeTab === "new" && isCreatingClient)
              }
              className="h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingOrder || (activeTab === "new" && isCreatingClient) ? (
                <>
                  <Loader2 className="ml-3 h-5 w-5 animate-spin" />
                  {isCreatingClient ? "جاري إنشاء العميل..." : "جاري إنشاء الطلب..."}
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
        </div>
      </div>
    </div>
  );
}

export default ChooseClient;
