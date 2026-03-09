export type TTransactionType = "income" | "expense";

export type TTransactionCategory =
  | "payment"
  | "expense"
  | "salary_expense"
  | "receivable_payment";

export type TTransaction = {
  id: number;
  cashbox_id: number;
  type: TTransactionType;
  category: TTransactionCategory;
  amount: number;
  balance_after: number;
  description: string | null;
  reference_type: string | null;
  reference_id: number | null;
  metadata: Record<string, unknown> | null;
  is_reversed: boolean;
  created_at: string;
  cashbox?: {
    id: number;
    name: string;
    current_balance: number;
  } | null;
  creator?: {
    id: number;
    name: string;
  } | null;
};

export type TTransactionsParams = {
  page?: number;
  per_page?: number;
  cashbox_id?: number;
  start_date?: string;
  end_date?: string;
  sort?: "asc" | "desc";
};

