import { Route } from "react-router";
import OverdueReturnsList from "@/pages/overduereturns/OverdueReturnsList";

export const overduereturnsRoutes = () => {
  return <Route path="/overdue-returns" element={<OverdueReturnsList />} />;
};

