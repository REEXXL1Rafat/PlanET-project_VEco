import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Leaf, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const Index = () => {
  return (
    <Layout>
      <div className="container px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to EcoVerify
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make environmentally conscious purchasing decisions with transparent sustainability ratings
          </p>
        </div>

        {/* Quick Scan CTA */}
        <div className="flex justify-center">
          <Link to={ROUTES.SCAN}>
            <Button 
              size="lg" 
              className="h-16 px-8 text-lg gap-3 min-w-touch shadow-lg hover:shadow-xl transition-shadow"
            >
              <Scan className="h-6 w-6" />
              Quick Scan
            </Button>
          </Link>
        </div>

        {/* Search Bar Placeholder */}
        <Card>
          <CardContent className="p-4">
            <Link to={ROUTES.SEARCH}>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground h-12"
              >
                Search for products or companies...
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                <Scan className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Scan Products</h3>
              <p className="text-sm text-muted-foreground">
                Instantly get eco ratings by scanning barcodes
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Help others by reporting greenwashing
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-warning/10">
                <BookOpen className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg">Learn More</h3>
              <p className="text-sm text-muted-foreground">
                Discover sustainable living tips and guides
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Tip */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Sustainability Tip of the Day
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose products with minimal packaging to reduce waste and your carbon footprint.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
