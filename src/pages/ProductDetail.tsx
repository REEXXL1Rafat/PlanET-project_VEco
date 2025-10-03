import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EcoScoreDisplay } from "@/components/EcoScoreDisplay";
import { ImpactChart } from "@/components/ImpactChart";
import { ShareButton } from "@/components/ShareButton";
import { CommunityReportDialog } from "@/components/CommunityReportDialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  ArrowLeft, 
  Heart, 
  Package, 
  Building2,
  ExternalLink,
  Calendar,
  AlertCircle
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product, EcoScore } from "@/types";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ecoScoreLoading, setEcoScoreLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate(ROUTES.HOME);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch product with eco score and company data
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            eco_scores(*),
            companies(*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Product Not Found",
            description: "This product doesn't exist in our database.",
            variant: "destructive",
          });
          navigate(ROUTES.HOME);
          return;
        }

        setProduct(data);

        // Check if eco score is still being generated
        if (!data.eco_scores) {
          setEcoScoreLoading(true);
          toast({
            title: "Analyzing Product...",
            description: "We're generating the eco score for this product.",
          });

          // Poll for eco score (check every 3 seconds for up to 30 seconds)
          let attempts = 0;
          const maxAttempts = 10;
          const pollInterval = setInterval(async () => {
            attempts++;
            
            const { data: updatedData } = await supabase
              .from('products')
              .select(`
                *,
                eco_scores(*),
                companies(*)
              `)
              .eq('id', id)
              .maybeSingle();

            if (updatedData?.eco_scores) {
              setProduct(updatedData);
              setEcoScoreLoading(false);
              clearInterval(pollInterval);
              toast({
                title: "Eco Score Ready!",
                description: "Environmental analysis complete.",
              });
            } else if (attempts >= maxAttempts) {
              setEcoScoreLoading(false);
              clearInterval(pollInterval);
            }
          }, 3000);

          // Cleanup interval on unmount
          return () => clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
        navigate(ROUTES.HOME);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? "Product removed from your favorites." 
        : "Product saved to your favorites.",
    });
  };

  const handleViewAlternatives = () => {
    if (product) {
      navigate(ROUTES.ALTERNATIVES_BY_ID(product.id));
    }
  };

  const handleViewCompany = () => {
    if (product?.company_id) {
      navigate(ROUTES.COMPANY_BY_ID(product.company_id));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return null;
  }

  const ecoScore = product.eco_scores;
  const company = product.companies;

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
                  <p className="text-lg text-muted-foreground">{product.brand || 'Unknown Brand'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{product.category || 'General'}</Badge>
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
                      {product.certifications.map((cert: string) => (
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
            {ecoScoreLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Analyzing environmental impact...
                </p>
              </div>
            ) : ecoScore ? (
              <div className="flex flex-col items-center gap-4">
                <EcoScoreDisplay score={ecoScore.overall} size="lg" />
                <p className="text-sm text-center text-muted-foreground max-w-md">
                  This score represents the overall environmental impact based on multiple factors
                  including carbon emissions, recyclability, ethical sourcing, and energy consumption.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Eco score not available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impact Breakdown */}
        {ecoScore && (
          <Card>
            <CardHeader>
              <CardTitle>Impact Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ImpactChart
                carbonEmissions={ecoScore.carbon_emissions}
                recyclability={ecoScore.recyclability}
                ethicalSourcing={ecoScore.ethical_sourcing}
                energyConsumption={ecoScore.energy_consumption}
              />
            </CardContent>
          </Card>
        )}

        {/* Data Sources */}
        {ecoScore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Lovable AI Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Reliability: 85%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Last updated: {new Date(ecoScore.last_updated).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleViewAlternatives} className="w-full" size="lg">
            View Sustainable Alternatives
          </Button>
          
          {company && (
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

          <CommunityReportDialog 
            productId={product.id}
            trigger={
              <Button variant="outline" className="w-full" size="lg">
                Report Incorrect Data
              </Button>
            }
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
