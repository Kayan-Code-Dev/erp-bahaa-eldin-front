import JobTitles from "@/pages/content-management-page/job-titles/JobTitles";
import { Route } from "react-router";

export const jobTitlesRoutes = () => {
  return (
    <>
      <Route path="job-titles" element={<JobTitles />} />
    </>
  );
};
