import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { includeRoute } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";
import { SidebarLabel } from "../sidebar/constants";
import CollapsibleSubItem from "./CollapsibleSubItem";

// Define the prop types
type SidebarNavProps = {
  items: SidebarLabel[];
};

export function SidebarNav({ items }: SidebarNavProps) {
  const { pathname } = useLocation();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = includeRoute(pathname, item.path, item.level);
        // --- 1. RENDER ITEM WITH SUB-MENU ---
        if (item.subItems) {
          return (
            <CollapsibleSubItem item={item} />
          );
        }

        // --- 2. RENDER SIMPLE ITEM (NO SUB-MENU) ---
        return (
          <SidebarMenuItem key={item.label} className="py-0.5 px-1">
            <SidebarMenuButton
              asChild
              className={cn(
                "w-full justify-start text-base text-gray-600 hover:text-main-gold hover:bg-transparent",
                active ? "bg-[#907457] text-white hover:text-white hover:bg-[#907457]" : ""
              )}
            >
              <Link to={item.path}>
                {item.iconComponent ? (
                  <span className="w-5 h-5 flex items-center justify-center">{item.iconComponent}</span>
                ) : item.icon ? (
                  <img src={item.icon} className="w-5 h-5" />
                ) : null}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
