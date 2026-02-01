import { Route } from "react-router";
import Cashboxes from "@/pages/cachboxes/Cashboxes";
import CashboxDetails from "@/pages/cachboxes/CashboxDetails";

export const cashboxesRoutes = () => {
  return (
    <>
      <Route path="/cashboxes" element={<Cashboxes />} />
      <Route path="/cashboxes/:id" element={<CashboxDetails />} />
    </>
  );
};
