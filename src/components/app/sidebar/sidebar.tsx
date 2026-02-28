import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import appLogo from "@/assets/app-logo.svg";
import useSidebarLabel, { useSidebarPermissions } from "./useSidebarLabel";

function Sidebar() {
  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  return (
    <div className="hidden md:block w-64 bg-white border-l min-h-[calc(100vh-64px)]">
      <div className="flex justify-center items-center p-4">
        <img src={appLogo} alt="App Logo" className="w-32" />
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {filteredLabels.map((item) => (
            <SidebarItem
              key={item.path + item.label}
              icon={item.icon}
              iconComponent={item.iconComponent}
              label={item.label}
              path={item.path}
              subItems={item.subItems}
              level={item.level}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
