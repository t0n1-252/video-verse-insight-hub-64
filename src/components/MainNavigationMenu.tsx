
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, Youtube, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const MainNavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <NavigationMenu className="max-w-none w-full justify-start px-4">
      <NavigationMenuList className="space-x-2">
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-background text-foreground hover:bg-accent/50",
              location.pathname === "/" && "bg-accent/50"
            )}
            onClick={() => navigate("/")}
          >
            <Youtube className="mr-2 h-4 w-4" />
            YouTube Connect
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-background text-foreground hover:bg-accent/50",
              location.pathname === "/mock-dashboard" && "bg-accent/50"
            )}
            onClick={() => navigate("/mock-dashboard")}
          >
            <Video className="mr-2 h-4 w-4" />
            Dashboard Demo
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigationMenu;
