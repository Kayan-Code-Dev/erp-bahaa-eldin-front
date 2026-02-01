import { Route } from "react-router";
import DeliveriesList from "@/pages/deliveries/DeliveriesList";

export const deliveriesRoutes = () => {
  return <Route path="/deliveries" element={<DeliveriesList />} />;
};





