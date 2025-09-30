import { Link } from "react-router-dom";
import { Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routes";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary font-heading">EcoVerify</span>
        </Link>

        <Link to={ROUTES.PROFILE}>
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
