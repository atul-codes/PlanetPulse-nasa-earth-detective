/**
 * NASA Earth Satellite Imagery Service
 * Bridges NASA Open APIs (api.nasa.gov) with NASA GIBS (Global Imagery Browse Services)
 */

export const SATELLITE_LAYERS = [
  {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    name: 'MODIS Terra True Color (Natural)',
    satellite: 'Terra (EOS AM-1)',
    sensor: 'MODIS',
    description: 'Natural photographic surface reflectance in red, green, and blue bands.',
    provider: 'NASA GIBS / EOSDIS'
  },
  {
    id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    name: 'VIIRS Suomi NPP High-Res True Color',
    satellite: 'Suomi NPP',
    sensor: 'VIIRS',
    description: '375m high-resolution daily imagery for global environmental monitoring.',
    provider: 'NASA GIBS / Land, Atmosphere Near real-time Capability for EOS (LANCE)'
  },
  {
    id: 'MODIS_Terra_SurfaceReflectance_Bands721',
    name: 'False Color (Agriculture & Burn Scars)',
    satellite: 'Terra (EOS AM-1)',
    sensor: 'MODIS (Bands 7-2-1)',
    description: 'Infrared composite highlighting active vegetation in bright green, burn scars in red/orange, and water in deep blue.',
    provider: 'NASA GIBS / LP DAAC'
  },
  {
    id: 'VIIRS_Black_Marble',
    name: 'NASA Black Marble (Night Lights)',
    satellite: 'Suomi NPP / JPSS',
    sensor: 'VIIRS Day/Night Band',
    description: 'Earth at night showing human settlements, electric infrastructure, and urbanization.',
    provider: 'NASA Earth Observatory / GIBS'
  },
  {
    id: 'LANDSAT_OPEN_API',
    name: 'Landsat 8/9 High-Res (NASA Open API)',
    satellite: 'Landsat 8 / 9',
    sensor: 'OLI / TIRS',
    description: '30m optical and thermal multispectral imagery queried directly through api.nasa.gov.',
    provider: 'NASA Open API / USGS'
  }
];

/**
 * Returns formatted imagery URLs and metadata for specified lat/lon
 */
export function getSatelliteImageryUrl({
  latitude,
  longitude,
  layerId = 'MODIS_Terra_CorrectedReflectance_TrueColor',
  date,
  dim = 0.8, // Bounding box dimension in degrees
  width = 800,
  height = 600
}) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  // Default to yesterday's date if not supplied (satellites process daily composites)
  let targetDate = date;
  if (!targetDate) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    targetDate = d.toISOString().split('T')[0];
  }

  // Calculate EPSG:4326 Bounding Box [minLat, minLon, maxLat, maxLon]
  const halfDim = dim / 2;
  const minLat = Math.max(-90, lat - halfDim).toFixed(4);
  const maxLat = Math.min(90, lat + halfDim).toFixed(4);
  const minLon = Math.max(-180, lon - halfDim).toFixed(4);
  const maxLon = Math.min(180, lon + halfDim).toFixed(4);

  // If user requests Landsat Open API
  if (layerId === 'LANDSAT_OPEN_API') {
    return {
      type: 'nasa_open_api',
      url: `https://api.nasa.gov/planetary/earth/imagery?lon=${lon.toFixed(4)}&lat=${lat.toFixed(4)}&date=${targetDate}&dim=${Math.min(dim, 0.25)}&api_key=${apiKey}`,
      fallbackGibsUrl: `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&VERSION=1.3.0&FORMAT=image/jpeg&TRANSPARENT=FALSE&WIDTH=${width}&HEIGHT=${height}&CRS=EPSG:4326&BBOX=${minLat},${minLon},${maxLat},${maxLon}&TIME=${targetDate}`,
      layerId,
      date: targetDate,
      bbox: [minLat, minLon, maxLat, maxLon],
      hasApiKey: apiKey !== 'DEMO_KEY'
    };
  }

  // Standard NASA GIBS Global Imagery WMS
  const gibsUrl = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=${layerId}&VERSION=1.3.0&FORMAT=image/jpeg&TRANSPARENT=FALSE&WIDTH=${width}&HEIGHT=${height}&CRS=EPSG:4326&BBOX=${minLat},${minLon},${maxLat},${maxLon}&TIME=${targetDate}`;

  return {
    type: 'nasa_gibs_wms',
    url: gibsUrl,
    layerId,
    date: targetDate,
    bbox: [minLat, minLon, maxLat, maxLon],
    hasApiKey: apiKey !== 'DEMO_KEY'
  };
}

