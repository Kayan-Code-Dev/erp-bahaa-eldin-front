import { TClientResponse } from "@/api/v2/clients/clients.types";
import { formatPhone } from "@/utils/formatPhone";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useGetClothesAvialbelByDateQueryOptions } from "@/api/v2/clothes/clothes.hooks";
import { EntitySelect } from "@/components/custom/EntitySelect";
import { DatePicker } from "@/components/custom/DatePicker";
import { TEntity } from "@/lib/types/entity.types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, X, ArrowRight } from "lucide-react";

type SelectedCloth = {
  id: number;
  code: string;
  name: string;
};

function ChooseClothes() {
  const locationState =
    useLocation().state ||
    ({ client: null } as { client: TClientResponse | null });
  const { client } = locationState as { client: TClientResponse | null };
  const navigate = useNavigate();

  const [entityType, setEntityType] = useState<TEntity | undefined>();
  const [entityId, setEntityId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedClothes, setSelectedClothes] = useState<SelectedCloth[]>([]);

  // Format date as YYYY-MM-DD for API
  const formattedDate = useMemo(() => {
    if (!selectedDate) return "";
    return selectedDate.toISOString().split("T")[0];
  }, [selectedDate]);

  // Check if we can fetch clothes
  const canFetchClothes = Boolean(
    formattedDate && entityType && entityId && !isNaN(Number(entityId))
  );

  const queryOptions = useGetClothesAvialbelByDateQueryOptions(
    formattedDate || "",
    (entityType || "branch") as TEntity,
    Number(entityId) || 0
  );

  const { data, isPending } = useQuery({
    ...queryOptions,
    enabled: canFetchClothes,
  });

  useEffect(() => {
    if (!client) {
      setTimeout(() => {
        navigate("/orders/choose-client");
        toast.error("يجب عليك اختيار عميل");
      }, 0);
    }
  }, [client, navigate]);

  useEffect(() => {
    setSelectedClothes([]);
  }, [entityId, entityType]);

  const handleClothToggle = (cloth: SelectedCloth) => {
    setSelectedClothes((prev) => {
      const isSelected = prev.some((c) => c.id === cloth.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== cloth.id);
      } else {
        return [...prev, cloth];
      }
    });
  };

  const handleRemoveCloth = (clothId: number) => {
    setSelectedClothes((prev) => prev.filter((c) => c.id !== clothId));
  };

  const handleContinue = () => {
    if (!client) {
      toast.error("يجب عليك اختيار عميل");
      return;
    }
    if (!entityType || !entityId) {
      toast.error("يجب عليك اختيار نوع المكان والمكان");
      return;
    }
    if (!selectedDate) {
      toast.error("يجب عليك اختيار تاريخ التسليم");
      return;
    }
    if (selectedClothes.length === 0) {
      toast.error("يجب عليك اختيار منتج واحد على الأقل");
      return;
    }

    navigate("/orders/create-order", {
      state: {
        client_id: client.id,
        entity_type: entityType,
        entity_id: Number(entityId),
        delivery_date: formattedDate,
        selected_clothes: selectedClothes,
        client: client, // For backward compatibility
      },
    });
  };

  const availableClothes = data?.available_clothes || [];

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
        <span className="text-foreground font-medium">اختيار المنتج</span>
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
                <p className="font-medium" dir="ltr">
                  {client.phones?.map((p) => formatPhone(p.phone, "")).filter(Boolean).join(", ") || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>اختر المكان والتاريخ</CardTitle>
          <CardDescription>
            اختر نوع المكان والمكان وتاريخ التسليم لعرض المنتجات المتاحة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <DatePicker
              label="تاريخ التسليم"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="اختر تاريخ التسليم"
              allowPastDates={false}
              minDate={new Date()}
              fromYear={new Date().getFullYear()}
              toYear={2050}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Clothes */}
      {selectedClothes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المنتجات المختارة ({selectedClothes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedClothes.map((cloth) => (
                <Badge
                  key={cloth.id}
                  variant="secondary"
                  className="text-sm px-3 py-1.5 flex items-center gap-2"
                >
                  <span>
                    {cloth.code} - {cloth.name}
                  </span>
                  <button
                    onClick={() => handleRemoveCloth(cloth.id)}
                    className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clothes Table */}
      <Card>
        <CardHeader>
          <CardTitle>المنتجات المتاحة</CardTitle>
          <CardDescription>
            {canFetchClothes
              ? `إجمالي المنتجات المتاحة: ${data?.total_available || 0}`
              : "اختر المكان والتاريخ لعرض المنتجات المتاحة"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canFetchClothes ? (
            <div className="text-center py-10 text-muted-foreground">
              يرجى اختيار نوع المكان والمكان وتاريخ التسليم لعرض المنتجات
            </div>
          ) : isPending ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : availableClothes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد منتجات متاحة للتاريخ المحدد
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-center">الكود</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableClothes.map((cloth) => {
                    const isSelected = selectedClothes.some(
                      (c) => c.id === cloth.id
                    );
                    const clothData = {
                      id: cloth.id,
                      code: cloth.code,
                      name: cloth.name,
                    };
                    return (
                      <TableRow
                        key={cloth.id}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          isSelected ? "bg-muted/50" : ""
                        }`}
                        onClick={() => handleClothToggle(clothData)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleClothToggle(clothData)}
                          />
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {cloth.code}
                        </TableCell>
                        <TableCell className="text-center">
                          {cloth.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {cloth.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {cloth.status === "ready_for_rent"
                              ? "جاهز للإيجار"
                              : cloth.status === "rented"
                              ? "مؤجر"
                              : cloth.status === "repairing"
                              ? "قيد الإصلاح"
                              : cloth.status === "damaged"
                              ? "تالف"
                              : cloth.status === "burned"
                              ? "محروق"
                              : cloth.status === "scratched"
                              ? "مخدوش"
                              : "ميت"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {canFetchClothes && !isPending && availableClothes.length > 0 && (
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={selectedClothes.length === 0}
              size="lg"
            >
              المتابعة إلى إنشاء الطلب
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default ChooseClothes;
