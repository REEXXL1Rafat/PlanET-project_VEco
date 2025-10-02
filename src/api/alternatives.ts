import { supabase } from "@/integrations/supabase/client";
import { Alternative } from "@/types";

export const alternativesApi = {
  // Get alternatives for a product
  async getForProduct(productId: string): Promise<Alternative[]> {
    const { data, error } = await supabase
      .from('alternatives')
      .select(`
        *,
        alternative_product:products!alternatives_alternative_product_id_fkey (
          *,
          eco_scores (
            *,
            data_sources (*)
          ),
          companies (*)
        )
      `)
      .eq('original_product_id', productId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      original_product_id: item.original_product_id,
      alternative_product_id: item.alternative_product_id,
      reason: item.reason,
      price_comparison: item.price_comparison,
      availability: item.availability,
      alternative_product: item.alternative_product ? {
        ...item.alternative_product,
        eco_score: item.alternative_product.eco_scores?.[0] || {
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

  // Create an alternative
  async create(alternative: Omit<Alternative, 'id'>): Promise<Alternative> {
    const { data, error } = await supabase
      .from('alternatives')
      .insert({
        original_product_id: alternative.original_product_id,
        alternative_product_id: alternative.alternative_product_id,
        reason: alternative.reason,
        price_comparison: alternative.price_comparison,
        availability: alternative.availability
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete an alternative
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('alternatives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
