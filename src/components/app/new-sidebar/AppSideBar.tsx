import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import appLogo from "@/assets/app-logo.svg";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels } from "../sidebar/constants";

export function AppSidebar() {
  return (
    <Sidebar side="right" collapsible="none" className="border-l bg-white w-80">
      <SidebarHeader>
        <div className="flex justify-center items-center pb-4">
          <img src={appLogo} alt="App Logo" className="w-30" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* We render our new recursive nav component here */}
        <SidebarNav items={sidebarLabels} />
      </SidebarContent>

      {/* You can add a SidebarFooter here if you need one */}
    </Sidebar>
  );
}
