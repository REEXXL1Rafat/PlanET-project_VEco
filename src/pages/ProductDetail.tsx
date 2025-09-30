import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EcoScoreDisplay } from "@/components/EcoScoreDisplay";
import { ImpactChart } from "@/components/ImpactChart";
import { ShareButton } from "@/components/ShareButton";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart, 
  Flag, 
  Package, 
  Building2,
  ExternalLink,
  Calendar
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock product data - will be replaced with actual API call
const getMockProduct = (id: string) => ({
  id,
  name: "Eco-Friendly Water Bottle",
  brand: "GreenLife",
  category: "Kitchen & Dining",
  barcode: id.replace('mock-', ''),
  image_url: null,
  description: "A sustainable water bottle made from recycled materials with minimal environmental impact.",
  eco_score: {
    overall: 85,
    carbon_emissions: 88,
    recyclability: 95,
    ethical_sourcing: 82,
    energy_consumption: 75,
    last_updated: new Date().toISOString(),
    data_sources: [
      { name: "CDP", url: "https://cdp.net", reliability_score: 95 },
      { name: "B Corp", url: "https://bcorporation.net", reliability_score: 90 },
    ],
  },
  company_id: "greenlife-123",
  certifications: ["B Corp Certified", "Carbon Neutral", "Fair Trade"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [reportDescription, setReportDescription] = useState("");

  if (!id) {
    navigate(ROUTES.HOME);
    return null;
  }

  const product = getMockProduct(id);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? "Product removed from your favorites." 
        : "Product saved to your favorites.",
    });
  };

  const handleReport = () => {
    if (!reportType || !reportDescription.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please select a report type and provide details.",
        variant: "destructive",
      });
      return;
    }

    // Submit report logic here
    setReportDialogOpen(false);
    setReportType("");
    setReportDescription("");
    
    toast({
      title: "Report submitted",
      description: "Thank you for helping improve our data accuracy!",
    });
  };

  const handleViewAlternatives = () => {
    navigate(ROUTES.ALTERNATIVES_BY_ID(product.id));
  };

  const handleViewCompany = () => {
    if (product.company_id) {
      navigate(ROUTES.COMPANY_BY_ID(product.company_id));
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <ShareButton
              title={product.name}
              text={`Check out the eco-score for ${product.name} on EcoVerify!`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-destructive" : ""}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Product Image & Basic Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                  <p className="text-lg text-muted-foreground">{product.brand}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.barcode && (
                      <Badge variant="outline">Barcode: {product.barcode}</Badge>
                    )}
                  </div>
                </div>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}

                {product.certifications && product.certifications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {product.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="bg-success/10 text-success">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eco Score */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <EcoScoreDisplay score={product.eco_score.overall} size="lg" />
              <p className="text-sm text-center text-muted-foreground max-w-md">
                This score represents the overall environmental impact based on multiple factors
                including carbon emissions, recyclability, ethical sourcing, and energy consumption.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impact Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ImpactChart
              carbonEmissions={product.eco_score.carbon_emissions}
              recyclability={product.eco_score.recyclability}
              ethicalSourcing={product.eco_score.ethical_sourcing}
              energyConsumption={product.eco_score.energy_consumption}
            />
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.eco_score.data_sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{source.name}</p>
                  {source.reliability_score && (
                    <p className="text-xs text-muted-foreground">
                      Reliability: {source.reliability_score}%
                    </p>
                  )}
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Visit
                  </a>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Calendar className="h-3 w-3" />
              <span>
                Last updated: {new Date(product.eco_score.last_updated).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleViewAlternatives} className="w-full" size="lg">
            View Sustainable Alternatives
          </Button>
          
          {product.company_id && (
            <Button
              variant="outline"
              onClick={handleViewCompany}
              className="w-full gap-2"
              size="lg"
            >
              <Building2 className="h-4 w-4" />
              View Company Profile
            </Button>
          )}

          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2" size="lg">
                <Flag className="h-4 w-4" />
                Report Incorrect Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report an Issue</DialogTitle>
                <DialogDescription>
                  Help us improve data accuracy by reporting issues you find.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Issue Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incorrect_data">Incorrect Data</SelectItem>
                      <SelectItem value="greenwashing">Suspected Greenwashing</SelectItem>
                      <SelectItem value="missing_data">Missing Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about the issue..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={handleReport} className="w-full">
                  Submit Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
