import { NextResponse } from 'next/server';
import { DatasetProvider } from '@/lib/nasa/datasetProvider';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const variableId = searchParams.get('variable') || 'T2M';
    const latitude = parseFloat(searchParams.get('lat') || '26.8467');
    const longitude = parseFloat(searchParams.get('lon') || '80.9462');
    const startYear = parseInt(searchParams.get('start') || '2005', 10);
    const endYear = parseInt(searchParams.get('end') || '2024', 10);
    const resolution = searchParams.get('resolution') || 'monthly';

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be a valid float between -90 and 90.' },
        { status: 400 }
      );
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be a valid float between -180 and 180.' },
        { status: 400 }
      );
    }

    const data = await DatasetProvider.fetchObservations({
      variableId,
      latitude,
      longitude,
      startYear,
      endYear,
      resolution
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('API /api/nasa/observations error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to retrieve NASA Earth observation data.',
        details: 'Check coordinates and historical date coverage.'
      },
      { status: 500 }
    );
  }
}

