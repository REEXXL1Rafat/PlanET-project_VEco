-- Create companies table first (no dependencies)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  sustainability_rating INTEGER CHECK (sustainability_rating >= 0 AND sustainability_rating <= 100),
  certifications TEXT[],
  initiatives TEXT[],
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create products table (depends on companies)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  description TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create eco_scores table (depends on products)
CREATE TABLE public.eco_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  overall INTEGER CHECK (overall >= 0 AND overall <= 100) NOT NULL,
  carbon_emissions INTEGER CHECK (carbon_emissions >= 0 AND carbon_emissions <= 100) NOT NULL,
  recyclability INTEGER CHECK (recyclability >= 0 AND recyclability <= 100) NOT NULL,
  ethical_sourcing INTEGER CHECK (ethical_sourcing >= 0 AND ethical_sourcing <= 100) NOT NULL,
  energy_consumption INTEGER CHECK (energy_consumption >= 0 AND energy_consumption <= 100) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(product_id)
);

-- Create data_sources table (depends on eco_scores)
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eco_score_id UUID REFERENCES public.eco_scores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  reliability_score INTEGER CHECK (reliability_score >= 0 AND reliability_score <= 100)
);

-- Create scan_history table (depends on profiles and products)
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_favorites table (depends on profiles and products)
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Create enums for community_reports
CREATE TYPE public.report_type AS ENUM ('incorrect_data', 'greenwashing', 'missing_data');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- Create community_reports table (depends on profiles, products, companies)
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  report_type public.report_type NOT NULL,
  description TEXT NOT NULL,
  status public.report_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create alternatives table (depends on products)
CREATE TABLE public.alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  alternative_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  price_comparison DECIMAL,
  availability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(original_product_id, alternative_product_id)
);

-- Create educational_content table (no dependencies)
CREATE TABLE public.educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  reading_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (public read, authenticated write)
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Companies can be inserted by authenticated users" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Companies can be updated by authenticated users" ON public.companies FOR UPDATE TO authenticated USING (true);

-- RLS Policies for products (public read, authenticated write)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products can be inserted by authenticated users" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Products can be updated by authenticated users" ON public.products FOR UPDATE TO authenticated USING (true);

-- RLS Policies for eco_scores (public read, authenticated write)
CREATE POLICY "Eco scores are viewable by everyone" ON public.eco_scores FOR SELECT USING (true);
CREATE POLICY "Eco scores can be inserted by authenticated users" ON public.eco_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Eco scores can be updated by authenticated users" ON public.eco_scores FOR UPDATE TO authenticated USING (true);

-- RLS Policies for data_sources (public read, authenticated write)
CREATE POLICY "Data sources are viewable by everyone" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Data sources can be inserted by authenticated users" ON public.data_sources FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for scan_history (user-specific)
CREATE POLICY "Users can view their own scan history" ON public.scan_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scan history" ON public.scan_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scan history" ON public.scan_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_favorites (user-specific)
CREATE POLICY "Users can view their own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_reports (user can view own, insert own, update own pending)
CREATE POLICY "Users can view their own reports" ON public.community_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending reports" ON public.community_reports FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for alternatives (public read, authenticated write)
CREATE POLICY "Alternatives are viewable by everyone" ON public.alternatives FOR SELECT USING (true);
CREATE POLICY "Alternatives can be inserted by authenticated users" ON public.alternatives FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for educational_content (public read, authenticated write)
CREATE POLICY "Educational content is viewable by everyone" ON public.educational_content FOR SELECT USING (true);
CREATE POLICY "Educational content can be inserted by authenticated users" ON public.educational_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Educational content can be updated by authenticated users" ON public.educational_content FOR UPDATE TO authenticated USING (true);

-- Create indexes for performance
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_eco_scores_product_id ON public.eco_scores(product_id);
CREATE INDEX idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX idx_scan_history_product_id ON public.scan_history(product_id);
CREATE INDEX idx_scan_history_scanned_at ON public.scan_history(scanned_at DESC);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON public.user_favorites(product_id);
CREATE INDEX idx_community_reports_user_id ON public.community_reports(user_id);
CREATE INDEX idx_community_reports_status ON public.community_reports(status);
CREATE INDEX idx_alternatives_original_product_id ON public.alternatives(original_product_id);
CREATE INDEX idx_educational_content_category ON public.educational_content(category);

-- Create triggers for updated_at columns
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON public.educational_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();