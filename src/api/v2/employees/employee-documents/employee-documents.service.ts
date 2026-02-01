import { populateError } from "@/api/api.utils";
import {
  TCreateEmployeeDocumentRequest,
  TEmployeeDocument,
  TEmployeeDocumentType,
  TGetAllEmployeesDocumentsParams,
  TUpdateEmployeeDocumentRequest,
} from "./employee-documents.types";
import { api } from "@/api/api-contants";
import { TPaginationResponse } from "@/api/api-common.types";

export const createEmployeeDocument = async (
  data: TCreateEmployeeDocumentRequest
) => {
  try {
    const formData = new FormData();
    formData.append("employee_id", data.employee_id.toString());
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("file", data.file);
    formData.append("issue_date", data.issue_date);
    formData.append("expiry_date", data.expiry_date);
    formData.append("document_number", data.document_number);
    await api.post("/employee-documents", formData);
  } catch (error) {
    populateError(error, "خطأ فى إضافة الوثيقة");
  }
};

export const updateEmployeeDocument = async (
  document_id: number,
  data: TUpdateEmployeeDocumentRequest
) => {
  try {
    await api.put(`/employee-documents/${document_id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث الوثيقة");
  }
};

export const deleteEmployeeDocument = async (document_id: number) => {
  try {
    await api.delete(`/employee-documents/${document_id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف الوثيقة");
  }
};

export const getEmployeeDocument = async (document_id: number) => {
  try {
    const response = await api.get<TEmployeeDocument>(
      `/employee-documents/${document_id}`
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الوثيقة");
  }
};

export const getAllEmployeesDocuments = async (
  params: TGetAllEmployeesDocumentsParams
) => {
  try {
    const response = await api.get<TPaginationResponse<TEmployeeDocument>>(
      `/employee-documents`,
      { params }
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الوثائق");
  }
};

export const verifyEmployeeDocument = async (document_id: number) => {
  try {
    await api.post(`/employee-documents/${document_id}/verify`);
  } catch (error) {
    populateError(error, "خطأ فى تأكيد الوثيقة");
  }
};

export const unverifyEmployeeDocument = async (document_id: number) => {
  try {
    await api.post(`/employee-documents/${document_id}/unverify`);
  } catch (error) {
    populateError(error, "خطأ فى إلغاء تأكيد الوثيقة");
  }
};

export const downloadEmployeeDocument = async (document_id: number) => {
  try {
    const response = await api.get(
      `/employee-documents/${document_id}/download`,
      { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ فى تحميل الوثيقة");
  }
};

export const getEmployeeDocumentTypes = async () => {
  try {
    const response = await api.get<{ types: TEmployeeDocumentType[] }>(
      `/employee-documents/types`
    );
    return response.data.types;
  } catch (error) {
    populateError(error, "خطأ فى جلب أنواع الوثائق");
  }
};

export const getExpiringSoonEmployeeDocumentsyDays = async (
  page: number,
  per_page: number,
  days: number
) => {
  try {
    const response = await api.get<TPaginationResponse<TEmployeeDocument>>(
      `/employee-documents/expiring`,
      { params: { page, per_page, days } }
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الوثائق القريبة من الانتهاء");
  }
};

export const getExpiredEmployeeDocuments = async (
  page: number,
  per_page: number
) => {
  try {
    const response = await api.get<TPaginationResponse<TEmployeeDocument>>(
      `/employee-documents/expired`,
      { params: { page, per_page } }
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الوثائق المنتهية");
  }
};
