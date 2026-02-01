import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createOrder, getOrderDetails, getOrders, updateStatus } from "./orders-requests.service"
import { useParams } from "react-router"
import { TOrderSchema, TOrderStatus, TOrderType } from "./orders-requests.types"

export const useGetOrders = (page: number, type: TOrderType) => {
    return useQuery({
        queryKey: ["orders", page, type],
        queryFn: () => getOrders(page, type)
    })
}

export const useGetOrderDetails = () => {
    const { order_id } = useParams();
    return useQuery({
        queryKey: ["single-order", order_id],
        queryFn: () => getOrderDetails(order_id!)
    })
}

export const useCreateOrder = (order_type: TOrderType) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TOrderSchema) => createOrder(data, order_type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["single-order"] });
        },
    });
};

export const useUpdateOrderStatus = (order_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (order_status: { status: TOrderStatus }) => updateStatus(order_status, order_id!,),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["single-order"] });
        },
    });
};