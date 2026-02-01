import { api } from "../api-contants";
import { populateError } from "../api.utils";
import {
  LoginResponse,
  TForgetPasswordRequest,
  TLoginRequest,
  TResetPasswordRequest,
  TUpdatePasswordRequest,
  TVerifyOtpRequest,
} from "./auth.types";

export const loginApi = async (req: TLoginRequest) => {
  try {
    const { data } = await api.post<{ data: LoginResponse }>(
      "/auth/login",
      req
    );
    return data.data;
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء تسجيل الدخول"
    );
  }
};

export const logoutApi = async () => {
  try {
    await api.get("/auth/logout");
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء تسجيل الخروج"
    );
  }
};

export const forgetPasswordApi = async (req: TForgetPasswordRequest) => {
  try {
    await api.post("/auth/forgot-password", req);
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء تسجيل نسيان كلمة السر "
    );
  }
};

export const resendOtpApi = async (req: TForgetPasswordRequest) => {
  try {
    await api.post("/auth/send-code-forgot-password", req);
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء إعادة إرسال الرمز"
    );
  }
};

export const verifyOtpApi = async (req: TVerifyOtpRequest) => {
  try {
    await api.post("/auth/check-forgot-password", req);
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء التحقق من الرمز"
    );
  }
};

export const resetPasswordApi = async (req: TResetPasswordRequest) => {
  try {
    await api.post("/auth/reset-password", req);
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء إعادة تعيين كلمة السر"
    );
  }
};

export const updatePasswordApi = async (req: TUpdatePasswordRequest) => {
  try {
    await api.post("/auth/update-password", req);
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message || "خطأ اثناء تحديث تعيين كلمة السر"
    );
  }
};

export const getMyPermissionsApi = async () => {
  try {
    const { data } = await api.get<{ data: string[] }>(
      `/auth/get_my_permissions`
    );
    return data.data;
  } catch (error) {
    populateError(error, "خطأ اثناء تحميل الصلاحيات");
  }
};
