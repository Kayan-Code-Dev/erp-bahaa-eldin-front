import { TEntity } from "@/lib/types/entity.types";
import { TClothesStatus } from "../clothes/clothes.types";

/** Client address as returned by the orders API */
export type TOrderAddress = {
  id: number;
  street: string;
  building: string;
  notes: string | null;
  city_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  city_name: string;
  country_id: number;
  country_name: string;
};

/** Client as nested in order response */
export type TOrderClient = {
  id: number;
  name: string;
  date_of_birth: string | null;
  national_id: string | null;
  address_id: number | null;
  source?: string | null;
  breast_size?: string | null;
  waist_size?: string | null;
  sleeve_size?: string | null;
  hip_size?: string | null;
  shoulder_size?: string | null;
  length_size?: string | null;
  measurement_notes?: string | null;
  last_measurement_date?: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  address?: TOrderAddress | null;
};

/** Inventory as nested in order response */
export type TOrderInventory = {
  id: number;
  name: string;
  inventoriable_type: string;
  inventoriable_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  inventoriable?: {
    id: number;
    branch_code?: string;
    name: string;
    address_id: number | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
};

/** Order line item as returned by orders list/details API */
export type TOrderItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  cloth_type_id: number;
  breast_size: string | null;
  waist_size: string | null;
  sleeve_size: string | null;
  notes: string | null;
  status: TOrderPaymentStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  price: string;
  type: TOrderType;
  quantity: number;
  item_paid: string;
  item_remaining: string;
  days_of_rent: number | null;
  occasion_datetime: string | null;
  delivery_date: string | null;
  discount_type: TDiscountType | null;
  discount_value: string | null;
  returnable: 0 | 1;
  factory_status?: string | null;
  factory_rejection_reason?: string | null;
  factory_accepted_at?: string | null;
  factory_rejected_at?: string | null;
  factory_expected_delivery_date?: string | null;
  factory_delivered_at?: string | null;
  factory_notes?: string | null;
  sleeve_length?: string | null;
  forearm?: string | null;
  shoulder_width?: string | null;
  cuffs?: string | null;
  waist?: string | null;
  chest_length?: string | null;
  total_length?: string | null;
  hinch?: string | null;
  dress_size?: string | null;
};

export type TOrder = {
  id: number;
  client_id: number;
  total_price: string;
  status: TOrderPaymentStatus;
  paid: string;
  remaining: string;
  visit_datetime: string;
  order_notes: string | null;
  discount_type: TDiscountType | null;
  discount_value: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  entity_type: TEntity;
  entity_id: number;
  order_type: TOrderType;
  tailoring_stage: string | null;
  tailoring_stage_changed_at: string | null;
  expected_completion_date: string | null;
  actual_completion_date: string | null;
  assigned_factory_id: number | null;
  sent_to_factory_date: string | null;
  received_from_factory_date: string | null;
  factory_notes: string | null;
  priority: string;
  client: TOrderClient;
  inventory?: TOrderInventory | null;
  items: TOrderItem[];
};

export type TOrderPaymentStatus =
  | "created"
  | "paid"
  | "partially_paid"
  | "canceled"
  | "delivered";

export type TDiscountType = "none" | "percentage" | "fixed";

export type TOrderType = "rent" | "buy" | "tailoring" | "mixed";

/** Payment request payload */
export type TAddPaymentRequest = {
  amount: number;
  payment_method: string;
  paid_at?: string;
  notes?: string;
};

/** Payment record */
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

/** Single order item payload for POST /api/v1/orders */
export type TCreateOrderItemRequest = {
  cloth_id: number;
  price: number;
  quantity: number;
  paid?: number;
  type: TOrderType;
  notes?: string;
  discount_type?: TDiscountType;
  discount_value?: number;
  /** For rent orders */
  days_of_rent?: number;
  occasion_datetime?: string;
  delivery_date?: string;
  /** For tailoring — all measurements optional */
  sleeve_length?: string;
  forearm?: string;
  shoulder_width?: string;
  cuffs?: string;
  waist?: string;
  chest_length?: string;
  total_length?: string;
  hinch?: string;
  dress_size?: string;
};

export type TCreateOrderRequest = {
  client_id: number;
  entity_type: TEntity;
  entity_id: number;
  visit_datetime: string;
  order_notes?: string;
  discount_type?: TDiscountType;
  discount_value?: number;
  items: TCreateOrderItemRequest[];
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

/** Order status update payload */
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

/** Order with optional payments list */
export type TOrderWithPayments = TOrder & {
  payments?: TPayment[];
};
