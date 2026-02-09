export type TDashboardOverviewParams = {
  period?: "today" | "week" | "month" | "year" | "last_week" | "last_month";
  date_from?: string;
  date_to?: string;
  branch_id?: number;
  department_id?: number;
};

export type TDashboardPeriod = {
  from: string;
  to: string;
};

export type TDashboardActivity = {
  by_action: {
    created?: number;
    updated?: number;
    deleted?: number;
    login?: number;
    login_failed?: number;
  };
  by_entity_type: {
    [key: string]: number;
  };
  period: TDashboardPeriod;
  total_activities: number;
};

export type TDashboardBusiness = {
  clients: {
    active_clients: number;
    growth_rate: number;
    new_clients: number;
    period: TDashboardPeriod;
    total_clients: number;
  };
};

export type TDashboardFinancial = {
  cashbox_balances: Array<{
    cashbox_id: number;
    name: string;
    balance: number;
  }>;
  period: TDashboardPeriod;
  profit: number;
  profit_margin: number;
  total_expenses: number;
  total_income: number;
};

export type TDashboardInventory = {
  available: number;
  out_of_branch: number;
  total_items: number;
  utilization_rate: number;
};

export type TDashboardPayments = {
  by_method: {
    initial?: { count: number; total: number };
    normal?: { count: number; total: number };
    [key: string]: { count: number; total: number } | undefined;
  };
  payment_count: number;
  period: TDashboardPeriod;
  total_payments: number;
};

export type TDashboardSales = {
  average_order_value: number;
  by_status: {
    canceled?: { count: number; revenue: number };
    created?: { count: number; revenue: number };
    delivered?: { count: number; revenue: number };
    paid?: { count: number; revenue: number };
    partially_paid?: { count: number; revenue: number };
    [key: string]: { count: number; revenue: number } | undefined;
  };
  order_count: number;
  period: TDashboardPeriod;
  total_revenue: number;
};

export type TDashboardHR = {
  attendance: {
    absent_days: number;
    attendance_rate: number;
    late_arrivals: number;
    leave_days: number;
    period: TDashboardPeriod;
    present_days: number;
    total_records: number;
  };
  employee_activity: {
    most_active_employees: any[];
    period: TDashboardPeriod;
  };
  payroll: {
    average_salary: number;
    by_status: any[];
    payroll_count: number;
    period: TDashboardPeriod;
    total_payroll: number;
  };
  trends: {
    attendance_trends: any[];
    payroll_trends: any[];
    period: TDashboardPeriod;
  };
};

export type TDashboardOverviewResponse = {
  activity: TDashboardActivity;
  business: TDashboardBusiness;
  financial: TDashboardFinancial;
  inventory: TDashboardInventory;
  payments: TDashboardPayments;
  sales: TDashboardSales;
  hr: TDashboardHR;
  generated_at: string;
};
