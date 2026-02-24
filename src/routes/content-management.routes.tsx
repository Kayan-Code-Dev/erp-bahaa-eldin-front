import Categories from "@/pages/content-management-page/categories/Categories";
import Cities from "@/pages/content-management-page/cities/Cities";
import ContentManagementPage from "@/pages/content-management-page/ContentManagementPage";
import Countries from "@/pages/content-management-page/countries/Countries";
import Subcategories from "@/pages/content-management-page/subcategories/Subcategories";
import { Route } from "react-router";

export const contentManagementRouts = () => {
  return (
    <Route path="content" element={<ContentManagementPage />}>
      <Route path="countries" element={<Countries />} />
      <Route path="cities" element={<Cities />} />
      <Route path="categories" element={<Categories />} />
      <Route path="sub-categories" element={<Subcategories />} />
    </Route>
  );
};
