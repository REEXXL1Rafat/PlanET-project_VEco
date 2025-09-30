import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const Layout = ({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      
      <main className={cn(
        "flex-1",
        showBottomNav && "pb-20"
      )}>
        {children}
      </main>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
