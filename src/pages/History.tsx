import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Trash2, TrendingUp, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type HistoryItem = Product & { scannedAt: string };

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: scanHistory, error } = await supabase
        .from('scan_history')
        .select(`
          scanned_at,
          products (
            id,
            name,
            brand,
            category,
            image_url,
            barcode,
            description,
            company_id,
            certifications,
            created_at,
            updated_at,
            eco_scores (
              overall,
              carbon_emissions,
              recyclability,
              ethical_sourcing,
              energy_consumption,
              last_updated,
              data_sources (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast({
          title: "Error",
          description: "Failed to load scan history",
          variant: "destructive",
        });
        return;
      }

      const historyItems: HistoryItem[] = scanHistory
        .filter(item => item.products)
        .map(item => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const ecoScore = Array.isArray(product.eco_scores) && product.eco_scores.length > 0 
            ? product.eco_scores[0] 
            : null;
          
          return {
            ...product,
            scannedAt: item.scanned_at,
            eco_score: ecoScore ? {
              ...ecoScore,
              data_sources: ecoScore.data_sources || []
            } : undefined
          };
        });

      setHistory(historyItems);
    } catch (error) {
      console.error('Error in fetchHistory:', error);
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecoverify-history-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing history:', error);
        toast({
          title: "Error",
          description: "Failed to clear history",
          variant: "destructive",
        });
        return;
      }

      setHistory([]);
      toast({
        title: "History Cleared",
        description: "Your scan history has been cleared",
      });
    } catch (error) {
      console.error('Error in handleClearHistory:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const averageEcoScore = history.length > 0
    ? Math.round(
        history
          .filter(item => item.eco_score)
          .reduce((acc, item) => acc + (item.eco_score?.overall || 0), 0) / 
        history.filter(item => item.eco_score).length
      )
    : 0;

  const topCategory = history.length > 0
    ? history.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const topCategoryName = Object.keys(topCategory).length > 0
    ? Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0][0]
    : 'None';

  const topCategoryCount = topCategory[topCategoryName] || 0;

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
    } else if (sortBy === "score-high") {
      return b.eco_score.overall - a.eco_score.overall;
    } else if (sortBy === "score-low") {
      return a.eco_score.overall - b.eco_score.overall;
    }
    return 0;
  });

  const filteredHistory = sortedHistory.filter((item) => {
    if (filterBy === "all") return true;
    return item.category?.toLowerCase() === filterBy.toLowerCase();
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Scan History</h1>
            <p className="text-muted-foreground mt-1">
              Track your sustainability journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear scan history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    scan history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Products scanned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Eco Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageEcoScore}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your sustainability average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Badge variant="secondary">{topCategoryName}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCategoryCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Most scanned category
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Most Recent</SelectItem>
              <SelectItem value="score-high">Highest Score</SelectItem>
              <SelectItem value="score-low">Lowest Score</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="household">Household</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="food">Food & Beverages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No scan history yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start scanning products to build your sustainability journey and track
                your eco-friendly choices.
              </p>
              <Button>Start Scanning</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-4 top-4 text-xs text-muted-foreground">
                  {formatDate(item.scannedAt)}
                </div>
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
