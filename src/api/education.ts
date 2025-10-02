import { supabase } from "@/integrations/supabase/client";
import { EducationalContent } from "@/types";

export const educationApi = {
  // Get all educational content
  async getAll(category?: string): Promise<EducationalContent[]> {
    let query = supabase
      .from('educational_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get content by ID
  async getById(id: string): Promise<EducationalContent | null> {
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('educational_content')
      .select('category')
      .order('category');

    if (error) throw error;

    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
  },

  // Create educational content
  async create(content: Omit<EducationalContent, 'id' | 'created_at' | 'updated_at'>): Promise<EducationalContent> {
    const { data, error } = await supabase
      .from('educational_content')
      .insert(content)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update educational content
  async update(id: string, updates: Partial<EducationalContent>): Promise<EducationalContent> {
    const { data, error } = await supabase
      .from('educational_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete educational content
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('educational_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
