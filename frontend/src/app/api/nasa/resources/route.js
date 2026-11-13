import { NextResponse } from 'next/server';
import { NASA_DATA_RESOURCES } from '@/lib/nasa/datasetRegistry';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const capability = searchParams.get('capability');

  const backendBase = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';

  // 1. Try Python FastAPI microservice first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const queryParams = new URLSearchParams();
    if (category) queryParams.set('category', category);
    if (capability) queryParams.set('capability', capability);

    const targetUrl = `${backendBase}/api/resources${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        ...data,
        source: 'Python FastAPI Microservice'
      });
    }
  } catch {
    // Backend offline or timeout; smoothly fall back to embedded registry
  }

  // 2. Embedded Fallback
  let filtered = NASA_DATA_RESOURCES;
  if (category) {
    filtered = filtered.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (capability) {
    filtered = filtered.filter(r => r.capabilities.some(c => c.toLowerCase().includes(capability.toLowerCase())));
  }

  return NextResponse.json({
    status: 'SUCCESS',
    count: filtered.length,
    totalCatalogCount: NASA_DATA_RESOURCES.length,
    resources: filtered,
    source: 'Embedded NASA Registry Fallback'
  });
}

