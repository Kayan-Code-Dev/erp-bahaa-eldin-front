import CreateEmployee from "@/pages/employees/CreateEmployee";
import ShowDetailsAndEditEmployee from "@/pages/employees/ShowDetailsAndEditEmployee";
import Employees from "@/pages/employees/Employees";
import { Route } from "react-router";
import EmployeeCustodies from "@/pages/employees/employee-custodies/EmployeeCustodies";
import OverdueEmployeeCustodies from "@/pages/employees/employee-custodies/OverdueEmployeeCustodies";
import EmployeeDocuments from "@/pages/employees/empolyee-documents/EmployeeDocuments";
import EmployeeDeductions from "@/pages/employees/employee-deductions/EmployeeDeductions";

export const employeesRoutes = () => {
  return (
    <>
      <Route path="employees/add" element={<CreateEmployee />} />
      <Route path="employees/list" element={<Employees />} />
      <Route
        path="employees/list/:id"
        element={<ShowDetailsAndEditEmployee />}
      />
      <Route path="employees/custodies" element={<EmployeeCustodies />} />
      <Route
        path="employees/custodies/overdue"
        element={<OverdueEmployeeCustodies />}
      />
      <Route
        path="employees/employee-documents"
        element={<EmployeeDocuments />}
      />
      <Route
        path="employees/employee-deductions"
        element={<EmployeeDeductions />}
      />
    </>
  );
};
