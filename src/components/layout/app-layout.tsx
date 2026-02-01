import Header from "@/components/app/header";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { Link, Outlet } from "react-router";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app/new-sidebar/AppSideBar";

function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen bg-[#f2f2f2]">
        <h1 className="text-2xl font-bold">من فضلك قم بتسجيل الدخول اولا</h1>
        <Link
          to="/login"
          className="ml-4 text-5xl text-blue-500 hover:underline"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f2f2f2] w-full flex">
        <div className="sticky top-0 h-screen overflow-y-auto hidden md:block scrollbar-hide w-80 flex-shrink-0">
          <AppSidebar />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <Header />
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
