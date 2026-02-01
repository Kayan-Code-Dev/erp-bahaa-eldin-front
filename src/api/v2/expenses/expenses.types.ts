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
  transaction_id: number | null;
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

export type TGetExpensesParams = {
  page?: number;
  per_page?: number;
  branch_id?: number;
  cashbox_id?: number;
  category?: string;
  status?: TExpenseStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  vendor?: string;
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
