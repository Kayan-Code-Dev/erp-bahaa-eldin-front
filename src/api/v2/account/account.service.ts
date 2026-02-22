import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TUpdateProfileRequest,
  TChangePasswordRequest,
  TAccountProfile,
} from "./account.types";

export const getProfileApi = async () => {
  try {
    const { data } = await api.get<TAccountProfile>("/me");
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في جلب بيانات الحساب");
  }
};

export const updateProfileApi = async (req: TUpdateProfileRequest) => {
  try {
    const { data } = await api.put<TAccountProfile>("/me", req);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في تحديث بيانات الحساب");
  }
};

export const changePasswordApi = async (req: TChangePasswordRequest) => {
  try {
    const { data } = await api.post("/me/change-password", req);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في تغيير كلمة المرور");
  }
};

export const uploadLogoApi = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await api.post<TAccountProfile>("/me/logo", formData);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في رفع الشعار");
  }
};

export const deleteLogoApi = async () => {
  try {
    const { data } = await api.delete("/me/logo");
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في حذف الشعار");
  }
};

export const deleteAccountApi = async (password: string) => {
  try {
    const { data } = await api.delete("/me", {
      data: { password },
    });
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في حذف الحساب");
  }
};
