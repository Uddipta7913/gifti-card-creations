import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { brandName } = await req.json();
    
    if (!brandName) {
      return new Response(
        JSON.stringify({ error: 'Brand name is required' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('BRAND_LOGO_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Search for brand logo using the API
    const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(brandName)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    let logoUrl = null;
    if (data && data.length > 0 && data[0].icon) {
      logoUrl = data[0].icon;
    }

    return new Response(
      JSON.stringify({ logoUrl }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching brand logo:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search brand logo' }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});