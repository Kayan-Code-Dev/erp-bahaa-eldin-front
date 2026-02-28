import { useGeneralStore } from "@/state-stores/general-state-store";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import appLogo from "@/assets/app-logo.svg";
import useSidebarLabel, { useSidebarPermissions } from "./useSidebarLabel";

function MobileSidebar() {
  const location = useLocation();
  const { pathname } = location;
  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  const currentPageIndex = filteredLabels.findIndex(
    (item) => item.path === pathname
  );

  useEffect(() => {
    useGeneralStore.setState({ currentPage: currentPageIndex });
  }, [pathname, currentPageIndex]);

  return (
    <div className="p-4 h-full bg-white">
      <div className="flex justify-center items-center p-4">
        <img src={appLogo} alt="App Logo" className="w-32" />
      </div>
      <div className="flex flex-col gap-4">
        {filteredLabels.map((item) => (
          <SidebarItem
            key={item.path + item.label}
            icon={item.icon}
            iconComponent={item.iconComponent}
            label={item.label}
            path={item.path}
            level={item.level}
            subItems={item.subItems}
          />
        ))}
      </div>
    </div>
  );
}

export default MobileSidebar;
