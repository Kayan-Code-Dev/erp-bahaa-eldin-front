import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCity,
  deleteCity,
  getCities,
  getCitiesByCountry,
  updateCity,
} from "./city.service";

export const CITIES_KEY = "cities";

export const useCities = (page: number) => {
  return useQuery({
    queryKey: [CITIES_KEY, page],
    queryFn: () => getCities(page),
  });
};

export const useCreateCity = () => {
  const qClint = useQueryClient();
  return useMutation({
    mutationFn: createCity,
    onSettled() {
      qClint.invalidateQueries({ queryKey: [CITIES_KEY] });
    },
  });
};

export const useUpdateCity = () => {
  const qClint = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateCity(id, data),
    onSettled() {
      qClint.invalidateQueries({ queryKey: [CITIES_KEY] });
    },
  });
};

export const useDeleteCity = () => {
  const qClint = useQueryClient();
  return useMutation({
    mutationFn: deleteCity,
    onSettled() {
      qClint.invalidateQueries({ queryKey: [CITIES_KEY] });
    },
  });
};

export const useCitiesByCountry = (id: number, switchKey?: string) => {
  return useQuery({
    queryKey: [CITIES_KEY, id, switchKey],
    queryFn: () => getCitiesByCountry(id, switchKey),
    enabled: !!id,
  });
};
