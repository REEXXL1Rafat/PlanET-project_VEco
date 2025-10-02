import { supabase } from "@/integrations/supabase/client";
import { Product, EcoScore, DataSource } from "@/types";

export interface ProductWithEcoScore extends Product {
  eco_score: EcoScore & { data_sources: DataSource[] };
}

export const productApi = {
  // Get all products with optional filtering
  async getAll(filters?: {
    category?: string;
    minEcoScore?: number;
    search?: string;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        eco_scores (
          *,
          data_sources (*)
        ),
        companies (*)
      `);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to match our Product type
    return (data || []).map(item => ({
      ...item,
      eco_score: item.eco_scores?.[0] ? {
        overall: item.eco_scores[0].overall,
        carbon_emissions: item.eco_scores[0].carbon_emissions,
        recyclability: item.eco_scores[0].recyclability,
        ethical_sourcing: item.eco_scores[0].ethical_sourcing,
        energy_consumption: item.eco_scores[0].energy_consumption,
        last_updated: item.eco_scores[0].last_updated,
        data_sources: item.eco_scores[0].data_sources || []
      } : {
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

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        eco_scores (
          *,
          data_sources (*)
        ),
        companies (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      eco_score: data.eco_scores?.[0] ? {
        overall: data.eco_scores[0].overall,
        carbon_emissions: data.eco_scores[0].carbon_emissions,
        recyclability: data.eco_scores[0].recyclability,
        ethical_sourcing: data.eco_scores[0].ethical_sourcing,
        energy_consumption: data.eco_scores[0].energy_consumption,
        last_updated: data.eco_scores[0].last_updated,
        data_sources: data.eco_scores[0].data_sources || []
      } : {
        overall: 0,
        carbon_emissions: 0,
        recyclability: 0,
        ethical_sourcing: 0,
        energy_consumption: 0,
        last_updated: new Date().toISOString(),
        data_sources: []
      }
    };
  },

  // Get product by barcode
  async getByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        eco_scores (
          *,
          data_sources (*)
        ),
        companies (*)
      `)
      .eq('barcode', barcode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      eco_score: data.eco_scores?.[0] ? {
        overall: data.eco_scores[0].overall,
        carbon_emissions: data.eco_scores[0].carbon_emissions,
        recyclability: data.eco_scores[0].recyclability,
        ethical_sourcing: data.eco_scores[0].ethical_sourcing,
        energy_consumption: data.eco_scores[0].energy_consumption,
        last_updated: data.eco_scores[0].last_updated,
        data_sources: data.eco_scores[0].data_sources || []
      } : {
        overall: 0,
        carbon_emissions: 0,
        recyclability: 0,
        ethical_sourcing: 0,
        energy_consumption: 0,
        last_updated: new Date().toISOString(),
        data_sources: []
      }
    };
  },

  // Create a new product
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        barcode: product.barcode,
        brand: product.brand,
        category: product.category,
        image_url: product.image_url,
        description: product.description,
        company_id: product.company_id,
        certifications: product.certifications
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      eco_score: product.eco_score
    };
  },

  // Update a product
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        eco_scores (
          *,
          data_sources (*)
        )
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      eco_score: data.eco_scores?.[0] || {
        overall: 0,
        carbon_emissions: 0,
        recyclability: 0,
        ethical_sourcing: 0,
        energy_consumption: 0,
        last_updated: new Date().toISOString(),
        data_sources: []
      }
    };
  },

  // Delete a product
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
