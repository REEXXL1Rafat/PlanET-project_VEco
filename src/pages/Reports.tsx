import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { communityApi } from "@/api/community";
import { CommunityReport } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function Reports() {
  const { user } = useAuth();
  const { canModerate, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'resolved'>('pending');

  useEffect(() => {
    if (!roleLoading && !canModerate) {
      toast.error("You don't have permission to access this page");
      navigate(ROUTES.HOME);
    }
  }, [canModerate, roleLoading, navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !canModerate) return;

      setLoading(true);
      try {
        const data = await communityApi.getAllReports(activeTab);
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user, canModerate, activeTab]);

  const handleUpdateStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      await communityApi.updateReportStatus(reportId, status);
      toast.success(`Report marked as ${status}`);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await communityApi.deleteReport(reportId);
      toast.success("Report deleted");
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'greenwashing': return 'destructive';
      case 'incorrect_data': return 'default';
      case 'missing_data': return 'secondary';
      default: return 'default';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'greenwashing': return 'Greenwashing';
      case 'incorrect_data': return 'Incorrect Data';
      case 'missing_data': return 'Missing Data';
      default: return type;
    }
  };

  if (roleLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!canModerate) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
          <p className="text-muted-foreground">
            Review and manage community-reported issues
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Reviewed
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {reports.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No {activeTab} reports found.
                </AlertDescription>
              </Alert>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getReportTypeColor(report.report_type)}>
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                          <Badge variant="outline">
                            {report.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {report.products?.name || report.companies?.name || 'Unknown'}
                        </CardTitle>
                        <CardDescription>
                          Reported by {report.profiles?.display_name || 'Anonymous'} on{' '}
                          {new Date(report.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{report.description}</p>
                    
                    <div className="flex gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                          >
                            Mark as Reviewed
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(report.id, 'resolved')}
                          >
                            Mark as Resolved
                          </Button>
                        </>
                      )}
                      {report.status === 'reviewed' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
