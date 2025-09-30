import { Link, useLocation } from "react-router-dom";
import { Home, Search, History, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const navItems = [
  { icon: Home, label: "Home", path: ROUTES.HOME },
  { icon: Search, label: "Search", path: ROUTES.SEARCH },
  { icon: History, label: "History", path: ROUTES.HISTORY },
  { icon: BookOpen, label: "Learn", path: ROUTES.EDUCATION },
  { icon: User, label: "Profile", path: ROUTES.PROFILE },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="container flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-touch min-h-[60px] justify-center",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
