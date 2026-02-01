import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCountry,
  deleteCountry,
  getCountries,
  getCountriesByModule,
  updateCountry,
} from "./country.service";

export const COUNTRIES_KEY = "COUNTRIES";

export const useCountries = (page: number) => {
  return useQuery({
    queryKey: [COUNTRIES_KEY, page],
    queryFn: () => getCountries(page),
  });
};

export const useCountriesByModule = (switchKey: string) => {
  return useQuery({
    queryKey: [COUNTRIES_KEY, switchKey],
    queryFn: () => getCountriesByModule(switchKey),
  });
};

export const useUpdateCountry = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }: { data: FormData; id: number }) =>
      updateCountry(id, data),
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useCreateCountry = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createCountry(data),
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useDeleteCountry = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCountry(id),
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [COUNTRIES_KEY] });
    },
  });
};

export const useInfiniteCountries = () => {
  return useInfiniteQuery({
    queryKey: [COUNTRIES_KEY, "infinite"],
    // getCountries returns the pagination response object
    queryFn: ({ pageParam = 1 }) => getCountries(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // If the last page's current_page < total_pages, return next page number
      if (!lastPage) return undefined;
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined; // No more pages
    },
  });
};
