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
  amount: number;
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
    total_price: number;
    updated_at: string;
    client: {
      id: number;
      first_name: string;
      middle_name: string;
      last_name: string;
      date_of_birth: string;
      national_id: string;
      source: string | null;
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

export type TGetPaymentsParams = {
  page?: number;
  per_page?: number;
  status?: TPaymentStatus;
  payment_type?: TPaymentType;
  order_id?: number;
  client_id?: number;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  payment_date_from?: string;
  payment_date_to?: string;
  notes?: string;
  // created_by?: number;
  search?: string;
};
