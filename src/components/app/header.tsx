import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MobileSidebar from "./sidebar/mobile-sidebar";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { useLogoutMutationOptions } from "@/api/v2/auth/auth.hooks";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useHasPermission } from "@/api/auth/auth.hooks";
import { HeaderSearch } from "./HeaderSearch";

function Header() {
  const logout = useAuthStore((s) => s.logout);
  const loginData = useAuthStore((s) => s.loginData);
  const { data: profile } = useProfile();
  const { hasPermission: canViewNotifications } = useHasPermission(["notifications.view", "notifications.manage"]);
  const { mutate: logoutMutation } = useMutation(useLogoutMutationOptions());
  const navigate = useNavigate();


  const handleLogout = () => {
    logoutMutation();
    logout();
    navigate("/login");
  };

  const displayName = profile?.name ?? loginData?.user?.name ?? "U";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 shrink-0 bg-white/98 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => navigate("/account")}
          className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          title="إعدادات الحساب"
        >
          <Avatar className="h-9 w-9 cursor-pointer ring-1 ring-slate-200/60">
            <AvatarImage src={profile?.avatar_url ?? profile?.avatar ?? undefined} alt="صورة الحساب" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
        {canViewNotifications && <NotificationBell />}
        <div className="flex-1 min-w-[200px] max-w-[640px]">
          <HeaderSearch />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          className="hidden sm:inline-flex items-center gap-2"
          onClick={handleLogout}
        >
          تسجيل خروج
        </Button>
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
      </div>
    </header>
  );
}

export default Header;
