// Core type definitions for EcoVerify

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications_enabled?: boolean;
  language?: string;
}

export interface EcoScore {
  overall: number; // 0-100
  carbon_emissions: number;
  recyclability: number;
  ethical_sourcing: number;
  energy_consumption: number;
  last_updated: string;
  data_sources: DataSource[];
}

export interface DataSource {
  name: string;
  url?: string;
  reliability_score?: number;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  category?: string;
  image_url?: string;
  description?: string;
  eco_score: EcoScore;
  company_id?: string;
  certifications?: string[];
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  sustainability_rating: number; // 0-100
  certifications?: string[];
  initiatives?: string[];
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  scanned_at: string;
}

export interface Alternative {
  id: string;
  original_product_id: string;
  alternative_product_id: string;
  alternative_product?: Product;
  reason: string;
  price_comparison?: number;
  availability?: string;
}

export interface CommunityReport {
  id: string;
  user_id: string;
  product_id?: string;
  company_id?: string;
  report_type: 'incorrect_data' | 'greenwashing' | 'missing_data';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  reading_time?: number;
  created_at: string;
  updated_at: string;
}
