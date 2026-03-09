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
  /** API may return amount/balance as strings, so allow both */
  amount: number | string;
  balance_after: number | string;
  description: string | null;
  reference_type: string | null;
  reference_id: number | null;
  reversed_transaction_id?: number | null;
  created_by?: number | null;
  metadata: Record<string, unknown> | null;
  is_reversed: boolean;
  created_at: string;
  updated_at?: string | null;
  /** snapshot on the transaction itself */
  cashbox_balance_before?: number | string | null;
  cashbox_balance_after?: number | string | null;
  cashbox?: {
    id: number;
    name: string;
    branch_id?: number;
    initial_balance?: number | string;
    current_balance: number | string;
    description?: string | null;
  } | null;
  creator?: {
    id: number;
    name: string;
    email?: string;
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

