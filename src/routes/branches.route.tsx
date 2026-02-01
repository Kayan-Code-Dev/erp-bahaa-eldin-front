import BranchManager from "@/pages/branches-manager/BranchManger";
import { Route } from "react-router";

export const branchesRoutes = () => {
  return <Route path="/branch" element={<BranchManager />} />;
};
