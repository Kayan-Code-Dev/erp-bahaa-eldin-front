import TransferClothes from "@/pages/clothes/transfer-clothes/TransferClothes";
import Clothes from "@/pages/clothes/Clothes";
import { Route } from "react-router";
import TransferClothesReqs from "@/pages/clothes/transfer-clothes-reqs/TransferClothesReqs";
import PermissionProtectedRoute from "./PermissionProtectedRoute";

export const clothesRoutes = () => {
  return (
    <Route
      path="/clothes"
      element={
        <PermissionProtectedRoute
          permission={[
            "clothes.view",
            "clothes.export",
            "transfers.view",
            "transfers.create",
            "transfers.update",
            "transfers.approve",
            "transfers.reject",
          ]}
        />
      }
    >
      <Route path="list" element={<Clothes />} />
      <Route path="transfer-clothes/actions" element={<TransferClothes />} />
      <Route path="transfer-clothes/requests" element={<TransferClothesReqs />} />
    </Route>
  );
};
