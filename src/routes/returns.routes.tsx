import { Route } from "react-router";
import ReturnsList from "@/pages/returns/ReturnsList";

export const returnsRoutes = () => {
  return <Route path="/returns" element={<ReturnsList />} />;
};

