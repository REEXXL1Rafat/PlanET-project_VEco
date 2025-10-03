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
    const { productId, productData } = await req.json();
    
    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating eco score for product:', productId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Lovable AI to analyze product and generate eco scores
    const prompt = `Analyze this product and provide environmental impact scores (0-100, where 100 is best):

Product: ${productData.name}
Brand: ${productData.brand || 'Unknown'}
Category: ${productData.category || 'Unknown'}
Certifications: ${productData.certifications?.join(', ') || 'None'}
Ingredients: ${productData.ingredients?.substring(0, 500) || 'Not available'}
Packaging: ${productData.packaging || 'Not specified'}
Manufacturing: ${productData.manufacturing_places || 'Not specified'}

Provide scores for:
1. Carbon Emissions (0-100): Consider transportation, manufacturing energy, packaging
2. Recyclability (0-100): Based on packaging materials and recyclability
3. Ethical Sourcing (0-100): Fair trade, labor practices, supply chain transparency
4. Energy Consumption (0-100): Manufacturing and lifecycle energy usage

Return ONLY a JSON object with this exact structure:
{
  "carbon_emissions": <number>,
  "recyclability": <number>,
  "ethical_sourcing": <number>,
  "energy_consumption": <number>,
  "overall": <number>,
  "reasoning": "<brief explanation>"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an environmental impact analyst. Analyze products and provide realistic sustainability scores based on available data. Be objective and scientific in your assessment.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert eco score into database
    const { data: ecoScore, error: insertError } = await supabase
      .from('eco_scores')
      .insert({
        product_id: productId,
        overall: Math.round(scores.overall),
        carbon_emissions: Math.round(scores.carbon_emissions),
        recyclability: Math.round(scores.recyclability),
        ethical_sourcing: Math.round(scores.ethical_sourcing),
        energy_consumption: Math.round(scores.energy_consumption),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting eco score:', insertError);
      throw insertError;
    }

    console.log('Eco score created:', ecoScore.id);

    // Insert data source attribution
    await supabase
      .from('data_sources')
      .insert({
        eco_score_id: ecoScore.id,
        name: 'Lovable AI Analysis',
        url: 'https://lovable.dev/ai',
        reliability_score: 85,
      });

    return new Response(
      JSON.stringify({ 
        ecoScore,
        reasoning: scores.reasoning 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-eco-score function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
