import { TBranchResponse } from "../branches/branches.types";
import { TCashbox } from "../cashboxes/cashboxes.types";

export const ExpenseCategories = [
  {
    id: "rent",
    name: "Rent",
  },
  {
    id: "utilities",
    name: "Utilities (Electricity, Water, Gas)",
  },
  {
    id: "supplies",
    name: "Supplies & Materials",
  },
  {
    id: "maintenance",
    name: "Maintenance & Repairs",
  },
  {
    id: "salaries",
    name: "Salaries & Wages",
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
  },
  {
    id: "transport",
    name: "Transportation",
  },
  {
    id: "cleaning",
    name: "Cleaning Services",
  },
  {
    id: "other",
    name: "Other",
  },
];

export type TExpense = {
  id: number;
  cashbox_id: number;
  branch_id: number;
  category: string;
  amount: number;
  expense_date: string;
  vendor: string;
  reference_number: string;
  description: string;
  notes: string;
  status: TExpenseStatus;
  approved_at: string | null;
  /** عندما يتم دفع المصروف فعلياً */
  paid_at?: string | null;
  transaction_id: number | null;
  /** Cashbox snapshot fields (قد تكون null للبيانات القديمة) */
  cashbox_balance_before?: number | null;
  cashbox_balance_after?: number | null;
  cashbox_daily_income_total?: number | null;
  cashbox_daily_expense_total?: number | null;
  cashbox_snapshot_meta?: {
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
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch: TBranchResponse;
  cashbox: TCashbox;
  creator: {
    id: number;
    name: string;
    email: string;
  };
};

export type TExpenseStatus = "pending" | "approved" | "paid" | "cancelled";

/** Aligned with GET /api/v1/expenses index filters */
export type TGetExpensesParams = {
  page?: number;
  per_page?: number;
  branch_id?: number;
  cashbox_id?: number;
  category?: string;
  subcategory?: string;
  status?: TExpenseStatus;
  start_date?: string;
  end_date?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  amount_from?: number;
  amount_to?: number;
  vendor?: string;
  reference_number?: string;
  created_by?: number;
  approved_by?: number;
  transaction_id?: number;
  search?: string;
};

export type TCreateExpenseRequest = {
  branch_id: number;
  category: string;
  amount: number;
  expense_date: string;
  vendor: string;
  reference_number: string;
  description: string;
  notes: string;
};

export type TUpdateExpenseRequest = Partial<
  Omit<TCreateExpenseRequest, "branch_id">
>;

export type TGetExpenseSummaryParams = {
  branch_id?: number;
  start_date: string;
  end_date: string;
};

export type TGetExpenseSummaryResponse = {
  period: {
    start_date: string;
    end_date: string;
  };
  total_paid: number;
  by_category: [
    {
      category: string;
      total: number;
      count: number;
    }[]
  ];
  by_status: Record<
    TExpenseStatus,
    {
      status: TExpenseStatus;
      total: number;
      count: number;
    }
  >;
};
