import AppLayout from "@/components/layout/app-layout";
import DashboardPage from "@/pages/dashboard-page/dashboard-page";
import LandingPage from "@/pages/landing/LandingPage";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import Clients from "./pages/clients/Clients";
import Factory from "./pages/factory/Factory";
import PermissionProtectedRoute from "./routes/PermissionProtectedRoute";
import getAuthRoutes from "./routes/auth.routes";
import { branchesRoutes } from "./routes/branches.route";
import { clothesRoutes } from "./routes/clothes.routes";
import { contentManagementRouts } from "./routes/content-management.routes";
import { hrRoutes } from "./routes/hr.routes";
import { inventoryRoutes } from "./routes/inventory.routes";
import { ordersRoutes } from "./routes/orders.routes";
import { permissionsRoutes } from "./routes/permissions.routes";
import { workshopRoutes } from "./routes/workshop.routes";
import { paymentsRoutes } from "./routes/payments.route";
import { employeesRoutes } from "./routes/employees.routes";
import { cashboxesRoutes } from "./routes/cashboxes.routes";
import { expensesRoutes } from "./routes/expenses.routes";
import { suppliersRoutes } from "./routes/suppliers.routes";
import { overduereturnsRoutes } from "./routes/overdureturns.routes";
import { returnsRoutes } from "./routes/returns.routes";
import { deliveriesRoutes } from "./routes/deliveries.routes";
import Notifications from "./pages/notifications/Notifications";
import AccountSettings from "./pages/account/AccountSettings";


function App() {
  return (
    <>
      <Routes>
        {/* Public marketing landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated application layout */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <PermissionProtectedRoute
                permission={[
                  "dashboard.view",
                  "dashboard.activity.view",
                  "dashboard.business.view",
                  "dashboard.hr.view",
                ]}
              />
            }
          >
            <Route index element={<DashboardPage />} />
          </Route>
          {branchesRoutes()}
          <Route
            path="/clients"
            element={
              <PermissionProtectedRoute
                permission={[
                  "clients.view",
                  "clients.create",
                  "clients.update",
                  "clients.delete",
                  "clients.export",
                ]}
              />
            }
          >
            <Route index element={<Clients />} />
          </Route>
          {clothesRoutes()}
          {ordersRoutes()}
          {paymentsRoutes()}
          {hrRoutes()}
          {inventoryRoutes()}
          <Route
            path="/factory"
            element={
              <PermissionProtectedRoute
                permission={[
                  "factories.view",
                  "factories.create",
                  "factories.update",
                  "factories.delete",
                  "factories.manage",
                ]}
              />
            }
          >
            <Route index element={<Factory />} />
          </Route>
          {workshopRoutes()}
          {permissionsRoutes()}
          {contentManagementRouts()}
          {employeesRoutes()}
          {cashboxesRoutes()}
          {expensesRoutes()}
          {suppliersRoutes()}
          {overduereturnsRoutes()}
          {deliveriesRoutes()}
          {returnsRoutes()}
          <Route
            path="/notifications"
            element={
              <PermissionProtectedRoute
                permission={["notifications.view", "notifications.manage"]}
              />
            }
          >
            <Route index element={<Notifications />} />
          </Route>
          <Route path="/account" element={<AccountSettings />} />

        </Route>
        <Route
          path="*"
          element={
            <h1 className="text-4xl font-bold text-center">Not Found</h1>
          }
        />
        {getAuthRoutes()}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
