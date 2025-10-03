import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Looking up barcode:', barcode);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if product already exists in our database
    const { data: existingProduct, error: dbError } = await supabase
      .from('products')
      .select('*, eco_scores(*), companies(*)')
      .eq('barcode', barcode)
      .maybeSingle();

    if (existingProduct) {
      console.log('Product found in database:', existingProduct.id);
      return new Response(
        JSON.stringify({ product: existingProduct, source: 'database' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Open Food Facts API (free, no API key needed)
    console.log('Fetching from Open Food Facts API...');
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!offResponse.ok) {
      console.error('Open Food Facts API error:', offResponse.status);
      return new Response(
        JSON.stringify({ error: 'Product not found in external database' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const offData = await offResponse.json();
    
    if (offData.status !== 1) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const product = offData.product;
    console.log('Product found in Open Food Facts:', product.product_name);

    // Extract relevant data
    const productData = {
      name: product.product_name || 'Unknown Product',
      barcode: barcode,
      brand: product.brands || null,
      category: product.categories?.split(',')[0]?.trim() || 'General',
      image_url: product.image_url || product.image_front_url || null,
      description: product.generic_name || product.ingredients_text?.substring(0, 200) || null,
      certifications: product.labels?.split(',').map((l: string) => l.trim()).filter(Boolean) || [],
    };

    // Create or get company
    let companyId = null;
    if (productData.brand) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', productData.brand)
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: productData.brand,
            description: `Products by ${productData.brand}`,
            sustainability_rating: 50, // Default neutral rating
          })
          .select()
          .single();

        if (!companyError && newCompany) {
          companyId = newCompany.id;
        }
      }
    }

    // Insert product into database
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        ...productData,
        company_id: companyId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting product:', insertError);
      throw insertError;
    }

    console.log('Product created in database:', newProduct.id);

    // Trigger eco score generation (async - don't wait for it)
    fetch(`${supabaseUrl}/functions/v1/generate-eco-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ 
        productId: newProduct.id,
        productData: {
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          certifications: productData.certifications,
          ingredients: product.ingredients_text,
          packaging: product.packaging,
          manufacturing_places: product.manufacturing_places,
        }
      }),
    }).catch(err => console.error('Error triggering eco score generation:', err));

    return new Response(
      JSON.stringify({ 
        product: newProduct, 
        source: 'external',
        message: 'Eco score generation in progress...'
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in barcode-lookup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
