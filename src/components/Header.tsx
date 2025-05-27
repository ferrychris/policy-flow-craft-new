
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SidebarTrigger } from "./ui/sidebar";
import { useTheme } from "next-themes";
// import { UserNav } from "./navigation/user-nav";
// import {UserNav} from "./navigation/user-nav"
import { NavBar } from "./navigation/nav-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className={`border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex h-14 items-center px-4 gap-4">
        <SidebarTrigger className="md:hidden" />
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* <UserNav /> */}
          <NavBar />
        </div>
      </div>
    </header>
  );
}
