import { Card } from "@/components/ui/card";
import { Outlet } from "react-router";

function ContentManagementPage() {
  return (
    <div>
      <Card className="my-4 px-4">
        <h1 className="text-2xl ">صفحة ادارة المحتوى</h1>
        <p> مرحبا فى صفحة ادارة المحتوى في النظام.</p>
      </Card>
      <Outlet />
    </div>
  );
}

export default ContentManagementPage;
