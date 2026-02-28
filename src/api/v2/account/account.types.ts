export type TUpdateProfileRequest = {
  name: string;
  email: string;
  /** رفع صورة جديدة مع تعديل البروفايل */
  avatar?: File | null;
  /** إزالة الصورة الحالية */
  avatar_remove?: boolean;
};

export type TChangePasswordRequest = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

/** استجابة GET /me */
export type TAccountProfile = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  employee?: unknown;
  roles?: string[];
};
