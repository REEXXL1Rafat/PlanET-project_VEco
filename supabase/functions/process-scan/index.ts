import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { barcode } = await req.json();
    if (!barcode) throw new Error("Barcode is required");

    // 1. Setup Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[Pipeline] Step 1: Checking DB for ${barcode}...`);
    
    // 2. CHECK DATABASE FIRST (Cache Hit)
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*, eco_scores(*)')
      .eq('barcode', barcode)
      .single();

    if (existingProduct) {
      console.log(`[Pipeline] Found in DB! Returning cached data.`);
      return new Response(JSON.stringify(existingProduct), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Pipeline] Step 2: Not in DB. Searching Web/External APIs...`);

    // 3. EXTERNAL SEARCH (OpenFoodFacts is free, fallback to Google/BarcodeLookup)
    const externalRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const externalData = await externalRes.json();

    if (externalData.status === 0) {
      throw new Error("Product not found in global databases.");
    }

    const rawProduct = externalData.product;
    
    // Normalize data
    const productPayload = {
      barcode: barcode,
      name: rawProduct.product_name || "Unknown Product",
      brand: rawProduct.brands || "Unknown Brand",
      category: rawProduct.categories?.split(',')[0] || "General",
      image_url: rawProduct.image_url,
      description: rawProduct.generic_name,
      ingredients: rawProduct.ingredients_text
    };

    console.log(`[Pipeline] Step 3: Analyzing Data with AI...`);

    // 4. AI ANALYSIS (Generate Score)
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'system',
            content: 'You are a sustainability auditor. Output ONLY JSON.'
          },
          {
            role: 'user',
            content: `Analyze this product and assign eco scores (0-100).
            Product: ${JSON.stringify(productPayload)}
            
            Return JSON format:
            {
              "overall": number,
              "carbon_emissions": number,
              "recyclability": number,
              "ethical_sourcing": number,
              "energy_consumption": number,
              "reasoning": "Short summary string"
            }`
          }
        ]
      })
    });

    const aiJson = await aiResponse.json();
    // Robust parsing of AI response
    const aiContent = aiJson.choices[0].message.content;
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const scores = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);

    console.log(`[Pipeline] Step 4: Saving to Database...`);

    // 5. SAVE TO DB (So next time it's instant)
    const { data: savedProduct, error: prodError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (prodError) throw prodError;

    const { data: savedScore, error: scoreError } = await supabase
      .from('eco_scores')
      .insert({
        product_id: savedProduct.id,
        ...scores
      })
      .select()
      .single();

    if (scoreError) throw scoreError;

    // 6. RETURN RESULT
    return new Response(JSON.stringify({
      ...savedProduct,
      eco_scores: [savedScore]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in process-scan function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
