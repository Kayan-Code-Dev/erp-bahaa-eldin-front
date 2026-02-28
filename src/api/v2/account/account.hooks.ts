import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  deleteAccountApi,
} from "./account.service";
import { TUpdateProfileRequest, TChangePasswordRequest } from "./account.types";
import { toast } from "sonner";

const PROFILE_KEY = "profile";

export const useProfile = () =>
  useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: getProfileApi,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TUpdateProfileRequest) => updateProfileApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
      toast.success("تم تحديث بيانات الحساب بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: TChangePasswordRequest) => changePasswordApi(data),
    onSuccess: () => toast.success("تم تغيير كلمة المرور بنجاح"),
    onError: (error: Error) => toast.error(error.message),
  });

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: (password: string) => deleteAccountApi(password),
    onError: (error: Error) => toast.error(error.message),
  });
