import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import appLogo from "@/assets/app-logo.svg";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels } from "../sidebar/constants";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [pinned, setPinned] = useState(false);

  const handleButtonClick = () => {
    if (open) {
      if (pinned) {
        setOpen(false);
        setPinned(false);
      } else {
        setPinned(true); /* مفتوح بالهوفر → الضغط يثبته مفتوحاً */
      }
    } else {
      setOpen(true);
      setPinned(true);
    }
  };

  const handleMouseEnter = () => {
    if (!open) {
      setOpen(true);
      setPinned(false);
    }
  };

  const handleMouseLeave = () => {
    if (!pinned) setOpen(false);
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      data-app-sidebar
      data-open-by={open ? (pinned ? "button" : "hover") : undefined}
      className="w-80 border-l border-sidebar-border bg-sidebar text-sidebar-foreground"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="border-b border-sidebar-border p-2 flex flex-col gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className={cn(
            "size-9 shrink-0 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            open && pinned && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          )}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          title={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="h-px bg-sidebar-border shrink-0 group-data-[collapsible=icon]:hidden" />
        <div className="flex justify-center items-center group-data-[collapsible=icon]:hidden">
          <img src={appLogo} alt="App Logo" className="w-28 h-auto dark:invert" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:items-center scrollbar-thin scrollbar-track-sidebar-accent/50 scrollbar-thumb-sidebar-border">
        <SidebarNav items={sidebarLabels} />
      </SidebarContent>
    </Sidebar>
  );
}
