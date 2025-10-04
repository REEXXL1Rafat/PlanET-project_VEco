import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'moderator' | 'user';

export const rolesApi = {
  // Get current user's roles
  async getUserRoles(userId: string): Promise<AppRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(r => r.role as AppRole) || [];
  },

  // Check if user has specific role
  async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Check if user is admin or moderator
  async canModerate(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes('admin') || roles.includes('moderator');
  }
};
