import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalized product schema
interface NormalizedProduct {
  product_name: string;
  brand: string;
  barcode: string;
  category: string;
  materials: string[];
  packaging: string;
  country_of_origin: string;
  certifications: string[];
  carbon_footprint: string;
  water_usage: string;
  energy_consumption: string;
  recyclability: string;
  eco_score: string;
  source: string;
  confidence_score: number;
  image_url?: string;
  description?: string;
}

// Fetch from Open Food Facts
async function fetchOpenFoodFacts(barcode: string): Promise<Partial<NormalizedProduct> | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    
    const product = data.product;
    return {
      product_name: product.product_name || product.generic_name || '',
      brand: product.brands || '',
      barcode: barcode,
      category: product.categories || '',
      materials: product.ingredients_text ? [product.ingredients_text] : [],
      packaging: product.packaging || '',
      country_of_origin: product.countries || '',
      certifications: product.labels_tags || [],
      carbon_footprint: product.carbon_footprint_from_known_ingredients_debug || '',
      water_usage: '',
      energy_consumption: product.nutrition_score_debug || '',
      recyclability: product.ecoscore_grade || '',
      eco_score: product.ecoscore_score?.toString() || '',
      source: 'Open Food Facts',
      confidence_score: 0.85,
      image_url: product.image_url || product.image_front_url,
      description: product.generic_name || product.product_name
    };
  } catch (error) {
    console.error('Open Food Facts error:', error);
    return null;
  }
}

// Fetch from Open Beauty Facts
async function fetchOpenBeautyFacts(barcode: string): Promise<Partial<NormalizedProduct> | null> {
  try {
    const response = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    
    const product = data.product;
    return {
      product_name: product.product_name || '',
      brand: product.brands || '',
      barcode: barcode,
      category: product.categories || '',
      materials: product.ingredients_text ? [product.ingredients_text] : [],
      packaging: product.packaging || '',
      country_of_origin: product.countries || '',
      certifications: product.labels_tags || [],
      carbon_footprint: '',
      water_usage: '',
      energy_consumption: '',
      recyclability: '',
      eco_score: product.ecoscore_score?.toString() || '',
      source: 'Open Beauty Facts',
      confidence_score: 0.85,
      image_url: product.image_url || product.image_front_url,
      description: product.generic_name || product.product_name
    };
  } catch (error) {
    console.error('Open Beauty Facts error:', error);
    return null;
  }
}

// Fetch from Open Product Data (example implementation)
async function fetchOpenProductData(barcode: string): Promise<Partial<NormalizedProduct> | null> {
  try {
    const response = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=demo`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.products || data.products.length === 0) return null;
    
    const product = data.products[0];
    return {
      product_name: product.title || product.product_name || '',
      brand: product.brand || product.manufacturer || '',
      barcode: barcode,
      category: product.category || '',
      materials: [],
      packaging: '',
      country_of_origin: product.country || '',
      certifications: [],
      carbon_footprint: '',
      water_usage: '',
      energy_consumption: '',
      recyclability: '',
      eco_score: '',
      source: 'Open Product Data',
      confidence_score: 0.70,
      image_url: product.images?.[0],
      description: product.description || ''
    };
  } catch (error) {
    console.error('Open Product Data error:', error);
    return null;
  }
}

// Merge multiple data sources with conflict resolution
function mergeProductData(sources: Partial<NormalizedProduct>[]): NormalizedProduct {
  // Sort by confidence score (higher first) and source priority
  const sourcePriority = {
    'Certifications': 100,
    'Open Food Facts': 85,
    'Open Beauty Facts': 85,
    'Open Product Data': 70,
    'Manufacturer': 90
  };
  
  const sorted = sources.sort((a, b) => {
    const priorityA = sourcePriority[a.source as keyof typeof sourcePriority] || 0;
    const priorityB = sourcePriority[b.source as keyof typeof sourcePriority] || 0;
    return priorityB - priorityA;
  });
  
  // Merge data with priority to higher confidence sources
  const merged: NormalizedProduct = {
    product_name: '',
    brand: '',
    barcode: '',
    category: '',
    materials: [],
    packaging: '',
    country_of_origin: '',
    certifications: [],
    carbon_footprint: '',
    water_usage: '',
    energy_consumption: '',
    recyclability: '',
    eco_score: '',
    source: 'Multi-source',
    confidence_score: 0,
    image_url: '',
    description: ''
  };
  
  // Merge each field with priority
  for (const source of sorted) {
    if (!merged.product_name && source.product_name) merged.product_name = source.product_name;
    if (!merged.brand && source.brand) merged.brand = source.brand;
    if (!merged.barcode && source.barcode) merged.barcode = source.barcode;
    if (!merged.category && source.category) merged.category = source.category;
    if (!merged.packaging && source.packaging) merged.packaging = source.packaging;
    if (!merged.country_of_origin && source.country_of_origin) merged.country_of_origin = source.country_of_origin;
    if (!merged.carbon_footprint && source.carbon_footprint) merged.carbon_footprint = source.carbon_footprint;
    if (!merged.water_usage && source.water_usage) merged.water_usage = source.water_usage;
    if (!merged.energy_consumption && source.energy_consumption) merged.energy_consumption = source.energy_consumption;
    if (!merged.recyclability && source.recyclability) merged.recyclability = source.recyclability;
    if (!merged.eco_score && source.eco_score) merged.eco_score = source.eco_score;
    if (!merged.image_url && source.image_url) merged.image_url = source.image_url;
    if (!merged.description && source.description) merged.description = source.description;
    
    // Merge arrays
    if (source.materials && source.materials.length > 0) {
      merged.materials = [...new Set([...merged.materials, ...source.materials])];
    }
    if (source.certifications && source.certifications.length > 0) {
      merged.certifications = [...new Set([...merged.certifications, ...source.certifications])];
    }
  }
  
  // Calculate overall confidence score
  merged.confidence_score = sorted.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / sorted.length;
  
  return merged;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching product data for barcode: ${barcode} from multiple sources`);

    // Check Supabase cache first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if product already exists in database
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*, eco_scores(*)')
      .eq('barcode', barcode)
      .single();

    if (existingProduct) {
      console.log('Product found in cache');
      return new Response(
        JSON.stringify({ product: existingProduct, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from multiple sources in parallel
    console.log('Fetching from multiple sources...');
    const [openFoodData, openBeautyData, openProductData] = await Promise.all([
      fetchOpenFoodFacts(barcode),
      fetchOpenBeautyFacts(barcode),
      fetchOpenProductData(barcode)
    ]);

    const sources = [openFoodData, openBeautyData, openProductData].filter(Boolean) as Partial<NormalizedProduct>[];

    if (sources.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Product not found in any database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found product in ${sources.length} source(s)`);

    // Merge data from all sources
    const mergedProduct = mergeProductData(sources);

    // Create or get company
    let companyId = null;
    if (mergedProduct.brand) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', mergedProduct.brand)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: mergedProduct.brand,
            sustainability_rating: 50
          })
          .select()
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
        } else {
          companyId = newCompany.id;
        }
      }
    }

    // Insert product into database
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: mergedProduct.product_name,
        barcode: mergedProduct.barcode,
        brand: mergedProduct.brand,
        category: mergedProduct.category,
        image_url: mergedProduct.image_url,
        description: mergedProduct.description,
        company_id: companyId,
        certifications: mergedProduct.certifications
      })
      .select()
      .single();

    if (productError) {
      console.error('Error inserting product:', productError);
      throw productError;
    }

    console.log('Product inserted successfully');

    // Trigger eco-score generation asynchronously
    const generateEcoScoreUrl = `${supabaseUrl}/functions/v1/generate-eco-score`;
    fetch(generateEcoScoreUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: newProduct.id,
        productData: {
          name: mergedProduct.product_name,
          brand: mergedProduct.brand,
          category: mergedProduct.category,
          materials: mergedProduct.materials,
          packaging: mergedProduct.packaging,
          country_of_origin: mergedProduct.country_of_origin,
          certifications: mergedProduct.certifications,
          carbon_footprint: mergedProduct.carbon_footprint,
          water_usage: mergedProduct.water_usage,
          energy_consumption: mergedProduct.energy_consumption,
          recyclability: mergedProduct.recyclability,
          source_confidence: mergedProduct.confidence_score
        }
      })
    }).catch(error => console.error('Error triggering eco-score generation:', error));

    return new Response(
      JSON.stringify({ 
        product: newProduct, 
        merged_data: mergedProduct,
        sources_used: sources.length,
        confidence_score: mergedProduct.confidence_score
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-product-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
