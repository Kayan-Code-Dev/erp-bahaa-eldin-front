import { TEmployee } from "../employees.types";

export type TEmployeeDeduction = {
  id: number;
  employee_id: number;
  type: string;
  reason: string;
  description: string;
  amount: number;
  date: string;
  period: string;
  payroll_id: number | null;
  is_applied: boolean;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  approved_by: {
    id: number;
    name: string;
    email: string;
  } | null;
  approved_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employee: TEmployee;
  payroll: null;
};

export type TCreateEmployeeDeductionRequest = {
  employee_id: number;
  type: string;
  reason: string;
  description: string;
  amount: number;
  date: string;
  notes: string;
};

export type TUpdateEmployeeDeductionRequest = Partial<{
  reason: string;
  description: string;
  amount: number;
  notes: string;
}>;

export type TEmployeeDeductionType = {
  key: string;
  name: string;
};

export type TGetEmployeeDeductionsParams = {
  page?: number;
  per_page?: number;

  employee_id?: number;
  type?: string;
  date?: string;
  period?: string; // YYYY-MM
  is_applied?: boolean;
  is_approved?: boolean;
};

export type TCreateLateEmployeeDeductionRequest = {
  employee_id: number;
  date: string;
  late_minutes: number;
};

export type TCreateAbsenceEmployeeDeductionRequest = {
  employee_id: number;
  date: string;
  reason: string;
};
