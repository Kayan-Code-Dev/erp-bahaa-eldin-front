import { useMutation, useQuery } from "@tanstack/react-query";
import {
  forgetPasswordApi,
  getMyPermissionsApi,
  loginApi,
  logoutApi,
  resendOtpApi,
  resetPasswordApi,
  updatePasswordApi,
  verifyOtpApi,
} from "./auth.service";

export const useLoginApiMutation = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};

export const useLogoutApiMutation = () => {
  return useMutation({
    mutationFn: logoutApi,
  });
};

export const useForgetPasswordMutation = () => {
  return useMutation({
    mutationFn: forgetPasswordApi,
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: resendOtpApi,
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: verifyOtpApi,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
  });
};

export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: updatePasswordApi,
  });
};

export const MY_PERMISSIONS_KEY = "my-permissions";

export const useMyPermissions = () => {
  return useQuery({
    queryKey: [MY_PERMISSIONS_KEY],
    queryFn: getMyPermissionsApi,
    refetchInterval: 15 * 60 * 1000,
    refetchIntervalInBackground: true, // keeps running even when tab is unfocused
    refetchOnWindowFocus: false, // disable extra fetch on tab focus
  });
};

export const useHasPermission = (
  permission: string | string[]
): { hasPermission: boolean; isPending: boolean } => {
  const { data, isSuccess, isPending } = useMyPermissions();
  const perms = Array.isArray(permission) ? permission : [permission];
  const hasPermission =
    isSuccess &&
    Array.isArray(data) &&
    perms.some((p) => p === "" || data.includes(p));
  return { hasPermission: !!hasPermission, isPending };
};
