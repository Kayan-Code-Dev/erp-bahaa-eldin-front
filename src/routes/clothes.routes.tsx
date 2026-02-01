import TransferClothes from "@/pages/clothes/transfer-clothes/TransferClothes";
import Clothes from "@/pages/clothes/Clothes";
import { Route } from "react-router";
import TransferClothesReqs from "@/pages/clothes/transfer-clothes-reqs/TransferClothesReqs";
import ClothesModels from "@/pages/clothes/clothes-models/ClothesModels";

export const clothesRoutes = () => {
  return (
    <>
      <Route path="/clothes/list" element={<Clothes />} />
      <Route path="/clothes/transfer-clothes/actions" element={<TransferClothes />} />
      <Route
        path="/clothes/transfer-clothes/requests"
        element={<TransferClothesReqs />}
      />
      <Route path="/clothes/models" element={<ClothesModels />} />
    </>
  );
};
