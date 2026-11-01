import { NextResponse } from 'next/server';
import { INVESTIGATION_PRESETS } from '@/lib/nasa/datasetRegistry';

// In-memory investigations store
let savedInvestigations = [
  ...INVESTIGATION_PRESETS.map((p, idx) => ({
    id: p.id,
    title: p.title,
    variableId: p.variableId,
    datasetId: p.datasetId,
    regionName: p.regionName,
    latitude: p.latitude,
    longitude: p.longitude,
    startYear: p.startYear,
    endYear: p.endYear,
    temporalResolution: p.temporalResolution,
    description: p.description,
    isPreset: true,
    createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString()
  }))
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const found = savedInvestigations.find(inv => inv.id === id);
      if (!found) {
        return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    return NextResponse.json(savedInvestigations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newInvestigation = {
      id: `inv-${Date.now()}`,
      title: body.title || `${body.variableId || 'Variable'} Investigation`,
      variableId: body.variableId || 'T2M',
      datasetId: body.datasetId || 'NASA_POWER',
      regionName: body.regionName || 'Custom Coordinates',
      latitude: parseFloat(body.latitude) || 0,
      longitude: parseFloat(body.longitude) || 0,
      startYear: parseInt(body.startYear, 10) || 2005,
      endYear: parseInt(body.endYear, 10) || 2024,
      temporalResolution: body.temporalResolution || 'monthly',
      notes: body.notes || '',
      isPreset: false,
      createdAt: new Date().toISOString()
    };

    savedInvestigations.unshift(newInvestigation);
    return NextResponse.json(newInvestigation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

