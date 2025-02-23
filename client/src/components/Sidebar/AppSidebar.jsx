import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, ListChecks, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";

const items = [
  { title: "Overview", url: "", icon: Home },
  { title: "Tasks", url: "/dashboard/tasks", icon: ListChecks },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const AppSidebar = () => {
  const { logOut } = useAuth();

  return (
    <Sidebar className="w-64 bg-white dark:bg-gray-900 border-r">
      {/* Sidebar Header */}
      <SidebarHeader className="text-2xl font-bold text-center text-gray-800 dark:text-white py-4">
        Task Manager
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-3">
        <Button
          onClick={logOut}
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;