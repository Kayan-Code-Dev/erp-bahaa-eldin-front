import { Route } from "react-router";
import Suppliers from "@/pages/suppliers/Suppliers";
import CreateSupplierOrder from "@/pages/suppliers/CreateSupplierOrder";

export const suppliersRoutes = () => {
  return (
    <>
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/suppliers/add" element={<Suppliers />} />
      <Route path="/suppliers/orders/add" element={<CreateSupplierOrder />} />
    </>
  );
};





