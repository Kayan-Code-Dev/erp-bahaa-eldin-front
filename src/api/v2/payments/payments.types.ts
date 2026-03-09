export type TPaymentStatus = "pending" | "paid" | "canceled";
export type TPaymentType = "initial" | "fee" | "normal";

export type TClothPayment = {
  cloth_id: number;
  amount: number;
};

export type TCreatePaymentRequest = {
  order_id: number;
  cloth_payments: TClothPayment[];
  status: TPaymentStatus; // only use paid or canceled in the form
  payment_type: TPaymentType;
  payment_date: string;
  notes: string;
};

export type TPayment = {
  id: number;
  order_id: number;
  /** API returns amount as a string, but some places treat it as number, so allow both */
  amount: number | string;
  status: TPaymentStatus;
  payment_type: TPaymentType;
  payment_date: string;
  notes: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  order: {
    id: number;
    client_id: number;
    inventory_id: number;
    /** Total price comes from API as a decimal string */
    total_price: number | string;
    status: string;
    tailoring_stage: string | null;
    tailoring_stage_changed_at: string | null;
    expected_completion_date: string | null;
    actual_completion_date: string | null;
    assigned_factory_id: number | null;
    sent_to_factory_date: string | null;
    received_from_factory_date: string | null;
    factory_notes: string | null;
    priority: string;
    /** Total paid and remaining amounts (decimal strings) */
    paid: string;
    remaining: string;
    delivery_date: string | null;
    days_of_rent: number;
    occasion_datetime: string | null;
    visit_datetime: string | null;
    order_notes: string | null;
    discount_type: string | null;
    discount_value: string;
    vat_enabled: boolean;
    vat_type: string | null;
    vat_value: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    employee_id: number;
    client: {
      id: number;
      /** Full name field returned by API (preferred when present) */
      name?: string;
      /** Optional name parts for backward compatibility */
      first_name?: string;
      middle_name?: string;
      last_name?: string;
      date_of_birth: string | null;
      national_id: string;
      address_id?: number;
      source: string | null;
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
    };
  };
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
};

/** Aligned with GET /api/v1/payments index filters */
export type TGetPaymentsParams = {
  page?: number;
  per_page?: number;
  status?: TPaymentStatus;
  payment_type?: TPaymentType;
  order_id?: number;
  client_id?: number;
  employee_id?: number;
  inventory_id?: number;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  amount_from?: number;
  amount_to?: number;
  created_by?: number;
  search?: string;
};
