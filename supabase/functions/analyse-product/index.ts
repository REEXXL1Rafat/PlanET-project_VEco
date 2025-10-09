import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode, productData } = await req.json();

    if (!barcode && !productData) {
      return new Response(
        JSON.stringify({ error: 'Either barcode or productData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!supabaseUrl || !supabaseKey || !openRouterKey) {
      throw new Error('Missing required configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let product = productData;

    // If barcode provided, fetch from database first
    if (barcode && !productData) {
      // First fetch from multi-source pipeline
      const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-product-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode })
      });

      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch product data');
      }

      const fetchData = await fetchResponse.json();
      product = fetchData.merged_data || fetchData.product;
    }

    // Prepare analysis prompt
    const analysisPrompt = `
You are an environmental sustainability expert. Analyze the following product data and provide a comprehensive eco-analysis:

Product Data:
${JSON.stringify(product, null, 2)}

Please provide:
1. Eco-Sustainability Score (0-100) with detailed reasoning
2. Main environmental impact areas:
   - Carbon emissions impact
   - Water usage impact
   - Material sustainability
   - Packaging impact
   - Energy consumption
3. Specific suggestions to improve sustainability
4. Missing data fields that would improve the analysis
5. Confidence level of this analysis (0-100)
6. Certification recommendations

Return ONLY valid JSON in this format:
{
  "eco_score": 0-100,
  "grade": "A-E",
  "reasoning": "detailed explanation",
  "impact_areas": {
    "carbon_emissions": {"score": 0-100, "notes": ""},
    "water_usage": {"score": 0-100, "notes": ""},
    "materials": {"score": 0-100, "notes": ""},
    "packaging": {"score": 0-100, "notes": ""},
    "energy": {"score": 0-100, "notes": ""}
  },
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "missing_fields": ["field1", "field2"],
  "confidence_level": 0-100,
  "recommended_certifications": ["cert1", "cert2"]
}`;

    console.log('Sending analysis request to OpenRouter...');

    // Call OpenRouter API with DeepSeek
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'EcoVerify'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'system',
            content: 'You are an environmental sustainability expert specializing in product eco-analysis. Always return valid JSON responses.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Received response from OpenRouter');

    const analysisText = aiResponse.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }

    // If we have a product ID, update the database
    if (barcode) {
      const { data: dbProduct } = await supabase
        .from('products')
        .select('id')
        .eq('barcode', barcode)
        .single();

      if (dbProduct) {
        // Insert or update eco score
        await supabase
          .from('eco_scores')
          .upsert({
            product_id: dbProduct.id,
            overall: analysis.eco_score,
            carbon_emissions: analysis.impact_areas.carbon_emissions.score,
            recyclability: analysis.impact_areas.packaging.score,
            ethical_sourcing: analysis.impact_areas.materials.score,
            energy_consumption: analysis.impact_areas.energy.score
          });

        console.log('Updated eco scores in database');
      }
    }

    return new Response(
      JSON.stringify({
        analysis,
        product
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyse-product function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
