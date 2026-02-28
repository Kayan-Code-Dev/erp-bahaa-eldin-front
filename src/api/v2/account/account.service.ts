import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TUpdateProfileRequest,
  TChangePasswordRequest,
  TAccountProfile,
} from "./account.types";

/** عرض معلومات المستخدم من /me */
export const getProfileApi = async (): Promise<TAccountProfile | undefined> => {
  try {
    const { data } = await api.get<TAccountProfile>("/me");
    return data;
  } catch (error: any) {
    populateError(error, "خطأ في جلب بيانات الحساب");
  }
};

/** تعديل البروفايل (الاسم، البريد، الصورة) عبر /me */
export const updateProfileApi = async (req: TUpdateProfileRequest) => {
  try {
    const hasFile = req.avatar instanceof File;
    const useFormData = hasFile || req.avatar_remove;

    if (useFormData) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", req.name);
      formData.append("email", req.email);
      if (req.avatar instanceof File) {
        formData.append("avatar", req.avatar);
      }
      if (req.avatar_remove) {
        formData.append("avatar_remove", "1");
      }
      const { data } = await api.post<TAccountProfile>("/me", formData);
      return data;
    }

    const { data } = await api.put<TAccountProfile>("/me", {
      name: req.name,
      email: req.email,
    });
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
