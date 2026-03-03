import Header from "@/components/app/header";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { Navigate, Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../app/new-sidebar/AppSideBar";
import { useNotifications } from "@/hooks/useNotifications";

const SIDEBAR_WIDTH_OPEN = "17rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";
const SIDEBAR_GAP_COLLAPSED = "1.5rem";

function MainContent() {
  const { open } = useSidebar();
  return (
    <div
      className="flex-1 min-w-0 flex flex-col min-h-screen transition-[margin] duration-200 ease-linear"
      style={{
        marginRight: open
          ? SIDEBAR_WIDTH_OPEN
          : `calc(${SIDEBAR_WIDTH_ICON} + ${SIDEBAR_GAP_COLLAPSED})`,
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
    return <Navigate to="/login" replace />;
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
