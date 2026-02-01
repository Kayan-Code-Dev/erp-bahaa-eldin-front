import ChooseClient from "@/pages/orders/add-new-order/ChooseClient";
import ChooseClothes from "@/pages/orders/add-new-order/ChooseClothes";
import CreateOrderForm from "@/pages/orders/add-new-order/CreateOrderForm";
import OrderDetails from "@/pages/orders/OrderDetails";
import OrdersList from "@/pages/orders/OrdersList";
import UpdateClothesInOrder from "@/pages/orders/update-order/UpdateClothesInOrder";
import UpdateOrder from "@/pages/orders/update-order/UpdateOrder";
import { Route } from "react-router";

export const ordersRoutes = () => {
  return (
    <>
      <Route path="orders/list" index element={<OrdersList />} />
      <Route path="orders/:id" element={<OrderDetails />} />
      <Route path="orders/choose-client" index element={<ChooseClient />} />
      <Route path="orders/choose-clothes" element={<ChooseClothes />} />
      <Route path="orders/create-order" element={<CreateOrderForm />} />
      <Route path="orders/update-order" element={<UpdateOrder />} />
      <Route path="orders/update-clothes-in-order" element={<UpdateClothesInOrder />} />
    </>
  );
};
