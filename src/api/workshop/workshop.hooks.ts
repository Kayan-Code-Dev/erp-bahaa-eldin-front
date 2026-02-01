import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { acceptWorkshopOrder, createInvoice, getWorkshopDetails, getWorkshops } from "./workshop.service"
import { useParams } from "react-router"
import { TInvoiceSchema } from "./workshop.types"
import { toast } from "sonner"

export const useGetWorkshops = (page: number) => {
    return useQuery({
        queryKey: ["workshops", page],
        queryFn: () => getWorkshops(page)
    })
}

export const useGetWorkshopDetails = () => {
    const { workshop_id } = useParams();
    return useQuery({
        queryKey: ["single-workshop", workshop_id],
        queryFn: () => getWorkshopDetails(workshop_id!)
    })
}

export const useCreateInvoice = () => {
    const { workshop_id } = useParams();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TInvoiceSchema) => createInvoice(data, workshop_id!),
        onSuccess: () => {
            toast.success("تم حفظ بيانات الطلب بنجاح");
            queryClient.invalidateQueries({ queryKey: ["workshops"] });
            queryClient.invalidateQueries({ queryKey: ["single-workshop"] });
        },
        onError: (err: any) => {
            toast.error("حدث خطأ أثناء حفظ الطلب", {
                description: err?.message
            });
        }
    });
};

export const useAcceptWorkshopOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (order_id: string) => acceptWorkshopOrder(order_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workshops"] });
            queryClient.invalidateQueries({ queryKey: ["single-workshop"] });
        },
    });
};