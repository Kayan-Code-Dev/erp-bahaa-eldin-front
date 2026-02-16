import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import MobileSidebar from "./sidebar/mobile-sidebar";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { useLogoutMutationOptions } from "@/api/v2/auth/auth.hooks";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function Header() {
  const logout = useAuthStore((s) => s.logout);
  const { mutate: logoutMutation } = useMutation(useLogoutMutationOptions());
  const navigate = useNavigate();
  const { toggleSidebar, open } = useSidebar();

  const handleLogout = () => {
    logoutMutation();
    logout();
    navigate("/login");
  };
  return (
    <header className="bg-white p-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-2 md:order-2">
        {/* Desktop: menu button to open sidebar when collapsed */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={open ? "إخفاء القائمة" : "فتح القائمة"}
            aria-label={open ? "إخفاء القائمة" : "فتح القائمة"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          تسجيل خروج
        </Button>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <SheetTitle className="sr-only">القائمة الجانبية</SheetTitle>
            <SheetDescription className="sr-only">القائمة الجانبية للتنقل</SheetDescription>
            <MobileSidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4 md:order-1">
        <div className="h-9 w-9 rounded-full bg-[#d9d9d9] overflow-hidden">
          <img
            src="https://picsum.photos/200/300?random=1"
            alt="User"
            className="h-full w-full object-cover"
          />
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}

export default Header;
