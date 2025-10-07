import { Link } from "react-router-dom";
import { Leaf, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text font-heading">EcoVerify</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to={ROUTES.PROFILE}>
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-110 hover:shadow-glow">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to={ROUTES.LOGIN}>
              <Button 
                variant="outline" 
                size="sm"
                className="hover-lift border-primary/20 hover:border-primary/40"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
