export type TUpdateProfileRequest = {
  name: string;
  email: string;
  /** رفع صورة جديدة مع تعديل البروفايل */
  avatar?: File | null;
  /** إزالة الصورة الحالية */
  avatar_remove?: boolean;
  /** رفع شعار (لوغو) منفصل عن الصورة الشخصية */
  logo?: File | null;
  /** إزالة الشعار الحالي */
  logo_remove?: boolean;
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
  /** مسار الشعار (إن كان مدعوماً من الـ API) */
  logo?: string | null;
  logo_url?: string | null;
  employee?: unknown;
  roles?: string[];
};
