import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { EcoScoreDisplay } from "@/components/EcoScoreDisplay";
import { Product } from "@/types";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ExternalLink,
  Heart,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock original product
const originalProduct: Product = {
  id: "original-1",
  barcode: "123456789",
  name: "Standard Cotton T-Shirt",
  brand: "FastFashion Co.",
  category: "Clothing",
  image_url: "/placeholder.svg",
  eco_score: {
    overall: 45,
    carbon_emissions: 40,
    recyclability: 50,
    ethical_sourcing: 30,
    energy_consumption: 60,
    last_updated: new Date().toISOString(),
    data_sources: [{ name: "Basic Data" }],
  },
  company_id: "c-original",
  certifications: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock alternative products
const alternatives: Array<
  Product & {
    reason: string;
    priceDifference: number;
    availability: string;
    retailerUrl?: string;
  }
> = [
  {
    id: "alt-1",
    barcode: "987654321",
    name: "Organic Cotton T-Shirt",
    brand: "EcoWear",
    category: "Clothing",
    image_url: "/placeholder.svg",
    eco_score: {
      overall: 85,
      carbon_emissions: 80,
      recyclability: 90,
      ethical_sourcing: 85,
      energy_consumption: 80,
      last_updated: new Date().toISOString(),
      data_sources: [{ name: "CDP" }, { name: "Fair Trade" }],
    },
    company_id: "c1",
    certifications: ["Fair Trade", "GOTS", "B Corp"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reason:
      "Made from 100% organic cotton with ethical labor practices. Carbon footprint 60% lower than conventional cotton.",
    priceDifference: 5,
    availability: "In Stock",
    retailerUrl: "https://ecowear.com",
  },
  {
    id: "alt-2",
    barcode: "456789123",
    name: "Recycled Polyester T-Shirt",
    brand: "GreenThreads",
    category: "Clothing",
    image_url: "/placeholder.svg",
    eco_score: {
      overall: 78,
      carbon_emissions: 75,
      recyclability: 85,
      ethical_sourcing: 70,
      energy_consumption: 80,
      last_updated: new Date().toISOString(),
      data_sources: [{ name: "GRI" }],
    },
    company_id: "c2",
    certifications: ["GRS", "Oeko-Tex"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reason:
      "Made from recycled plastic bottles, reducing waste. Uses 50% less water in production.",
    priceDifference: 3,
    availability: "In Stock",
    retailerUrl: "https://greenthreads.com",
  },
  {
    id: "alt-3",
    barcode: "789123456",
    name: "Hemp Blend T-Shirt",
    brand: "NatureFiber",
    category: "Clothing",
    image_url: "/placeholder.svg",
    eco_score: {
      overall: 82,
      carbon_emissions: 85,
      recyclability: 80,
      ethical_sourcing: 80,
      energy_consumption: 83,
      last_updated: new Date().toISOString(),
      data_sources: [{ name: "CDP" }],
    },
    company_id: "c3",
    certifications: ["Organic", "Carbon Neutral"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reason:
      "Hemp requires minimal water and no pesticides. Biodegradable and highly durable.",
    priceDifference: 8,
    availability: "Limited Stock",
  },
];

export default function Alternatives() {
  const { productId } = useParams();
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [sortBy, setSortBy] = useState("eco-score");
  const [savedAlternatives, setSavedAlternatives] = useState<string[]>([]);

  const toggleSave = (productId: string) => {
    setSavedAlternatives((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const scoreDifference = (alternative: Product) =>
    alternative.eco_score.overall - originalProduct.eco_score.overall;

  const sortedAlternatives = [...alternatives].sort((a, b) => {
    if (sortBy === "eco-score") {
      return b.eco_score.overall - a.eco_score.overall;
    } else if (sortBy === "price-low") {
      return a.priceDifference - b.priceDifference;
    } else if (sortBy === "price-high") {
      return b.priceDifference - a.priceDifference;
    }
    return 0;
  });

  const filteredAlternatives = sortedAlternatives.filter(
    (alt) => alt.priceDifference <= priceRange[1]
  );

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Back Button */}
        <Link to={ROUTES.PRODUCT_BY_ID(productId || "1")}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Better Alternatives</h1>
          <p className="text-muted-foreground mt-1">
            Find more sustainable options for this product
          </p>
        </div>

        {/* Original Product Summary */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Product
              <Badge variant="outline">Original</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 bg-muted rounded-lg h-32 flex items-center justify-center">
                <img
                  src={originalProduct.image_url}
                  alt={originalProduct.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{originalProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {originalProduct.brand}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <EcoScoreDisplay score={originalProduct.eco_score.overall} />
                  {originalProduct.certifications?.length === 0 && (
                    <Badge variant="secondary">No Certifications</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Price Range: $0 - ${priceRange[1]} more</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eco-score">Highest Eco Score</SelectItem>
                  <SelectItem value="price-low">Lowest Price Difference</SelectItem>
                  <SelectItem value="price-high">Highest Price Difference</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Alternatives List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredAlternatives.length} Alternative
              {filteredAlternatives.length !== 1 ? "s" : ""} Found
            </h2>
          </div>

          {filteredAlternatives.map((alternative) => (
            <Card key={alternative.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image */}
                  <div className="lg:w-1/4 bg-muted rounded-lg h-48 lg:h-auto flex items-center justify-center">
                    <img
                      src={alternative.image_url}
                      alt={alternative.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{alternative.name}</h3>
                        <p className="text-muted-foreground">{alternative.brand}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(alternative.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            savedAlternatives.includes(alternative.id)
                              ? "fill-primary text-primary"
                              : ""
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Why This Alternative */}
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-1">Why this alternative?</h4>
                          <p className="text-sm text-muted-foreground">
                            {alternative.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Eco Score Comparison */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <EcoScoreDisplay score={alternative.eco_score.overall} />
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-semibold">
                            +{scoreDifference(alternative)} points
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">
                          ${alternative.priceDifference} more
                        </span>
                      </div>

                      <Badge
                        variant={
                          alternative.availability === "In Stock"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alternative.availability}
                      </Badge>
                    </div>

                    {/* Certifications */}
                    {alternative.certifications && alternative.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {alternative.certifications.map((cert) => (
                          <Badge key={cert} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild>
                        <Link to={ROUTES.PRODUCT_BY_ID(alternative.id)}>
                          View Details
                        </Link>
                      </Button>
                      {alternative.retailerUrl && (
                        <Button variant="outline" asChild>
                          <a
                            href={alternative.retailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy Now
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAlternatives.length === 0 && (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">No alternatives found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your price range filter
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
