import { supabase } from "@/integrations/supabase/client";
import { CommunityReport } from "@/types";

export const communityApi = {
  // Get all reports (for admin/moderator use)
  async getAllReports(status?: 'pending' | 'reviewed' | 'resolved'): Promise<CommunityReport[]> {
    let query = supabase
      .from('community_reports')
      .select(`
        *,
        products (name),
        companies (name),
        profiles (display_name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get user's reports
  async getUserReports(userId: string): Promise<CommunityReport[]> {
    const { data, error } = await supabase
      .from('community_reports')
      .select(`
        *,
        products (name),
        companies (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new report
  async createReport(report: {
    user_id: string;
    product_id?: string;
    company_id?: string;
    report_type: 'incorrect_data' | 'greenwashing' | 'missing_data';
    description: string;
  }): Promise<CommunityReport> {
    const { data, error } = await supabase
      .from('community_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update report status
  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved'
  ): Promise<void> {
    const { error } = await supabase
      .from('community_reports')
      .update({ status })
      .eq('id', reportId);

    if (error) throw error;
  },

  // Delete a report
  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('community_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
  }
};
