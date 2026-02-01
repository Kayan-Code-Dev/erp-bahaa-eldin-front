import Workshop from "@/pages/workshop/Workshop";
import WorkshopDetails from "@/pages/workshop/workshop-management/WorkshopDetails";
import WorkshopTransfers from "@/pages/workshop/workshop-management/WorkshopTransfers";
import { Route } from "react-router";

export const workshopRoutes = () => {
  return (
    <>
      <Route path="/workshop" element={<Workshop />} />
      <Route path="/workshop/:id" element={<WorkshopDetails />} />
      <Route path="/workshop/:id/transfers" element={<WorkshopTransfers />} />
    </>
  );
};
