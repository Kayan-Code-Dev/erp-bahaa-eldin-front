import { TPaginationResponse } from "@/api/api-common.types";

// —— إنشاء مورد (اسم وكود فقط) ——
export type TCreateSupplierMinimalRequest = {
  name: string;
  code: string;
};

// —— إنشاء مورد (مع الطلبية الأولى) ——
export type TCreateSupplierClothItem = {
  code: string;
  name: string;
  cloth_type_id: number;
  entity_type: "branch" | "factory" | "workshop";
  entity_id: number;
  price: number;
};

export type TCreateSupplierRequest = {
  name: string;
  code: string;
  category_id: number;
  subcategory_id: number;
  branch_id: number;
  order_date: string;
  total_amount: number;
  payment_amount: number;
  remaining_payment: number;
  notes?: string;
  clothes: TCreateSupplierClothItem[];
};

// —— عرض الموردين (قائمة بسيطة) ——
export type TSupplierResponse = {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type TSuppliersListResponse = TPaginationResponse<TSupplierResponse>;

// —— عرض طلبيات الموردين ——
export type TSupplierOrderResponse = {
  id: number;
  supplier_id: number;
  supplier: { id: number; name: string; code: string };
  category_id: number | null;
  category: { id: number; name: string } | null;
  subcategory_id: number | null;
  subcategory: { id: number; name: string } | null;
  branch_id: number | null;
  branch: { id: number; name: string } | null;
  order_number: string;
  order_date: string;
  status: string;
  total_amount: string;
  payment_amount: string;
  remaining_payment: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TSupplierOrdersListResponse = TPaginationResponse<TSupplierOrderResponse>;

// —— إنشاء طلبية مورد ——
export type TCreateSupplierOrderClothItem = {
  code: string;
  name: string;
  description?: string;
  cloth_type_id: number;
  breast_size: string;
  waist_size: string;
  sleeve_size: string;
  notes?: string | null;
  status: string;
  entity_type: "branch" | "factory" | "workshop";
  entity_id: number;
  price: number;
};

export type TCreateSupplierOrderRequest = {
  supplier_id: number;
  category_id: number;
  subcategory_id: number;
  branch_id: number;
  order_date: string;
  payment_amount: number;
  total_amount: number;
  remaining_payment: number;
  notes?: string | null;
  clothes: TCreateSupplierOrderClothItem[];
};

// —— تحديث مورد (إن وُجد endpoint) ——
export type TUpdateSupplierRequest = Partial<Pick<TCreateSupplierRequest, "name" | "code">>;

// —— تحديث طلبية مورد ——
export type TUpdateSupplierOrderRequest = {
  supplier_id: number;
  category_id: number;
  subcategory_id: number;
  branch_id: number;
  order_number: string;
  order_date: string;
  payment_amount: number;
  notes?: string | null;
};
