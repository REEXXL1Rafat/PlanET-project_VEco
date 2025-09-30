import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const categories = [
  "Food & Beverages",
  "Clothing & Apparel",
  "Electronics",
  "Home & Garden",
  "Personal Care",
  "Household",
];

const certifications = [
  "Fair Trade",
  "USDA Organic",
  "Energy Star",
  "B Corp",
  "Carbon Neutral",
];

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: "1",
    barcode: "123456789",
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
    certifications: ["Fair Trade", "B Corp"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    barcode: "987654321",
    name: "Reusable Water Bottle",
    brand: "HydroGreen",
    category: "Household",
    image_url: "/placeholder.svg",
    eco_score: {
      overall: 92,
      carbon_emissions: 90,
      recyclability: 95,
      ethical_sourcing: 90,
      energy_consumption: 93,
      last_updated: new Date().toISOString(),
      data_sources: [{ name: "GRI" }, { name: "Energy Star" }],
    },
    company_id: "c2",
    certifications: ["Carbon Neutral", "B Corp"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Organic coffee",
    "Bamboo toothbrush",
    "Solar charger",
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [ecoScoreRange, setEcoScoreRange] = useState([0, 100]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== search));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCertifications([]);
    setEcoScoreRange([0, 100]);
    setPriceRange([0, 100]);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedCertifications.length +
    (ecoScoreRange[0] !== 0 || ecoScoreRange[1] !== 100 ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 100 ? 1 : 0);

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(searchQuery);
                  }
                }}
                className="pl-10 h-12"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 relative">
                  <Filter className="h-5 w-5" />
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  {/* Eco Score Range */}
                  <div className="space-y-3">
                    <Label>Eco Score Range: {ecoScoreRange[0]} - {ecoScoreRange[1]}</Label>
                    <Slider
                      value={ecoScoreRange}
                      onValueChange={setEcoScoreRange}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Categories */}
                  <div className="space-y-3">
                    <Label>Categories</Label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label
                            htmlFor={category}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <Label>Certifications</Label>
                    <div className="space-y-2">
                      {certifications.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={selectedCertifications.includes(cert)}
                            onCheckedChange={() => toggleCertification(cert)}
                          />
                          <label
                            htmlFor={cert}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {cert}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="secondary"
                    className="cursor-pointer group pl-3 pr-2 py-1.5"
                  >
                    <span onClick={() => setSearchQuery(search)}>{search}</span>
                    <X
                      className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRecentSearch(search)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="default">
                {cat}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleCategory(cat)}
                />
              </Badge>
            ))}
            {selectedCertifications.map((cert) => (
              <Badge key={cert} variant="default">
                {cert}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleCertification(cert)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Products"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {mockProducts.length} products
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
