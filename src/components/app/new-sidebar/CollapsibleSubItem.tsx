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
  // Parent should only be colored if it's active AND no child is active
  const shouldColorParent = active && !hasActiveDescendant;
  const [open, setOpen] = useState(active || hasActiveDescendant);
  const isTopLevel = item.level === 1;

  return (
    <Collapsible
      key={item.label}
      defaultOpen={active || hasActiveDescendant}
      open={open}
      className="py-0.5 w-full"
      onOpenChange={setOpen}
    >
      <SidebarGroup className="px-1.5 group-data-[collapsible=icon]:items-center gap-1">
        <SidebarMenuItem className="relative group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:mx-auto">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={shouldColorParent}
              className={cn(
                "w-full justify-start text-[13px] rounded-lg px-2.5 py-2 cursor-pointer text-sidebar-foreground/85 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
                shouldColorParent && "sidebar-active-gold"
              )}
            >
              <div className="flex items-center justify-between w-full min-w-0 text-inherit">
                <div className="shrink-0 flex items-center gap-2 min-w-0">
                  {item.iconComponent ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-accent/20 border border-sidebar-border/50 text-current shrink-0 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0">
                      {item.iconComponent}
                    </span>
                  ) : item.icon ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-accent/20 border border-sidebar-border/50 shrink-0">
                      <img
                        src={item.icon}
                        className="w-4 h-4 opacity-80"
                        alt=""
                      />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "truncate text-inherit group-data-[collapsible=icon]:hidden",
                      isTopLevel
                        ? "text-[13px] font-medium"
                        : "text-[12px] text-sidebar-foreground/80"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 shrink-0 transition duration-200 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden",
                    open && "-rotate-90"
                  )}
                />
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>

        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent className="ps-3 pt-1.5 pe-1 pb-1.5 mt-0.5 ms-1 rounded-lg bg-sidebar-accent/15 border border-sidebar-border/60 w-[calc(100%-0.5rem)]">
            <SidebarNav items={item.subItems!} keyPrefix={keyPrefix} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};

export default CollapsibleSubItem;