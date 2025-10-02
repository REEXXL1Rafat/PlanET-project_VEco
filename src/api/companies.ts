import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types";

export const companyApi = {
  // Get all companies
  async getAll(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get company by ID
  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Get company with products
  async getWithProducts(id: string) {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyError) throw companyError;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        eco_scores (*)
      `)
      .eq('company_id', id);

    if (productsError) throw productsError;

    return {
      ...company,
      products: products || []
    };
  },

  // Create a new company
  async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a company
  async update(id: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a company
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
