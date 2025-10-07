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
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid base64 image is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Starting product recognition...');

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Remove data:image prefix if present
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Call OpenRouter API with DeepSeek model
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are a product recognition system. Analyze the provided product image.
Return structured JSON with the following fields:
{
  "product_name": "Recognized product name",
  "brand": "Brand name",
  "category": "General category (e.g. snack, detergent, beverage)",
  "description": "Short description if available",
  "confidence": "Recognition confidence from 0-1"
}
If multiple products are visible, return the most central/clear one.
Return ONLY valid JSON, no additional text.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;

    if (!textContent) {
      throw new Error('No response from OpenRouter API');
    }

    console.log('AI response:', textContent);

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const productInfo = JSON.parse(jsonMatch[0]);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for existing product in database
    const { data: existingProducts, error: searchError } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${productInfo.product_name}%`)
      .limit(1);

    if (searchError) {
      console.error('Error searching products:', searchError);
    }

    let product;
    if (existingProducts && existingProducts.length > 0) {
      // Product exists
      product = existingProducts[0];
      console.log('Found existing product:', product.id);
    } else {
      // Create new product
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: productInfo.product_name,
          brand: productInfo.brand || null,
          category: productInfo.category || null,
          description: productInfo.description || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating product:', insertError);
        throw insertError;
      }

      product = newProduct;
      console.log('Created new product:', product.id);
    }

    return new Response(
      JSON.stringify({
        product,
        recognition: productInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in product-recognition function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
