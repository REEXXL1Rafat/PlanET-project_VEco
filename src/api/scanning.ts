import { supabase } from "@/integrations/supabase/client";
import { ScanHistory } from "@/types";

export const scanningApi = {
  // Get user's scan history
  async getHistory(userId: string, limit = 50): Promise<ScanHistory[]> {
    const { data, error } = await supabase
      .from('scan_history')
      .select(`
        *,
        products (
          *,
          eco_scores (*),
          companies (*)
        )
      `)
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      scanned_at: item.scanned_at,
      product: item.products ? {
        ...item.products,
        eco_score: item.products.eco_scores?.[0] || {
          overall: 0,
          carbon_emissions: 0,
          recyclability: 0,
          ethical_sourcing: 0,
          energy_consumption: 0,
          last_updated: new Date().toISOString(),
          data_sources: []
        }
      } : undefined
    }));
  },

  // Add scan to history
  async addScan(userId: string, productId: string): Promise<ScanHistory> {
    const { data, error } = await supabase
      .from('scan_history')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete scan from history
  async deleteScan(scanId: string): Promise<void> {
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('id', scanId);

    if (error) throw error;
  },

  // Clear all scan history for user
  async clearHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get scan statistics
  async getStatistics(userId: string) {
    const { data, error } = await supabase
      .from('scan_history')
      .select(`
        id,
        products (
          eco_scores (overall)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const totalScans = data?.length || 0;
    const scores = data
      ?.map(item => item.products?.eco_scores?.[0]?.overall)
      .filter((score): score is number => score !== undefined) || [];

    const avgEcoScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      totalScans,
      avgEcoScore
    };
  }
};
