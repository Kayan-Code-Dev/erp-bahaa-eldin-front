import Admins from "@/pages/hr/admins/Admins";
import AdminsRecycleBin from "@/pages/hr/admins/AdminsRecycleBin";
import ListAdmins from "@/pages/hr/admins/ListAdmins";
import Branches from "@/pages/hr/branch-managers/branch-manager/Branches";
import BranchManager from "@/pages/hr/branch-managers/branch-manager/BranchManager";
import BranchesManagers from "@/pages/hr/branch-managers/branches-managers/BranchesManagers";
import BranchesManagersRecyclebin from "@/pages/hr/branch-managers/branches-managers/BranchesManagersRecyclebin";
import DeletedBranchManagers from "@/pages/hr/branch-managers/branch-manager/DeletedBranchManagers";
import HR from "@/pages/hr/HR";
import { Route } from "react-router";

export const hrRoutes = () => {
  return (
    <Route path="hr" element={<HR />}>
      <Route path="admins" element={<Admins />}>
        <Route path="list" element={<ListAdmins />} />
        <Route path="recycled-bin" element={<AdminsRecycleBin />} />
      </Route>
      <Route path="branch-managers" element={<BranchManager />}>
        <Route path="all-branches-managers" element={<BranchesManagers />} />
        <Route path="recycled-bin-all-branches-managers" element={<BranchesManagersRecyclebin />} />

        <Route path="branches" element={<Branches />} />
        <Route
          path="recycled-bin-branches"
          element={<DeletedBranchManagers />}
        />
      </Route>
    </Route>
  );
};
