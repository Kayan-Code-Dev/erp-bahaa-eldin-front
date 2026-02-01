import { TEmployee } from "../employees.types";

export type TEmployeeDocumentType = { key: string; name: string };

export type TEmployeeDocument = {
  id: number;
  employee_id: number;
  type: string;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  issue_date: string;
  expiry_date: string;
  document_number: string;
  is_verified: boolean;
  verified_by: { id: number; name: string; email: string } | null;
  verified_at: null | string;
  uploaded_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  employee: TEmployee;
};

export type TCreateEmployeeDocumentRequest = {
  employee_id: number;
  type: string;
  title: string;
  description: string;
  file: File;
  issue_date: string;
  expiry_date: string;
  document_number: string;
};

export type TUpdateEmployeeDocumentRequest = Partial<{
  title: string;
  description: string;
  issue_date: string;
  expiry_date: string;
  document_number: string;
}>;

export type TGetAllEmployeesDocumentsParams = {
  page?: number;
  per_page?: number;
  employee_id?: number;
  type?: string;
  is_verified?: boolean;
  expiring_soon?: boolean;
};
