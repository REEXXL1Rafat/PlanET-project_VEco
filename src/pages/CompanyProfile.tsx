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
  Award,
  TrendingUp,
  Building,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock company data
const mockCompany = {
  id: "c1",
  name: "EcoWear Inc.",
  logo: "/placeholder.svg",
  description:
    "EcoWear is a leading sustainable fashion brand committed to ethical sourcing and carbon-neutral manufacturing. Founded in 2010, we've been pioneering eco-friendly clothing solutions.",
  sustainabilityRating: 85,
  website: "https://ecowear.com",
  founded: "2010",
  headquarters: "San Francisco, CA",
  certifications: ["Fair Trade", "B Corp", "Carbon Neutral", "GOTS"],
  initiatives: [
    {
      title: "Carbon Neutral by 2025",
      description: "Committed to achieving complete carbon neutrality across all operations",
      status: "In Progress",
    },
    {
      title: "Ocean Plastic Recovery",
      description: "Partnership with Ocean Cleanup to recover plastic from oceans",
      status: "Active",
    },
    {
      title: "Fair Trade Certification",
      description: "100% of cotton sourced from Fair Trade certified farms",
      status: "Achieved",
    },
  ],
  products: [
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
      id: "3",
      barcode: "456789123",
      name: "Recycled Polyester Jacket",
      brand: "EcoWear",
      category: "Clothing",
      image_url: "/placeholder.svg",
      eco_score: {
        overall: 88,
        carbon_emissions: 85,
        recyclability: 95,
        ethical_sourcing: 85,
        energy_consumption: 85,
        last_updated: new Date().toISOString(),
        data_sources: [{ name: "CDP" }, { name: "GRI" }],
      },
      company_id: "c1",
      certifications: ["Fair Trade", "B Corp"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Product[],
  competitors: [
    { name: "GreenThread", rating: 78 },
    { name: "EarthStyle", rating: 82 },
    { name: "NatureWear", rating: 76 },
  ],
};

export default function CompanyProfile() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Back Button */}
        <Link to={ROUTES.HOME}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Company Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{mockCompany.name}</h1>
                    <p className="text-muted-foreground mt-1">
                      {mockCompany.headquarters} • Founded {mockCompany.founded}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={mockCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground">{mockCompany.description}</p>

                <div className="flex flex-wrap gap-2">
                  {mockCompany.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Sustainability Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <EcoScoreDisplay
              score={mockCompany.sustainabilityRating}
              size="lg"
              showLabel
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Product Portfolio</h2>
              <p className="text-sm text-muted-foreground">
                {mockCompany.products.length} products
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCompany.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          {/* Initiatives Tab */}
          <TabsContent value="initiatives" className="space-y-4">
            <h2 className="text-xl font-semibold">Sustainability Initiatives</h2>
            <div className="space-y-4">
              {mockCompany.initiatives.map((initiative, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{initiative.title}</h3>
                          <Badge
                            variant={
                              initiative.status === "Achieved"
                                ? "default"
                                : initiative.status === "Active"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {initiative.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {initiative.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <h2 className="text-xl font-semibold">Compare with Competitors</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary">
                    <div className="flex items-center gap-4">
                      <Building className="h-10 w-10 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{mockCompany.name}</h3>
                        <p className="text-sm text-muted-foreground">Current Company</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {mockCompany.sustainabilityRating}
                      </div>
                      <p className="text-xs text-muted-foreground">Eco Rating</p>
                    </div>
                  </div>

                  {mockCompany.competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Building className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{competitor.name}</h3>
                          <p className="text-sm text-muted-foreground">Competitor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{competitor.rating}</div>
                        <p className="text-xs text-muted-foreground">Eco Rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
