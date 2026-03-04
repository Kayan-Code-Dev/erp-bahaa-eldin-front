import BranchManager from "@/pages/branches-manager/BranchManger";
import { Route } from "react-router";
import PermissionProtectedRoute from "./PermissionProtectedRoute";

export const branchesRoutes = () => {
  return (
    <Route element={<PermissionProtectedRoute permission="branches.view" />}>
      <Route path="/branch" element={<BranchManager />} />
    </Route>
  );
};
