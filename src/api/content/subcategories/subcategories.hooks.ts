import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubcategory,
  deleteSubcategory,
  getCategoriesForSubcategories,
  getSubcategories,
  updateSubcategory,
} from "./subcategories.service";

export const SUBCATEGORIES_KEY = "subcategories";

export const useSubcategories = (page: number) => {
  return useQuery({
    queryKey: [SUBCATEGORIES_KEY],
    queryFn: () => getSubcategories(page),
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] });
    },
  });
};

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }: any) => updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] });
    },
  });
};


export const useCategoriesForSubcategories = () => {
  return useQuery({
    queryKey: ["categoriesForSubcategories"],
    queryFn: () => getCategoriesForSubcategories(),
  });
};