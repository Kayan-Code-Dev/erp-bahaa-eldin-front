export type TCashbox = {
  id: number;
  name: string;
  branch_id: number;
  initial_balance: number;
  current_balance: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch: {
    id: number;
    branch_code: string;
    name: string;
  };
  today_income: number;
  today_expense: number;
  today_summary?: {
    expense: number;
    income: number;
    net_change: number;
  };
};

export type TCashboxesParams = {
  per_page?: number;
  page?: number;
  is_active?: boolean;
  branch_id?: number;
};

export type TUpdateCashboxRequest = Partial<{
  name: string;
  description: string;
  is_active: boolean;
}>;

// by id and date
export type TCachboxDailySummary = {
  date: string;
  cashbox_id: number;
  cashbox_name: string;
  opening_balance: number;
  total_income: number;
  total_expense: number;
  net_change: number;
  closing_balance: number;
  transaction_count: number;
  reversal_count: number;
};

export type TCachboxRecalculateResponse = {
  message: string;
  previous_balance: number;
  calculated_balance: number;
  difference: number;
};
