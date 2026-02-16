import Header from "@/components/app/header";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { Link, Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../app/new-sidebar/AppSideBar";
import { useNotifications } from "@/hooks/useNotifications";

const SIDEBAR_WIDTH_OPEN = "20rem";  /* w-80 in AppSidebar */
const SIDEBAR_WIDTH_ICON = "4rem";

function MainContent() {
  const { open } = useSidebar();
  return (
    <div
      className="flex-1 min-w-0 flex flex-col min-h-screen transition-[margin] duration-200 ease-linear"
      style={{
        marginRight: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_ICON,
      }}
    >
      <Header />
      <div className="p-4 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Initialize WebSocket notifications
  useNotifications();

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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-[#f2f2f2] w-full flex flex-row">
        <AppSidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
