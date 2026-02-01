import { create } from "zustand";
import { persist } from "zustand/middleware";

type GeneralState = {
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

export const useGeneralStore = create<GeneralState>()(
  persist(
    (set) => ({
      currentPage: 0,
      setCurrentPage: (page: number) => set({ currentPage: page }),
    }),
    {
      name: "general-storage",
    }
  )
);
