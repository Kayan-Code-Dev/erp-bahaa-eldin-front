import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFactoryOrder,
  getFactoryOrder,
  getFactoryOrders,
  startFactoryOrder,
  TStartFactoryOrderRequest,
  TUpdateFactoryOrderRequest,
  updateFactoryOrder,
} from "./factories.service";
import { TFactoryOrder } from "./factories.types";
import { toast } from "sonner";
import { TPaginationResponse } from "../api-common.types";

export const FACTORY_ORDERS_KEY = "factory-orders";

// Helper type
type TPageData = TPaginationResponse<TFactoryOrder>;

export const useFactoryOrders = (page: number) => {
  return useQuery({
    queryKey: [FACTORY_ORDERS_KEY, page],
    queryFn: () => getFactoryOrders(page),
  });
};

export const useOneFactoryOrder = (uuid: string) => {
  return useQuery({
    queryKey: [FACTORY_ORDERS_KEY, uuid],
    queryFn: () => getFactoryOrder(uuid),
    enabled: !!uuid, // Only run if uuid is provided
  });
};

export const useAcceptFactoryOrder = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: acceptFactoryOrder,
    onMutate: async (uuidToAccept: string) => {
      await qClient.cancelQueries({ queryKey: [FACTORY_ORDERS_KEY] });
      // Note: This optimism returns the full order, so we can update the single item query too
      qClient.setQueriesData<TPageData>(
        { queryKey: [FACTORY_ORDERS_KEY], exact: false }, // Update paginated lists
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((order) =>
              order.uuid === uuidToAccept
                ? { ...order, status: "pending" } // Optimistically update status
                : order
            ),
          };
        }
      );
      toast.success("تم قبول الطلب بنجاح");
    },
    onSuccess: (updatedOrder) => {
      // Update the single item query cache with the exact new data
      if (updatedOrder) {
        qClient.setQueryData(
          [FACTORY_ORDERS_KEY, updatedOrder.uuid],
          updatedOrder
        );
      }
    },
    onError: () => {
      toast.error("خطأ في قبول الطلب");
    },
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [FACTORY_ORDERS_KEY] });
    },
  });
};

export const useStartFactoryOrder = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: TStartFactoryOrderRequest;
    }) => startFactoryOrder(uuid, data),
    onMutate: async ({ uuid }) => {
      await qClient.cancelQueries({ queryKey: [FACTORY_ORDERS_KEY] });
      qClient.setQueriesData<TPageData>(
        { queryKey: [FACTORY_ORDERS_KEY], exact: false },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((order) =>
              order.uuid === uuid
                ? { ...order, status: "in_progress" } // Optimistically update status
                : order
            ),
          };
        }
      );
      toast.success("تم بدء العمل على الطلب");
    },
    onError: () => {
      toast.error("خطأ في بدء الطلب");
    },
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [FACTORY_ORDERS_KEY] });
    },
  });
};

export const useUpdateFactoryOrder = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: TUpdateFactoryOrderRequest;
    }) => updateFactoryOrder(uuid, data),
    onMutate: async ({ uuid, data }) => {
      await qClient.cancelQueries({ queryKey: [FACTORY_ORDERS_KEY] });

      const newStatus = data.status; // Get the new status from the form data

      // Update paginated list
      qClient.setQueriesData<TPageData>(
        { queryKey: [FACTORY_ORDERS_KEY], exact: false },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((order) =>
              order.uuid === uuid ? { ...order, status: newStatus } : order
            ),
          };
        }
      );
      // Update single item query
      qClient.setQueryData<TFactoryOrder>(
        [FACTORY_ORDERS_KEY, uuid],
        (oldData) => {
          if (!oldData) return;
          return { ...oldData, status: newStatus };
        }
      );
      toast.success("تم تحديث حالة الطلب");
    },
    onError: () => {
      toast.error("خطأ في تحديث الطلب");
    },
    onSettled: () => {
      qClient.invalidateQueries({ queryKey: [FACTORY_ORDERS_KEY] });
    },
  });
};
