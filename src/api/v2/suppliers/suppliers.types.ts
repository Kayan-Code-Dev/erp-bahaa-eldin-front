import { TPaginationResponse } from "@/api/api-common.types";

/** Create supplier (name, code, optional phone and address) */
export type TCreateSupplierMinimalRequest = {
  name: string;
  code: string;
  /** رقم المورد (هاتف) */
  phone?: string;
  /** موقع / عنوان المورد */
  address?: string;
};

/** Create supplier (with first order) */
export type TCreateSupplierClothItem = {
  code: string;
  name: string;
  cloth_type_id?: number;
  entity_type: "branch" | "factory" | "workshop";
  entity_id: number;
  price: number;
};

export type TCreateSupplierRequest = {
  name: string;
  code: string;
  /** رقم المورد (هاتف) */
  phone?: string;
  /** موقع / عنوان المورد */
  address?: string;
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

/** Supplier list item (extended with optional stats when returned by API) */
export type TSupplierResponse = {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  /** رقم المورد (هاتف) */
  phone?: string | null;
  /** عنوان المورد - إن أرجعه الـ API */
  address?: string | null;
  /** عدد الطلبيات (مطابق لـ orders_count من الـ API) */
  orders_count?: number | null;
  /** عدد مرتجعات الطلبيات (مطابق لـ refund_orders_count من الـ API) */
  refund_orders_count?: number | null;
  /** إجمالي مبلغ الطلبيات (مطابق لـ total_order_amount من الـ API) */
  total_order_amount?: string | number | null;
  /** إجمالي المدفوع (مطابق لـ total_payment من الـ API) */
  total_payment?: string | number | null;
  /** إجمالي المرتجع (مطابق لـ total_refund من الـ API) */
  total_refund?: string | number | null;
  /** المتبقي (مطابق لـ total_remaining من الـ API) */
  total_remaining?: string | number | null;
  /** عدد المشتريات (اسم بديل) */
  purchases_count?: number | null;
  /** عدد المرتجعات (اسم بديل) */
  returns_count?: number | null;
  /** صافي عدد المشتريات (مشتريات - مرتجعات) */
  net_purchases_count?: number | null;
  /** إجمالي المشتريات (اسم بديل) */
  total_purchases?: string | number | null;
  /** إجمالي المرتجعات (اسم بديل) */
  total_returns?: string | number | null;
  /** صافي الرصيد (حساب) */
  net_balance?: string | number | null;
  /** المدفوع (اسم بديل) */
  paid?: string | number | null;
  /** المتبقي (اسم بديل) */
  remaining?: string | number | null;
};

export type TSuppliersListResponse = TPaginationResponse<TSupplierResponse>;

/** Supplier orders list */
export type TSupplierOrderResponse = {
  id: number;
  supplier_id: number;
  supplier: { id: number; name: string; code: string } | null;
  category_id: number | null;
  category: { id: number; name: string } | null;
  subcategory_id: number | null;
  subcategory: { id: number; name: string } | null;
  branch_id: number | null;
  branch: { id: number; name: string } | null;
  order_number: string;
  type: string | null;
  model_id: number | null;
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

/** Create supplier order — cloth item */
export type TCreateSupplierOrderClothItem = {
  code: string;
  name: string;
  description?: string;
  cloth_type_id?: number;
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

/** Update supplier payload */
export type TUpdateSupplierRequest = Partial<Pick<TCreateSupplierRequest, "name" | "code" | "phone" | "address">>;

/** Update supplier order payload */
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
