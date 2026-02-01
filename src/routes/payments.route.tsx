import Payments from "@/pages/payments/Payments";
import { Route } from "react-router";

export const paymentsRoutes = () => {
  return <Route path="payments" element={<Payments />} />;
};
