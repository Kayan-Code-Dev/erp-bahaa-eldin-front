import {
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createClothesModel,
  deleteClothesModel,
  getClothesModelById,
  getClothesModels,
  updateClothesModel,
} from "./clothes.models.service";
import { TUpdateClothesModel } from "./clothes.models.types";

export const CLOTHES_MODELS_KEY = "CLOTHES_MODELS";

export const useGetClothesModelsOptions = (page: number, per_page: number) => {
  return queryOptions({
    queryKey: [CLOTHES_MODELS_KEY, page, per_page],
    queryFn: () => getClothesModels(page, per_page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateClothesModelMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createClothesModel,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CLOTHES_MODELS_KEY] });
    },
  });
};

export const useUpdateClothesModelMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ id, req }: { id: number; req: TUpdateClothesModel }) =>
      updateClothesModel(id, req),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CLOTHES_MODELS_KEY] });
    },
  });
};

export const useDeleteClothesModelMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (id: number) => deleteClothesModel(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CLOTHES_MODELS_KEY] });
    },
  });
};

export const useGetClothesModelByIdOptions = (id: number) => {
  return queryOptions({
    queryKey: [CLOTHES_MODELS_KEY, id],
    queryFn: () => getClothesModelById(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetInfiniteClothesModelsOptions = (per_page: number) => {
  return infiniteQueryOptions({
    queryKey: [CLOTHES_MODELS_KEY, per_page, "infinite"],
    queryFn: ({ pageParam = 1 }) => getClothesModels(pageParam, per_page),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};
