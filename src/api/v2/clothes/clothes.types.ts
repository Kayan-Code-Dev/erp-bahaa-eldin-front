import { TEntity } from "@/lib/types/entity.types";

export type TCreateClothesRequest = {
  code: string;
  measurements?: string;
  status: TClothesStatus;
  entity_type: TEntity;
  entity_id: number;
  notes?: string;
  description?: string;
  breast_size?: string;
  waist_size?: string;
  sleeve_size?: string;
  cloth_type_id?: number;
  category_id?: number | null;
  subcategory_ids?: number[] | null;
};

export type TClothResponse = {
  code: string;
  measurements?: string;
  status: TClothesStatus;
  notes?: string;
  entity_type: TEntity;
  entity_id: number;
  entity_name?: string;
  updated_at: string;
  created_at: string;
  id: number;
  cloth_type_id?: number;
  cloth_type_name?: string;
  description?: string;
  breast_size?: string;
  waist_size?: string;
  sleeve_size?: string;
  category_id?: number | null;
  category_name?: string | null;
  subcategory_ids?: number[] | null;
  subcategory_names?: string[] | null;
};

export type TUpdateClothesRequest = {
  code: string;
  status: TClothesStatus;
  entity_type: TEntity;
  entity_id: number;
  notes?: string;
  breast_size?: string;
  waist_size?: string;
  sleeve_size?: string;
  measurements?: string;
  cloth_type_id?: number;
  category_id?: number | null;
  subcategory_ids?: number[] | null;
};

export type TClothesStatus =
  | "damaged"
  | "burned"
  | "scratched"
  | "ready_for_rent"
  | "rented"
  | "die"
  | "repairing";

export type TGetClothesRequestParams = {
  page?: number;
  per_page?: number;
  /** فلترة حسب ID واحد أو عدة IDs مفصولة بفاصلة (مثال: "1" أو "1,2,3") */
  id?: string;
  /** فلترة حسب الفرع (اختصار لـ entity_type=branch) */
  branch_id?: number;
  /** فلترة حسب المخزن */
  inventory_id?: number;
  /** فلترة حسب مقاس الصدر (بحث جزئي) */
  breast_size?: string;
  /** فلترة حسب مقاس الخصر */
  waist_size?: string;
  /** فلترة حسب مقاس الكم */
  sleeve_size?: string;
  /** تاريخ إنشاء من (YYYY-MM-DD) */
  created_from?: string;
  /** تاريخ إنشاء إلى (YYYY-MM-DD) */
  created_to?: string;
  /** بحث عام في: code, notes, breast_size, waist_size, sleeve_size */
  search?: string;
  entity_type?: TEntity;
  entity_id?: number;
  name?: string;
  code?: string;
  category_id?: number;
  subcat_id?: number[];
  status?: TClothesStatus;
  /** فلترة حسب المقاس (نص حر أو جزء من measurements) */
  measurements?: string;
  /** تاريخ توصيل القطعة (استلام) - للفلترة حسب إنشاء الطلب */
  delivery_date?: string;
  /** عدد أيام الإيجار - للفلترة حسب إنشاء الطلب */
  days_of_rent?: number;
  /** تاريخ الفرح - للفلترة حسب إنشاء الطلب */
  occasion_datetime?: string;
  /** موعد إرجاع الزبون للقطعة (استرجاع) - للفلترة حسب إنشاء الطلب */
  visit_datetime?: string;
};

export type TClothesAvailableForDateResponse = {
  delivery_date: string;
  days_of_rent: number;
  entity_type: TEntity;
  entity_id: number;
  available_clothes: {
    id: number;
    code: string;
    name?: string;
    description: string;
    status: TClothesStatus;
    cloth_type?: {
      id: number;
      name: string;
    };
  }[];
  total_available: number;
};

export type TClothesUnavailableDaysRangesResponse = {
  results: {
    cloth_id: number;
    unavailable_ranges: {
      start: string;
      end: string;
    }[];
  }[];
};
