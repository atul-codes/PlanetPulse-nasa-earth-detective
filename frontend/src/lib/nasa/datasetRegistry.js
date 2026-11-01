/**
 * NASA Earth Science Dataset Registry
 * Defines all environmental variables, NASA mission sources, resolutions, and parameter mappings.
 */

export const ENVIRONMENTAL_CATEGORIES = [
  { id: 'climate', name: 'Climate & Atmosphere', icon: 'Thermometer' },
  { id: 'vegetation', name: 'Land & Vegetation', icon: 'Leaf' },
  { id: 'hydrology', name: 'Precipitation & Water', icon: 'CloudRain' },
  { id: 'ocean', name: 'Oceans & Cryosphere', icon: 'Waves' },
];

export const ENVIRONMENTAL_VARIABLES = {
  // CLIMATE VARIABLES
  T2M: {
    id: 'T2M',
    name: 'Air Temperature (2m)',
    category: 'climate',
    definition: 'The average air temperature measured at a height of 2 meters above Earth\'s surface by NASA meteorological assimilation models and satellites.',
    unit: '°C',
    provider: 'NASA POWER / MERRA-2',
    datasetId: 'NASA_POWER',
    spatialResolution: '0.5° × 0.5° (~50 km)',
    temporalResolution: 'Daily & Monthly',
    coverage: '1981 - Present',
    nativeParam: 'T2M',
    operational: true,
    description: 'Crucial baseline variable for tracking global warming trends, regional heatwaves, and seasonal shifts.'
  },
  T2M_MAX: {
    id: 'T2M_MAX',
    name: 'Maximum Air Temperature (2m)',
    category: 'climate',
    definition: 'Maximum daily temperature at 2 meters above ground, indicating peak extreme thermal conditions.',
    unit: '°C',
    provider: 'NASA POWER',
    datasetId: 'NASA_POWER',
    spatialResolution: '0.5° × 0.5°',
    temporalResolution: 'Daily & Monthly',
    coverage: '1981 - Present',
    nativeParam: 'T2M_MAX',
    operational: true,
    description: 'Tracks intensifying daytime heatwaves and thermal stress on urban and agricultural systems.'
  },
  T2M_MIN: {
    id: 'T2M_MIN',
    name: 'Minimum Air Temperature (2m)',
    category: 'climate',
    definition: 'Minimum daily temperature at 2 meters, essential for assessing overnight cooling and frost frequency.',
    unit: '°C',
    provider: 'NASA POWER',
    datasetId: 'NASA_POWER',
    spatialResolution: '0.5° × 0.5°',
    temporalResolution: 'Daily & Monthly',
    coverage: '1981 - Present',
    nativeParam: 'T2M_MIN',
    operational: true,
    description: 'Shows rapid night-time warming trends associated with greenhouse gas insulation.'
  },

  // HYDROLOGY & PRECIPITATION
  PRECTOTCORR: {
    id: 'PRECTOTCORR',
    name: 'Precipitation (Bias-Corrected)',
    category: 'hydrology',
    definition: 'Accumulated total precipitation (rain and water equivalent of snow) corrected against ground rain gauges and satellite observations.',
    unit: 'mm/day',
    unitMonthly: 'mm/month',
    provider: 'NASA POWER / MERRA-2',
    datasetId: 'NASA_POWER',
    spatialResolution: '0.5° × 0.5°',
    temporalResolution: 'Daily & Monthly',
    coverage: '1981 - Present',
    nativeParam: 'PRECTOTCORR',
    operational: true,
    description: 'Critical for detecting drought trends, monsoonal shifts, and extreme precipitation events.'
  },
  GPM_IMERG: {
    id: 'GPM_IMERG',
    name: 'GPM IMERG High-Res Precipitation',
    category: 'hydrology',
    definition: 'NASA Global Precipitation Measurement (GPM) Integrated Multi-satellitE Retrievals for GPM (IMERG) Final Run calibrated precipitation.',
    unit: 'mm/month',
    provider: 'NASA GES DISC / GPM',
    datasetId: 'GPM_IMERG_FINAL',
    spatialResolution: '0.1° × 0.1° (~10 km)',
    temporalResolution: 'Monthly & Daily',
    coverage: '2000 - Present',
    nativeParam: 'precipitationCal',
    operational: true,
    description: 'High-resolution multi-satellite precipitation calibrated with GPCC rain-gauge analysis.'
  },
  RH2M: {
    id: 'RH2M',
    name: 'Relative Humidity (2m)',
    category: 'climate',
    definition: 'The ratio of actual atmospheric water vapor pressure to the saturation vapor pressure at 2 meters above the ground.',
    unit: '%',
    provider: 'NASA POWER',
    datasetId: 'NASA_POWER',
    spatialResolution: '0.5° × 0.5°',
    temporalResolution: 'Daily & Monthly',
    coverage: '1981 - Present',
    nativeParam: 'RH2M',
    operational: true,
    description: 'Assesses atmospheric moisture availability, evaporative cooling potential, and wet-bulb heat risk.'
  },

  // VEGETATION & LAND
  MODIS_NDVI: {
    id: 'MODIS_NDVI',
    name: 'MODIS NDVI (Normalized Difference Vegetation Index)',
    category: 'vegetation',
    definition: 'Satellite measure of photosynthetic activity and green vegetation canopy density derived from MODIS Terra/Aqua red and near-infrared reflectance: (NIR - Red) / (NIR + Red).',
    unit: 'Index (-1.0 to +1.0)',
    provider: 'NASA LP DAAC / MODIS (MOD13A3 / MOD13Q1)',
    datasetId: 'MODIS_TERRA',
    spatialResolution: '250m - 1km',
    temporalResolution: '16-Day & Monthly',
    coverage: '2000 - Present',
    nativeParam: '_1_km_monthly_NDVI',
    operational: true,
    description: 'Identifies deforestation in the Amazon, desertification in arid zones, and agricultural crop growth dynamics.'
  },
  MODIS_EVI: {
    id: 'MODIS_EVI',
    name: 'MODIS EVI (Enhanced Vegetation Index)',
    category: 'vegetation',
    definition: 'Optimized vegetation index with improved sensitivity in high-biomass canopy regions (e.g. rainforests) through atmospheric and canopy background resistance.',
    unit: 'Index (-1.0 to +1.0)',
    provider: 'NASA LP DAAC / MODIS',
    datasetId: 'MODIS_TERRA',
    spatialResolution: '1km',
    temporalResolution: 'Monthly',
    coverage: '2000 - Present',
    nativeParam: '_1_km_monthly_EVI',
    operational: true,
    description: 'Decouples dense rainforest canopy signals without early saturation observed in NDVI.'
  },
  GLDAS_SOILM: {
    id: 'GLDAS_SOILM',
    name: 'GLDAS Soil Moisture (0-10cm Root Zone)',
    category: 'vegetation',
    definition: 'Volumetric soil moisture content in the top 10cm soil layer modeled by the NASA Global Land Data Assimilation System (GLDAS Noah).',
    unit: 'kg/m²',
    provider: 'NASA GES DISC / GLDAS',
    datasetId: 'GLDAS_NOAH',
    spatialResolution: '0.25° × 0.25° (~25 km)',
    temporalResolution: 'Monthly',
    coverage: '2000 - Present',
    nativeParam: 'SoilMoi0_10cm_inst',
    operational: true,
    description: 'Key indicator of agricultural drought, soil dehydration, and crop irrigation stress.'
  },

  // ATMOSPHERE & OCEAN
  MERRA2_AOD: {
    id: 'MERRA2_AOD',
    name: 'MERRA-2 Aerosol Optical Depth (AOD 550nm)',
    category: 'climate',
    definition: 'Total extinction aerosol optical depth at 550 nm from NASA MERRA-2 assimilation, measuring particulate matter and smoke opacity.',
    unit: 'Optical Depth (dimensionless)',
    provider: 'NASA GES DISC / MERRA-2',
    datasetId: 'MERRA2_AEROSOL',
    spatialResolution: '0.5° × 0.625°',
    temporalResolution: 'Monthly',
    coverage: '1980 - Present',
    nativeParam: 'TOTEXTTAU',
    operational: true,
    description: 'Monitors regional air pollution, wildfire smoke plumes, dust storms, and atmospheric clarity.'
  },
  OMI_OZONE: {
    id: 'OMI_OZONE',
    name: 'OMI Total Column Ozone',
    category: 'climate',
    definition: 'Total ozone abundance in a column from Earth\'s surface to the top of the atmosphere measured by the Ozone Monitoring Instrument (OMI).',
    unit: 'Dobson Units (DU)',
    provider: 'NASA GES DISC / OMI Aura',
    datasetId: 'OMI_AURA',
    spatialResolution: '0.25° × 0.25°',
    temporalResolution: 'Monthly',
    coverage: '2004 - Present',
    nativeParam: 'ColumnAmountO3',
    operational: true,
    description: 'Tracks the recovery of the Antarctic ozone hole and stratospheric UV shielding capacity.'
  }
};

export const INVESTIGATION_PRESETS = [
  {
    id: 'preset-amazon-ndvi',
    title: 'Amazon Basin Canopy Degradation',
    subtitle: 'MODIS Terra Vegetation Index (NDVI)',
    variableId: 'MODIS_NDVI',
    datasetId: 'MODIS_TERRA',
    regionName: 'Amazon Rainforest (Rondônia, Brazil)',
    latitude: -10.5,
    longitude: -62.8,
    startYear: 2005,
    endYear: 2024,
    temporalResolution: 'monthly',
    description: 'Investigate two decades of canopy change, logging, and agricultural expansion in the southwestern Amazon basin.',
    expectedTrend: 'Decreasing',
    color: '#10B981'
  },
  {
    id: 'preset-gangetic-heat',
    title: 'Indo-Gangetic Plain Extreme Heat Warming',
    subtitle: 'NASA POWER Air Temperature (2m)',
    variableId: 'T2M',
    datasetId: 'NASA_POWER',
    regionName: 'Indo-Gangetic Plain (Lucknow / Uttar Pradesh)',
    latitude: 26.8467,
    longitude: 80.9462,
    startYear: 2000,
    endYear: 2024,
    temporalResolution: 'monthly',
    description: 'Analyze statistically significant 24-year summer temperature increases across the densely populated northern Indian plains.',
    expectedTrend: 'Increasing',
    color: '#F59E0B'
  },
  {
    id: 'preset-arctic-warming',
    title: 'Arctic Polar Amplification',
    subtitle: 'NASA POWER / MERRA-2 Arctic Air Temperature',
    variableId: 'T2M',
    datasetId: 'NASA_POWER',
    regionName: 'Svalbard / Barents Sea (Arctic)',
    latitude: 78.2232,
    longitude: 15.6267,
    startYear: 1995,
    endYear: 2024,
    temporalResolution: 'monthly',
    description: 'Examine polar amplification where temperatures have surged at over 3× the global average rate.',
    expectedTrend: 'Significant Increasing',
    color: '#16C7E8'
  },
  {
    id: 'preset-indian-monsoon',
    title: 'Indian Subcontinent Monsoon Variability',
    subtitle: 'NASA POWER & GPM Corrected Precipitation',
    variableId: 'PRECTOTCORR',
    datasetId: 'NASA_POWER',
    regionName: 'Central India (Nagpur, Maharashtra)',
    latitude: 21.1458,
    longitude: 79.0882,
    startYear: 2000,
    endYear: 2024,
    temporalResolution: 'monthly',
    description: 'Investigate long-term shifts in monsoon rainfall intensity and erratic seasonal precipitation distribution.',
    expectedTrend: 'Variable / Non-monotonic',
    color: '#3B82F6'
  },
  {
    id: 'preset-sahel-soil',
    title: 'Sahel Agricultural Soil Moisture Depletion',
    subtitle: 'GLDAS Noah Soil Moisture Model',
    variableId: 'GLDAS_SOILM',
    datasetId: 'GLDAS_NOAH',
    regionName: 'Sahel Semi-Arid Zone (Niamey, Niger)',
    latitude: 13.5116,
    longitude: 2.1254,
    startYear: 2002,
    endYear: 2024,
    temporalResolution: 'monthly',
    description: 'Track root-zone soil water deficits in the vulnerable semi-arid transition zone bordering the Sahara.',
    expectedTrend: 'Decreasing',
    color: '#EC4899'
  }
];

export const POPULAR_LOCATIONS = [
  { name: 'Lucknow, India', lat: 26.8467, lon: 80.9462, region: 'Indo-Gangetic Plain' },
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, region: 'Northern India' },
  { name: 'Amazon Rainforest (Manaus)', lat: -3.1190, lon: -60.0217, region: 'South America' },
  { name: 'Svalbard Arctic Station', lat: 78.2232, lon: 15.6267, region: 'Arctic' },
  { name: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219, region: 'East Africa' },
  { name: 'Phoenix, Arizona, USA', lat: 33.4484, lon: -112.0740, region: 'North America' },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, region: 'East Asia' },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, region: 'Oceania' },
  { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357, region: 'North Africa' },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, region: 'Western Europe' }
];

