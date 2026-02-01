import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import appLogo from "@/assets/app-logo.svg";

function Sidebar() {
  return (
    <div className="hidden md:block w-64 bg-white border-l min-h-[calc(100vh-64px)]">
      <div className="flex justify-center items-center p-4">
        <img src={appLogo} alt="App Logo" className="w-32" />
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {sidebarLabels.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
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
