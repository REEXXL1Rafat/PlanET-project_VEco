-- Add ingredients column to products table for AI analysis
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ingredients text;

-- Add reasoning column to eco_scores table for AI explanations
ALTER TABLE public.eco_scores 
ADD COLUMN IF NOT EXISTS reasoning text;