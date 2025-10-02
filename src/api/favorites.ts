import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export const favoritesApi = {
  // Get user's favorites
  async getFavorites(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        created_at,
        products (
          *,
          eco_scores (
            *,
            data_sources (*)
          ),
          companies (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
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
    }));
  },

  // Check if product is favorited
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Add product to favorites
  async addFavorite(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        product_id: productId
      });

    if (error) throw error;
  },

  // Remove product from favorites
  async removeFavorite(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  // Toggle favorite status
  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    const isFav = await favoritesApi.isFavorite(userId, productId);

    if (isFav) {
      await favoritesApi.removeFavorite(userId, productId);
      return false;
    } else {
      await favoritesApi.addFavorite(userId, productId);
      return true;
    }
  }
};
