import { useGeneralStore } from "@/state-stores/general-state-store";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import appLogo from "@/assets/app-logo.svg";

function MobileSidebar() {
  const location = useLocation();
  const { pathname } = location;
  const currentPageIndex = sidebarLabels.findIndex(
    (item) => item.path === pathname
  );

  useEffect(() => {
    useGeneralStore.setState({ currentPage: currentPageIndex });
  }, [location.pathname]);

  return (
    <div className="p-4 h-full bg-white">
      <div className="flex justify-center items-center p-4">
        <img src={appLogo} alt="App Logo" className="w-32" />
      </div>
      <div className="flex flex-col gap-4">
        {sidebarLabels.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
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
