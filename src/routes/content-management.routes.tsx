import Categories from "@/pages/content-management-page/categories/Categories";
import Cities from "@/pages/content-management-page/cities/Cities";
import ContentManagementPage from "@/pages/content-management-page/ContentManagementPage";
import Countries from "@/pages/content-management-page/countries/Countries";
import Departments from "@/pages/content-management-page/departments/Departments";
import Roles from "@/pages/content-management-page/roles/Roles";
import Subcategories from "@/pages/content-management-page/subcategories/Subcategories";
import JobsTitles from "@/pages/content-management-page/job-titles/JobTitles";
import { Route } from "react-router";

export const contentManagementRouts = () => {
  return (
    <Route path="content" element={<ContentManagementPage />}>
      <Route path="countries" element={<Countries />} />
      <Route path="cities" element={<Cities />} />
      <Route path="categories" element={<Categories />} />
      <Route path="sub-categories" element={<Subcategories />} />
      <Route path="departments" element={<Departments />} />
      <Route path="jobs-titles" element={<JobsTitles />} />
      <Route path="roles" element={<Roles />} />
    </Route>
  );
};
