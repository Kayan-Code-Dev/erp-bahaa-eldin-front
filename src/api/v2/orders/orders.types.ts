import { TEntity } from "@/lib/types/entity.types";
import { TClothesStatus } from "../clothes/clothes.types";

export type TOrder = {
  id: number;
  client_id: number;
  total_price: number;
  status: TOrderPaymentStatus;
  paid: string;
  remaining: string;
  visit_datetime: string;
  order_notes: string | null;
  discount_type?: TDiscountType;
  discount_value?: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  entity_type: TEntity;
  order_type: TOrderType;
  entity_id: number;
  client: {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    address: {
      street: string;
      building: string;
      notes: string;
      city_id: number;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
      city_name: string;
      country_name: string;
    };
  };
  items: [
    {
      id: number;
      code: string;
      name: string;
      returnable: "1" | "0";
      description: string;
      cloth_type_id: number;
      breast_size: string;
      waist_size: string;
      sleeve_size: string;
      notes: string;
      status: TOrderPaymentStatus;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
      discount_type?: TDiscountType;
      discount_value?: number;
    },
  ];
};

export type TOrderPaymentStatus =
  | "created"
  | "paid"
  | "partially_paid"
  | "canceled"
  | "delivered";

export type TDiscountType = "none" | "percentage" | "fixed";

export type TOrderType = "rent" | "buy" | "tailoring";

// أضف هذا النوع للدفعات
export type TAddPaymentRequest = {
  amount: number;
  payment_method: string;
  paid_at?: string;
  notes?: string;
};

// يمكنك أيضاً إضافة أنواع أخرى للدفعات إذا لزم الأمر
export type TPayment = {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  paid_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TCreateOrderRequest = {
  client_id: number;
  entity_type: TEntity;
  entity_id: number;
  paid: number;
  visit_datetime: string;
  discount_type?: TDiscountType;
  discount_value?: number;
  order_notes?: string;
  items: {
    cloth_id: number;
    discount_type?: TDiscountType;
    discount_value?: number;
    price: number;
    type: TOrderType;
    days_of_rent: number;
    occasion_datetime: string;
    delivery_date: string;
    notes?: string;
  }[];
};

export type TReturnOrderItemsRequest = {
  items: {
    cloth_id: number;
    status: TClothesStatus;
    photos: File[];
    notes: string;
  }[];
};

export type TUpdateOrderRequest = {
  client_id: number;
  entity_type: TEntity;
  entity_id: number;
  paid: number;
  visit_datetime: string;
  order_notes: string;
  discount_type?: TDiscountType;
  discount_value?: number;
  items: {
    cloth_id: number;
    price: number;
    type: TOrderType;
    days_of_rent: number;
    occasion_datetime: string;
    delivery_date: string;
    notes?: string;
    discount_type?: TDiscountType;
    discount_value?: number;
  }[];
};

export type TReturnOrderItemRequest = {
  entity_type: TEntity;
  entity_id: number;
  note: string;
  photos: File[]; // 1 - 10 max photos
};

// أضف أنواع إضافية إذا لزم الأمر
export type TOrderStatusUpdateRequest = {
  status: TOrderPaymentStatus | "returned";
  notes?: string;
};

export type TOrderFilter = {
  status?: TOrderPaymentStatus;
  date_from?: string;
  date_to?: string;
  returned?: boolean;
  overdue?: boolean;
  search?: string;
};

// لاحظ أنني أضفت أيضاً نوع للدفعات في حالة الحاجة لعرضها
export type TOrderWithPayments = TOrder & {
  payments?: TPayment[];
};
