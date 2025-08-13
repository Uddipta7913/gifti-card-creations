import { useState } from "react";
import { CreditCard, Heart, Clock, BarChart3, LogOut, Gift } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "All Cards", tab: "all", icon: CreditCard },
  { title: "Expiring Soon", tab: "expiring", icon: Clock },
  { title: "Favorite Brands", tab: "favorites", icon: Heart },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const location = useLocation();
  const collapsed = state === "collapsed";
  
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const isActive = (tab: string) => {
    if (location.pathname === "/" && tab === activeTab) return true;
    return false;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-card border-border`}
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-hero-gradient">
              <Gift className="h-6 w-6 text-background" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                  GiftiGo
                </h1>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Cards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton asChild isActive={isActive(item.tab)}>
                    <button
                      onClick={() => onTabChange(item.tab)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isActive(item.tab)
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/analytics"}>
                  <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`
                    }
                  >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span>Analytics</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}