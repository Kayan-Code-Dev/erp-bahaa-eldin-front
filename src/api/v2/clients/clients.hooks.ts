import {
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createClient,
  deleteClient,
  exportClientsToCSV,
  getClient,
  getClients,
  updateClient,
} from "./clients.service";
import { TUpdateClientRequest } from "./clients.types";

export const CLIENTS_KEY = "clients";

export const useGetClientsQueryOptions = (page: number, per_page: number, search?: string) => {
  return queryOptions({
    queryKey: [CLIENTS_KEY, page, per_page, search],
    queryFn: () => getClients(page, per_page, search),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateClientMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: createClient,
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
};

export const useUpdateClientMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ id, data }: { id: number; data: TUpdateClientRequest }) =>
      updateClient(id, data),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
};

export const useDeleteClientMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
};

export const useGetClientQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => getClient(id),
  });
};

export const useGetClientByIdQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => getClient(id),
  });
};

export const useGetInfiniteClientsQueryOptions = (per_page: number, search?: string) => {
  return infiniteQueryOptions({
    queryKey: [CLIENTS_KEY, "infinite", search],
    queryFn: ({ pageParam = 1 }) => getClients(pageParam, per_page, search),
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


export const useExportClientsToCSVMutationOptions = () => {
  return mutationOptions({
    mutationFn: () => exportClientsToCSV(),
  });
};