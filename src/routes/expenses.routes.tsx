import Expenses from "@/pages/expenses/Expenses";
import { Route } from "react-router";

export const expensesRoutes = () => {
  return <Route path="/expenses" element={<Expenses />} />;
};
