import { Link, useLocation } from "react-router-dom";
import { Home, Search, Scan, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  const location = useLocation();

  const NavItem = ({ icon: Icon, path, label }: { icon: any, path: string, label: string }) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} className="flex-1 flex flex-col items-center justify-center gap-1 group">
        <div className={cn(
          "p-2 rounded-xl transition-all duration-300",
          isActive ? "text-primary bg-primary/10 translate-y-[-2px]" : "text-muted-foreground hover:text-primary/70"
        )}>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={cn(
          "text-[10px] font-medium transition-all", 
          isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto"
        )}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col max-w-md mx-auto shadow-2xl min-h-[100dvh] relative overflow-hidden border-x border-gray-100">
      
      <main className={cn("flex-1 overflow-y-auto scrollbar-hide w-full", showBottomNav && "pb-28")}>
        {children}
      </main>

      {showBottomNav && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 max-w-md mx-auto pointer-events-none">
          <nav className="glass-panel rounded-3xl p-2 flex items-center justify-between shadow-xl pointer-events-auto">
            
            <NavItem icon={Home} path={ROUTES.HOME} label="Home" />
            <NavItem icon={Search} path={ROUTES.SEARCH} label="Explore" />
            
            <div className="-mt-12 mx-2">
              <Link to={ROUTES.SCAN}>
                <div className="bg-gradient-to-br from-primary to-primary-glow p-4 rounded-full shadow-glow transform transition-transform hover:scale-110 active:scale-95 border-[6px] border-white/50 backdrop-blur-sm group cursor-pointer">
                  <Scan className="text-white h-8 w-8 group-hover:animate-pulse" />
                </div>
              </Link>
            </div>

            <NavItem icon={BookOpen} path={ROUTES.EDUCATION} label="Learn" />
            <NavItem icon={User} path={ROUTES.PROFILE} label="Profile" />
          </nav>
        </div>
      )}
    </div>
  );
};
