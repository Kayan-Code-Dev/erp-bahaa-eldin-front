import CreateEmployee from "@/pages/employees/CreateEmployee";
import ShowDetailsAndEditEmployee from "@/pages/employees/ShowDetailsAndEditEmployee";
import Employees from "@/pages/employees/Employees";
import { Route } from "react-router";
import EmployeeCustodies from "@/pages/employees/employee-custodies/EmployeeCustodies";
import OverdueEmployeeCustodies from "@/pages/employees/employee-custodies/OverdueEmployeeCustodies";
import EmployeeDocuments from "@/pages/employees/employee-documents/EmployeeDocuments";
import EmployeeDeductions from "@/pages/employees/employee-deductions/EmployeeDeductions";
import SimpleSalary from "@/pages/employees/simple-salary/SimpleSalary";
import PermissionProtectedRoute from "./PermissionProtectedRoute";

export const employeesRoutes = () => {
  return (
    <Route
      path="employees"
      element={
        <PermissionProtectedRoute
          permission={[
            "hr.employees.view",
            "hr.employees.create",
            "hr.custody.view",
            "hr.documents.view",
            "hr.deductions.view",
            "hr.payroll.view",
          ]}
        />
      }
    >
      <Route path="add" element={<CreateEmployee />} />
      <Route path="list" element={<Employees />} />
      <Route path="list/:id" element={<ShowDetailsAndEditEmployee />} />
      <Route path="custodies" element={<EmployeeCustodies />} />
      <Route path="custodies/overdue" element={<OverdueEmployeeCustodies />} />
      <Route path="employee-documents" element={<EmployeeDocuments />} />
      <Route path="employee-deductions" element={<EmployeeDeductions />} />
      <Route path="payroll" element={<SimpleSalary />} />
    </Route>
  );
};
