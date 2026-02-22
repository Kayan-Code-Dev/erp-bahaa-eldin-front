export type TUpdateProfileRequest = {
  name: string;
  email: string;
};

export type TChangePasswordRequest = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export type TAccountProfile = {
  id: number;
  name: string;
  email: string;
  logo?: string | null;
};
