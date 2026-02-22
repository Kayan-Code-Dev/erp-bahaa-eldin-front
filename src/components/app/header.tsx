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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/api/v2/account/account.hooks";

function Header() {
  const logout = useAuthStore((s) => s.logout);
  const loginData = useAuthStore((s) => s.loginData);
  const { data: profile } = useProfile();
  const { mutate: logoutMutation } = useMutation(useLogoutMutationOptions());
  const navigate = useNavigate();
  const { toggleSidebar, open } = useSidebar();

  const handleLogout = () => {
    logoutMutation();
    logout();
    navigate("/login");
  };

  const userInitials = (profile?.name || loginData?.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white p-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-2 md:order-2">
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
        <button
          onClick={() => navigate("/account")}
          className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="إعدادات الحساب"
        >
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={profile?.logo || undefined} alt="صورة الحساب" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}

export default Header;
