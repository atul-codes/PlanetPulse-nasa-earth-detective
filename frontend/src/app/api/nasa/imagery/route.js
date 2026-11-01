import { NextResponse } from 'next/server';
import { getSatelliteImageryUrl, SATELLITE_LAYERS } from '@/lib/nasa/imagery';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('lat') || '26.8467');
    const longitude = parseFloat(searchParams.get('lon') || '80.9462');
    const layerId = searchParams.get('layer') || 'MODIS_Terra_CorrectedReflectance_TrueColor';
    const date = searchParams.get('date');
    const dim = parseFloat(searchParams.get('dim') || '1.0');
    const proxy = searchParams.get('proxy') === 'true';

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: 'Latitude must be between -90 and 90.' }, { status: 400 });
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Longitude must be between -180 and 180.' }, { status: 400 });
    }

    const imageryInfo = getSatelliteImageryUrl({
      latitude,
      longitude,
      layerId,
      date,
      dim
    });

    const currentLayer = SATELLITE_LAYERS.find(l => l.id === layerId) || SATELLITE_LAYERS[0];

    // If proxy requested (to fetch image buffer directly)
    if (proxy) {
      try {
        const response = await fetch(imageryInfo.url);
        if (!response.ok && imageryInfo.fallbackGibsUrl) {
          // Fallback to GIBS if Open API returns 404/400
          const fallbackResp = await fetch(imageryInfo.fallbackGibsUrl);
          const buffer = await fallbackResp.arrayBuffer();
          return new Response(buffer, {
            headers: {
              'Content-Type': fallbackResp.headers.get('content-type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=86400'
            }
          });
        }
        const buffer = await response.arrayBuffer();
        return new Response(buffer, {
          headers: {
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch (err) {
        console.warn('Proxy fetch error, falling back to direct URL:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      imageryUrl: imageryInfo.url,
      fallbackUrl: imageryInfo.fallbackGibsUrl || null,
      type: imageryInfo.type,
      selectedLayer: currentLayer,
      availableLayers: SATELLITE_LAYERS,
      coordinates: {
        latitude,
        longitude
      },
      date: imageryInfo.date,
      bbox: imageryInfo.bbox,
      hasApiKey: imageryInfo.hasApiKey,
      attribution: 'NASA Earth Science Data and Information System (ESDIS) / api.nasa.gov'
    });
  } catch (error) {
    console.error('Satellite Imagery API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate satellite imagery.' },
      { status: 500 }
    );
  }
}

