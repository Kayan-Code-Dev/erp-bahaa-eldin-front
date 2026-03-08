import { TLoginResponse } from "@/api/v2/auth/auth.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth state is persisted to localStorage by default (Zustand persist).
 * Token in localStorage is readable by any script on the page; avoid XSS
 * (e.g. no dangerouslySetInnerHTML with user content). Prefer HTTP-only
 * cookies for token if the backend supports it.
 */
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
