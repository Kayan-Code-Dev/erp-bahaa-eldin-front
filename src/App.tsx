import AppLayout from "@/components/layout/app-layout";
import DashboardPage from "@/pages/dashboard-page/dashboard-page";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import Clients from "./pages/clients/Clients";
import Factory from "./pages/factory/Factory";
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
import { jobTitlesRoutes } from "./routes/job-titles.routes";
import { employeesRoutes } from "./routes/employees.routes";
import { cashboxesRoutes } from "./routes/cashboxes.routes";
import { expensesRoutes } from "./routes/expenses.routes";
import { suppliersRoutes } from "./routes/suppliers.routes";
import { overduereturnsRoutes } from "./routes/overdureturns.routes";
import { returnsRoutes } from "./routes/returns.routes";
import { deliveriesRoutes } from "./routes/deliveries.routes";
import Notifications from "./pages/notifications/Notifications";


function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          {branchesRoutes()}
          <Route path="/clients" element={<Clients />} />
          {clothesRoutes()}
          {ordersRoutes()}
          {paymentsRoutes()}
          {hrRoutes()}
          {inventoryRoutes()}
          <Route path="/factory" element={<Factory />} />
          {workshopRoutes()}
          {permissionsRoutes()}
          {contentManagementRouts()}
          {jobTitlesRoutes()}
          {employeesRoutes()}
          {cashboxesRoutes()}
          {expensesRoutes()}
          {suppliersRoutes()}
          {overduereturnsRoutes()}
          {deliveriesRoutes()}
          {returnsRoutes()}
          <Route path="/notifications" element={<Notifications />} />

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
