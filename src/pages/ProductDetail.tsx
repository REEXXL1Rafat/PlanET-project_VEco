import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EcoScoreDisplay } from "@/components/EcoScoreDisplay";
import { ImpactChart } from "@/components/ImpactChart";
import { ShareButton } from "@/components/ShareButton";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  ArrowLeft, Heart, Package, Building2, Calendar 
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`*, eco_scores(*), companies(*)`)
          .eq('id', id)
          .maybeSingle();

        if (error || !data) throw error;
        setProduct(data);
      } catch (error) {
        toast({ title: "Error", description: "Product not found", variant: "destructive" });
        navigate(ROUTES.HOME);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (isLoading) return <Layout><div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg"/></div></Layout>;
  if (!product) return null;

  const ecoScore = product.eco_scores?.[0];

  return (
    <Layout>
      <div className="pb-24 bg-gray-50 min-h-screen">
        
        <div className="relative h-[45vh] w-full overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-300" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center safe-area-top z-10">
            <Button variant="secondary" size="icon" onClick={() => navigate(-1)} className="rounded-full glass-panel h-10 w-10 bg-white/20 hover:bg-white/30 text-white border-none">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <ShareButton title={product.name} text="Check this eco-score!" />
              <Button variant="secondary" size="icon" onClick={() => setIsFavorite(!isFavorite)} className="rounded-full glass-panel h-10 w-10 bg-white/20 hover:bg-white/30 text-white border-none">
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="absolute -bottom-12 left-4 right-4 z-20">
            <Card className="border-none shadow-float bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{product.category || 'General'}</Badge>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 truncate">{product.name}</h1>
                  <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
                </div>
                <div className="flex-shrink-0">
                  <EcoScoreDisplay score={ecoScore?.overall || 0} size="md" showLabel={false} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 px-4 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">Product Overview</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || "No description available."}
            </p>
            {product.certifications?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.certifications.map((cert: string) => (
                  <Badge key={cert} variant="outline" className="border-green-200 text-green-700 bg-green-50">{cert}</Badge>
                ))}
              </div>
            )}
          </div>

          {ecoScore && (
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg">Sustainability Impact</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <ImpactChart
                  carbonEmissions={ecoScore.carbon_emissions}
                  recyclability={ecoScore.recyclability}
                  ethicalSourcing={ecoScore.ethical_sourcing}
                  energyConsumption={ecoScore.energy_consumption}
                />
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900">AI Analysis</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Data verified on {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 pb-6">
            <Button 
              onClick={() => navigate(ROUTES.ALTERNATIVES_BY_ID(product.id))} 
              className="w-full h-14 text-lg rounded-2xl shadow-glow bg-primary hover:bg-primary/90"
            >
              View Eco-Friendly Alternatives
            </Button>
            
            {product.company_id && (
              <Button 
                variant="outline" 
                onClick={() => navigate(ROUTES.COMPANY_BY_ID(product.company_id))}
                className="w-full h-14 text-lg rounded-2xl border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <Building2 className="mr-2 h-5 w-5" /> Company Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
