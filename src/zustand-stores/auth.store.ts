import { TLoginResponse } from "@/api/v2/auth/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  isAuthenticated: boolean;
  loginData: TLoginResponse | undefined;
  login: (loginData: TLoginResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      loginData: undefined,
      login: (loginData: TLoginResponse) =>
        set({ isAuthenticated: true, loginData }),
      logout: () => set({ isAuthenticated: false, loginData: undefined }),
    }),
    {
      name: "auth-storage",
    }
  )
);
