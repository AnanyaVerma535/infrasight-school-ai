import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  classification: string;
  infrastructure_type: string;
  confidence_score: number;
  location: string | null;
  created_at: string;
  description: string | null;
  image_url: string;
  user_id: string;
}

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      const { data, error } = await supabase
        .from('infrastructure_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const updateReportClassification = async (reportId: string, newClassification: string) => {
    try {
      const { error } = await supabase
        .from('infrastructure_reports')
        .update({ classification: newClassification })
        .eq('id', reportId);

      if (error) throw error;
      
      toast.success('Report updated successfully');
      fetchAllReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const stats = {
    total: reports.length,
    good: reports.filter(r => r.classification === 'Good').length,
    needsAttention: reports.filter(r => r.classification === 'Average' || r.classification === 'Bad').length,
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Good':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'Average':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'Bad':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Officer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and verify all infrastructure reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                All submitted reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Good Condition
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.good}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 
                  ? `${Math.round((stats.good / stats.total) * 100)}% of total`
                  : 'No reports yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Needs Attention
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 
                  ? `${Math.round((stats.needsAttention / stats.total) * 100)}% of total`
                  : 'No issues found'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* All Reports */}
        <Card>
          <CardHeader>
            <CardTitle>All Infrastructure Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="text-lg font-medium">No reports yet</p>
                  <p className="text-sm text-muted-foreground">
                    Reports will appear here once citizens submit them
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex gap-4 flex-1">
                      <img 
                        src={report.image_url} 
                        alt="Infrastructure" 
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getClassificationColor(report.classification)}>
                            {report.classification}
                          </Badge>
                          <span className="text-sm font-medium capitalize">
                            {report.infrastructure_type}
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {report.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {report.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {report.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {report.confidence_score && (
                        <div className="text-right mb-2">
                          <div className="text-sm font-bold text-primary">
                            {report.confidence_score}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Confidence
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(report.image_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.classification !== 'Good' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateReportClassification(report.id, 'Good')}
                          >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
