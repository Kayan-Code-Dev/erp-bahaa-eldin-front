import { useState } from "react";
import { useLocation } from "react-router";
import { includeRoute, hasActiveChild } from "@/lib/helper";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarLabel } from "../sidebar/constants";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SideBarNav";

const CollapsibleSubItem = ({
  item,
  keyPrefix,
}: {
  item: SidebarLabel;
  keyPrefix?: string;
}) => {
  const { pathname } = useLocation();
  const active = includeRoute(
    pathname,
    item.path,
    item.level,
    !!item.subItems?.length
  );
  const hasActiveDescendant = hasActiveChild(pathname, item);
  const shouldColorParent = active && !hasActiveDescendant;
  const [open, setOpen] = useState(active || hasActiveDescendant);
  const isTopLevel = item.level === 1;
  const isActive = shouldColorParent || hasActiveDescendant;

  return (
    <Collapsible
      key={item.label}
      defaultOpen={active || hasActiveDescendant}
      open={open}
      className="w-full"
      onOpenChange={setOpen}
    >
      <SidebarGroup className="px-1 group-data-[collapsible=icon]:items-center gap-0">
        <SidebarMenuItem className="relative group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:mx-auto">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={shouldColorParent}
              className={cn(
                "w-full justify-start rounded-lg px-2.5 py-1.5 cursor-pointer text-slate-600 bg-transparent",
                "hover:bg-slate-50 hover:text-slate-900",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
                shouldColorParent && "sidebar-item-active"
              )}
            >
              <div className="flex items-center justify-between w-full min-w-0 text-inherit">
                <div className="shrink-0 flex items-center gap-2.5 min-w-0">
                  {item.iconComponent ? (
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors",
                        "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0",
                        isActive
                          ? "bg-main-gold/10 text-main-gold"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.iconComponent}
                    </span>
                  ) : item.icon ? (
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors",
                        isActive ? "bg-main-gold/10" : "bg-slate-100"
                      )}
                    >
                      <img
                        src={item.icon}
                        className={cn("w-4 h-4", isActive ? "opacity-100" : "opacity-70")}
                        alt=""
                      />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "truncate text-inherit group-data-[collapsible=icon]:hidden",
                      isTopLevel ? "text-[13px]" : "text-[12px]",
                      isActive ? "font-semibold text-slate-900" : "font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronLeft
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-slate-400 group-data-[collapsible=icon]:hidden",
                    open && "-rotate-90"
                  )}
                />
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>

        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent className="pr-4 pl-1 pt-0.5 pb-0.5 mt-0.5 mr-[14px] border-r border-slate-200">
            <SidebarNav items={item.subItems!} keyPrefix={keyPrefix} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};

export default CollapsibleSubItem;
