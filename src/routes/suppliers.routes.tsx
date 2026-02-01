import { Route } from "react-router";
import Suppliers from "@/pages/suppliers/Suppliers";
import CreateSupplier from "@/pages/suppliers/CreateSupplier";
import CreateSupplierOrder from "@/pages/suppliers/CreateSupplierOrder";
import SupplierOrders from "@/pages/suppliers/SupplierOrders";

export const suppliersRoutes = () => {
  return (
    <>
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/suppliers/add" element={<CreateSupplier />} />
      <Route path="/suppliers/orders" element={<SupplierOrders />} />
      <Route path="/suppliers/orders/add" element={<CreateSupplierOrder />} />
    </>
  );
};





