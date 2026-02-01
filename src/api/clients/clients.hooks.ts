import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, getClients, TCreateClientRequest } from "./clients.service";
import { toast } from "sonner"; // 1. Import toast

export const CLIENTS_KEY = "clients";

export const useClients = (page: number) => {
  return useQuery({
    // 2. Add `page` to the queryKey for correct pagination caching
    queryKey: [CLIENTS_KEY, page],
    queryFn: () => getClients(page),
  });
};

export const useCreateClient = () => {
  const qCLient = useQueryClient();
  return useMutation({
    mutationFn: (data: TCreateClientRequest) => createClient(data),
    onSuccess: () => {
      // 3. Add success/error toasts
      toast.success("تم إضافة العميل بنجاح");
      qCLient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
    onError: () => {
      toast.error("خطأ في إضافة العميل");
    },
  });
};