import { lazy, Suspense } from "react";
import AppLayout from "@/components/layout/app-layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
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

const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const DashboardPage = lazy(() => import("./pages/dashboard-page/dashboard-page"));
const Clients = lazy(() => import("./pages/clients/Clients"));
const Factory = lazy(() => import("./pages/factory/Factory"));
const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const AccountSettings = lazy(() => import("./pages/account/AccountSettings"));


function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
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
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
