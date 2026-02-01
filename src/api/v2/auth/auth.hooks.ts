import { mutationOptions } from "@tanstack/react-query";
import { loginApi, logoutApi } from "./auth.service";

export const useLoginMutationOptions = () => {
  return mutationOptions({
    mutationFn: loginApi,
  });
};

export const useLogoutMutationOptions = () => {
  return mutationOptions({
    mutationFn: logoutApi,
  });
};