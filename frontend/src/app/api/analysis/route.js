import { NextResponse } from 'next/server';
import { performScientificAnalysis } from '@/lib/statistics/trendEngine';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      variableId = 'T2M',
      dataset = 'NASA_POWER',
      observations = [],
      alpha = 0.05,
      deseasonalize = false
    } = body;

    if (!Array.isArray(observations) || observations.length === 0) {
      return NextResponse.json(
        { error: 'Observations array is required and must contain valid time-series entries.' },
        { status: 400 }
      );
    }

    const analysis = await performScientificAnalysis(observations, {
      variableId,
      dataset,
      alpha: parseFloat(alpha) || 0.05,
      deseasonalize: Boolean(deseasonalize),
      usePythonBackend: true
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('API /api/analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal scientific analysis processing error.' },
      { status: 500 }
    );
  }
}

