export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alternatives: {
        Row: {
          alternative_product_id: string
          availability: string | null
          created_at: string
          id: string
          original_product_id: string
          price_comparison: number | null
          reason: string
        }
        Insert: {
          alternative_product_id: string
          availability?: string | null
          created_at?: string
          id?: string
          original_product_id: string
          price_comparison?: number | null
          reason: string
        }
        Update: {
          alternative_product_id?: string
          availability?: string | null
          created_at?: string
          id?: string
          original_product_id?: string
          price_comparison?: number | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "alternatives_alternative_product_id_fkey"
            columns: ["alternative_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alternatives_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          company_id: string | null
          created_at: string
          description: string
          id: string
          product_id: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status: Database["public"]["Enums"]["report_status"]
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          product_id?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          product_id?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          initiatives: string[] | null
          logo_url: string | null
          name: string
          products_count: number | null
          sustainability_rating: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          initiatives?: string[] | null
          logo_url?: string | null
          name: string
          products_count?: number | null
          sustainability_rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          initiatives?: string[] | null
          logo_url?: string | null
          name?: string
          products_count?: number | null
          sustainability_rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          eco_score_id: string
          id: string
          name: string
          reliability_score: number | null
          url: string | null
        }
        Insert: {
          eco_score_id: string
          id?: string
          name: string
          reliability_score?: number | null
          url?: string | null
        }
        Update: {
          eco_score_id?: string
          id?: string
          name?: string
          reliability_score?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_eco_score_id_fkey"
            columns: ["eco_score_id"]
            isOneToOne: false
            referencedRelation: "eco_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_scores: {
        Row: {
          carbon_emissions: number
          energy_consumption: number
          ethical_sourcing: number
          id: string
          last_updated: string
          overall: number
          product_id: string
          recyclability: number
        }
        Insert: {
          carbon_emissions: number
          energy_consumption: number
          ethical_sourcing: number
          id?: string
          last_updated?: string
          overall: number
          product_id: string
          recyclability: number
        }
        Update: {
          carbon_emissions?: number
          energy_consumption?: number
          ethical_sourcing?: number
          id?: string
          last_updated?: string
          overall?: number
          product_id?: string
          recyclability?: number
        }
        Relationships: [
          {
            foreignKeyName: "eco_scores_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      educational_content: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          reading_time: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          reading_time?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          reading_time?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          certifications: string[] | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          certifications?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          certifications?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          id: string
          product_id: string
          scanned_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          scanned_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          scanned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      report_status: "pending" | "reviewed" | "resolved"
      report_type: "incorrect_data" | "greenwashing" | "missing_data"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      report_status: ["pending", "reviewed", "resolved"],
      report_type: ["incorrect_data", "greenwashing", "missing_data"],
    },
  },
} as const
