

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const query = String(body?.query || '').trim();

    if (query.length < 2) {
      return new Response(
        JSON.stringify({
          companies: [],
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const apiKey = Deno.env.get(
      'GOOGLE_PLACES_API_KEY'
    );

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'GOOGLE_PLACES_API_KEY is not configured.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const googleResponse = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },

        body: JSON.stringify({
          input: query,

          includedRegionCodes: ['ca'],

          locationBias: {
            circle: {
              center: {
                latitude: 53.5461,
                longitude: -113.4938,
              },

              radius: 40000,
            },
          },

          includePureServiceAreaBusinesses: true,
        }),
      }
    );

    const googleData = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error(
        'Google Places error:',
        googleData
      );

      return new Response(
        JSON.stringify({
          error:
            googleData?.error?.message ||
            'Google Places search failed.',
          google:
            googleData,
        }),
        {
          status: googleResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const companies = (
      googleData?.suggestions || []
    )
      .map((suggestion: any) => {
        const prediction =
          suggestion?.placePrediction;

        if (!prediction) {
          return null;
        }

        return {
          place_id:
            prediction.placeId || null,

          name:
            prediction.structuredFormat
              ?.mainText?.text ||
            prediction.text?.text ||
            '',

          description:
            prediction.text?.text || '',

          secondary_text:
            prediction.structuredFormat
              ?.secondaryText?.text ||
            '',
        };
      })
      .filter(Boolean);

    return new Response(
      JSON.stringify({
        companies,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'search-companies error:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Company search failed.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});