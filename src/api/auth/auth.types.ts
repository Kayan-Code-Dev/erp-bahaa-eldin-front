export type LoginResponse = {
  id: number;
  image: string;
  name: string;
  email: string;
  phone: string;
  id_number: string;
  country: string;
  city: string;
  last_login: string;
  status: "active" | string;
  blocked: boolean;
  token: string;
  permissions: string[];
};

// admin-api - For system administrators
// branchManager-api - For branch managers
// branch-api - For branch users
// employee-api - For employees

export type TLoginGuard =
  | "admin-api"
  | "branchManager-api"
  | "employee-api"
  | "branch-api";

export type TLoginRequest = {
  guard: TLoginGuard;
  emOrMb: string;
  password: string;
};

export type TForgetPasswordRequest = {
  emOrMb: string;
  guard: TLoginGuard;
};

export type TVerifyOtpRequest = {
  guard: TLoginGuard;
  emOrMb: string;
  code: string;
};

export type TResetPasswordRequest = {
  guard: TLoginGuard;
  emOrMb: string;
  password: string;
  password_confirmation: string;
};

export type TUpdatePasswordRequest = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};
