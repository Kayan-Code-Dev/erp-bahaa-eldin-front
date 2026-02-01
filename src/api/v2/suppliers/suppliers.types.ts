import { TPaginationResponse } from "@/api/api-common.types";

export type TOrderType = "تفصيل" | "بيع";

export type TCreateSupplierRequest = {
  name: string;
  code: string;
  order_type?: TOrderType;
  purchase_date?: string;
  order_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
  item_name?: string;
  item_code?: string;
  category_id?: number;
  subcategory_id?: number;
  model_id?: number;
  branch_id?: number;
  add_model?: boolean;
};

export type TCreateSupplierOrderRequest = {
  supplier_id?: number;
  name?: string;
  code?: string;
  order_type: TOrderType;
  purchase_date: string;
  order_amount: number;
  paid_amount: number;
  remaining_amount: number;
  item_name: string;
  item_code: string;
  category_id: number;
  subcategory_id: number;
  model_id?: number;
  branch_id: number;
};

export type TSupplierResponse = {
  id: number;
  name: string;
  code: string;
  /** عند عدم وجود طلبية للمورد لا ترجع الـ API هذه الحقول */
  order_type?: TOrderType;
  purchase_date?: string;
  order_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
  item_name?: string;
  item_code?: string;
  category?: {
    id: number;
    name: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
  model?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
};

export type TUpdateSupplierRequest = Partial<TCreateSupplierRequest>;

export type TSuppliersListResponse = TPaginationResponse<TSupplierResponse>;

