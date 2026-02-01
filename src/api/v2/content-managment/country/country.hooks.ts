import {
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCountryApi,
  deleteCountryApi,
  exportCountriesToCSV,
  getCountriesApi,
  getCountryByIdApi,
  updateCountryApi,
} from "./country.service";
import { TCreateCountryRequest } from "./country.types";

export const COUNTRIES_KEY = "COUNTRIES";

export const useCoutriesQueryOptions = (page: number, per_page: number) => {
  return queryOptions({
    queryKey: [COUNTRIES_KEY, page, per_page],
    queryFn: () => getCountriesApi(page, per_page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCountryMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: createCountryApi,
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useCountryByIdQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [COUNTRIES_KEY, id],
    queryFn: () => getCountryByIdApi(id),
  });
};

export const useUpdateCountryMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: (data: { id: number; req: TCreateCountryRequest }) =>
      updateCountryApi(data.id, data.req),
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useDeleteCountryMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: (id: number) => deleteCountryApi(id),
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useInfiniteCountriesQueryOptions = (per_page: number) => {
  return infiniteQueryOptions({
    queryKey: [COUNTRIES_KEY, "infinite"],
    queryFn: ({ pageParam = 1 }) => getCountriesApi(pageParam, per_page),
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useExportCountriesToCSVMutationOptions = () => {
  return mutationOptions({
    mutationFn: () => exportCountriesToCSV(),
  });
};