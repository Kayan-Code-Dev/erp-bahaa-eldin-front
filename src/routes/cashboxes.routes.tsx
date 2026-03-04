import { Route } from "react-router";
import Cashboxes from "@/pages/cachboxes/Cashboxes";
import CashboxDetails from "@/pages/cachboxes/CashboxDetails";
import PermissionProtectedRoute from "./PermissionProtectedRoute";

export const cashboxesRoutes = () => {
  return (
    <Route
      path="/cashboxes"
      element={
        <PermissionProtectedRoute
          permission={[
            "cashbox.view",
            "cashbox.manage",
            "cashbox.recalculate",
            "transactions.view",
          ]}
        />
      }
    >
      <Route index element={<Cashboxes />} />
      <Route path=":id" element={<CashboxDetails />} />
    </Route>
  );
};
