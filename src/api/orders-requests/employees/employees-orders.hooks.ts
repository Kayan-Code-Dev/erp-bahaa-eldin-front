import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { createEmployeesOrder, getEmployeesOrderDetails, getEmployeesOrders, updateEmployeesStatus } from "./employees-orders.service"
import { TOrderSchema, TOrderStatus, TOrderType } from "../orders-requests.types"


export const useGetEmployeesOrders = (page: number, type: TOrderType) => {
    return useQuery({
        queryKey: ["employees-orders", page, type],
        queryFn: () => getEmployeesOrders(page, type)
    })
}

export const useGetEmployeesOrderDetails = () => {
    const { order_id } = useParams();
    return useQuery({
        queryKey: ["employees-single-order", order_id],
        queryFn: () => getEmployeesOrderDetails(order_id!)
    })
}

export const useCreateEmployeesOrder = (order_type: TOrderType) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TOrderSchema) => createEmployeesOrder(data, order_type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees-orders"] });
            queryClient.invalidateQueries({ queryKey: ["employees-single-order"] });
        },
    });
};

export const useUpdateEmployeesOrderStatus = (order_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (order_status: { status: TOrderStatus }) => updateEmployeesStatus(order_status, order_id!,),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees-orders"] });
            queryClient.invalidateQueries({ queryKey: ["employees-single-order"] });
        },
    });
};