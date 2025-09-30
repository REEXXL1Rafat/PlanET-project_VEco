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
        "cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ) : (
              <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{product.name}</h3>
            {product.brand && (
              <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
            )}
            {product.category && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {product.category}
              </Badge>
            )}
          </div>

          {/* Eco Score */}
          <div className="flex-shrink-0">
            <EcoScoreDisplay 
              score={product.eco_score.overall} 
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
