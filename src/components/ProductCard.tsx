import { Card, CardContent } from "@/components/ui/card";
import { EcoScoreDisplay } from "@/components/EcoScoreDisplay";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  className?: string;
}

export const ProductCard = ({ product, onClick, className }: ProductCardProps) => {
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover-lift border-2 hover:border-primary/30 transition-all duration-300 overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-24 w-24 object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="h-24 w-24 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center group-hover:from-primary/10 group-hover:to-accent/10 transition-all">
                <Package className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {product.brand && (
              <p className="text-sm text-muted-foreground truncate font-medium">
                {product.brand}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              {product.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {product.category}
                </Badge>
              )}
              
              {product.certifications && product.certifications.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium border-success/30 text-success"
                >
                  {product.certifications.length} Cert{product.certifications.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Eco Score */}
          <div className="flex-shrink-0 self-center">
            <EcoScoreDisplay 
              score={product.eco_score?.overall || 0} 
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
