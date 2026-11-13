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

/**
 * Official NASA & Partner Data Resources from Space Apps Challenge
 */
export const NASA_DATA_RESOURCES = [
  // ── NASA Core Data & Time-Series Tools ──
  {
    id: 'giovanni',
    name: 'Giovanni',
    agency: 'NASA GES DISC',
    tagline: 'Versatile Earth Science Data Analysis & Exploration',
    description: 'Versatile tool that provides menus of numerous data variables, and allows generation of time series and download of the time series data.',
    url: 'https://giovanni.gsfc.nasa.gov/',
    category: 'NASA Core Data Tools',
    capabilities: [
      'Time series generation (area-averaged & point)',
      'Interannual anomaly calculation',
      'Spatial animation & correlation maps',
      'Download data as CSV, NetCDF, GeoTIFF'
    ],
    badgeColor: '#70a7ff'
  },
  {
    id: 'hydrology-time-series',
    name: 'Hydrology Time Series',
    agency: 'NASA GES DISC / LDAS',
    tagline: 'Hydrological Modeling & Land Surface Data',
    description: 'Allows generation of time-series with hydrological data across NASA land data assimilation systems (GLDAS, NLDAS).',
    url: 'https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series',
    category: 'NASA Core Data Tools',
    capabilities: [
      'Point time-series on-the-fly generation',
      'Multi-layer soil moisture (0-10cm, 10-40cm, 40-100cm)',
      'Evapotranspiration, runoff & snow water equivalent',
      'Drought index tracking'
    ],
    badgeColor: '#38ef7d'
  },
  {
    id: 'appeears',
    name: 'AppEEARS',
    fullName: 'Application for Extracting and Exploring Analysis Ready Samples',
    agency: 'NASA LP DAAC / USGS',
    tagline: 'Analysis-Ready Geospatial & Satellite Samples',
    description: 'Offers a simple and efficient way to access and transform geospatial data from a variety of federal data archives. Includes time-series generation.',
    url: 'https://appeears.earthdatacloud.nasa.gov/',
    category: 'NASA Core Data Tools',
    capabilities: [
      'Point and area sample extraction',
      'MODIS & VIIRS vegetation time-series generation',
      'Interactive quality masking & cloud filtering',
      'Data reformatting & reprojection'
    ],
    badgeColor: '#ffd899'
  },
  {
    id: 'climate-data-online',
    name: 'Climate Data Online (CDO)',
    agency: 'NOAA NCEI / NCDC',
    tagline: 'Global Historical Weather & Climate Archive',
    description: "CDO provides free access to NCDC's archive of global historical weather and climate data in addition to station history information. This site includes a mapping tool.",
    url: 'https://www.ncei.noaa.gov/cdo-web/',
    category: 'In-Situ Climatology Stations',
    capabilities: [
      'Global Historical Climatology Network (GHCN)',
      'Daily and monthly temperature and precipitation data',
      'Station history and geographical mapping tool',
      'Automated REST API access'
    ],
    badgeColor: '#ec4899'
  },

  // ── Scientific & Statistical Methodology References ──
  {
    id: 'seawifs-chlorophyll-study',
    name: 'Time-Series Analysis of SeaWiFS Chlorophyll',
    agency: 'NASA Technical Reports Server (NTRS)',
    tagline: 'Empirical Methodology for Trend Detection & Significance Testing',
    description: 'Official NASA research publication demonstrating time-series creation and significance testing for remotely-sensed chlorophyll in river-influenced coastal regions.',
    url: 'https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf',
    category: 'Scientific Methodology',
    capabilities: [
      'Non-parametric Mann-Kendall rank trend test',
      'Theil-Sen slope estimation for environmental series',
      'Seasonal climatology decomposition in complex coastal plumes',
      'Autocorrelation pre-whitening'
    ],
    badgeColor: '#a78bfa'
  },
  {
    id: 'knmi-climate-explorer',
    name: 'KNMI Climate Explorer',
    agency: 'Royal Netherlands Meteorological Institute (KNMI) / WMO',
    tagline: 'Research-Grade Statistical Climate Analysis & Field Correlator',
    description: 'Powerful web-based tool for statistical analysis of climate time-series, correlations with atmospheric fields, and empirical trend detection across global datasets.',
    url: 'https://climexp.knmi.nl/',
    category: 'Scientific Methodology',
    capabilities: [
      'Climate time-series plotting and trend fitting',
      'Cross-correlation between station data and reanalysis fields',
      'Extreme value and return period calculations'
    ],
    badgeColor: '#14b8a6'
  },
  {
    id: 'statistical-trend-testing-guide',
    name: 'Statistical Test Methods to Detect Trends',
    agency: 'Scientific Methodology Reference',
    tagline: 'Non-Parametric Statistical Testing Guide for Time-Series Analysis',
    description: 'Comprehensive technical guide on non-parametric methods for detecting trends (Mann-Kendall test, Sen Slope Estimator, and Pettitt changepoint test).',
    url: 'https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b',
    category: 'Scientific Methodology',
    capabilities: [
      'Non-parametric Mann-Kendall test implementation',
      "Sen's slope non-parametric formulation",
      'Tie correction for repeated values',
      'Pettitt changepoint detection'
    ],
    badgeColor: '#f59e0b'
  },

  // ── Partner Space Missions & Radar (CSA / Earth Observation) ──
  {
    id: 'csa-rcm-data',
    name: 'RADARSAT Constellation Mission (RCM) Open Data',
    agency: 'Canadian Space Agency (CSA) / Open Government Canada',
    tagline: 'C-Band Synthetic Aperture Radar (SAR) Earth Observation',
    description: "Official open portal for accessing SAR observations from Canada's three-satellite RADARSAT Constellation Mission for all-weather environmental and flood monitoring.",
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
    category: 'Partner Space Missions & Radar',
    capabilities: [
      'All-weather day-and-night microwave surface imaging',
      'Surface soil moisture & wetland extent delineation',
      'Sea ice and river ice breakup tracking'
    ],
    badgeColor: '#ef4444'
  },
  {
    id: 'geo-ca-portal',
    name: 'Geo.ca Geospatial Platform',
    agency: 'Natural Resources Canada / Geo.ca',
    tagline: 'National Geospatial Open Data Infrastructure',
    description: "Canada's national open spatial platform integrating federal, provincial, and territorial Earth observation layers, climate indicators, and geospatial web services.",
    url: 'http://geo.ca/',
    category: 'Partner Space Missions & Radar',
    capabilities: [
      'Federated spatial data search & visualization',
      'WMS/WFS/REST mapping endpoints',
      'Ecosystem and natural resource layers'
    ],
    badgeColor: '#06b6d4'
  },
  {
    id: 'swot-satellite-mission',
    name: 'SWOT Satellite Mission',
    fullName: 'Surface Water and Ocean Topography Mission',
    agency: 'NASA / CNES / CSA / UK Space Agency',
    tagline: 'High-Precision Altimetry for Global Water Bodies',
    description: "Joint international satellite mission providing the first comprehensive global survey of Earth's surface water, measuring the elevation of oceans, rivers, and lakes.",
    url: 'https://www.asc-csa.gc.ca/eng/satellites/swot/',
    category: 'Partner Space Missions & Radar',
    capabilities: [
      'Ka-band radar interferometer (KaRIn) elevation profiling',
      'Global river discharge and lake water storage estimation',
      'High-resolution continental hydrology mapping'
    ],
    badgeColor: '#3b82f6'
  },
  {
    id: 'csa-ecosystem-monitoring',
    name: 'Ecosystem Monitoring & Protection from Space',
    agency: 'Canadian Space Agency (CSA)',
    tagline: 'Earth Observation Strategies for Climate Vulnerability',
    description: 'Official CSA science showcase demonstrating how satellite telemetry protects forests, coastal zones, permafrost, and northern habitats from climate impacts.',
    url: 'https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp',
    category: 'Partner Space Missions & Radar',
    capabilities: [
      'Ecosystem vulnerability mapping',
      'Permafrost thaw and wildfire regeneration tracking',
      'Wetland carbon sink and peatland surveillance'
    ],
    badgeColor: '#22c55e'
  },
  {
    id: 'csa-sar-tutorial',
    name: 'CSA Synthetic Aperture Radar (SAR) Tutorial',
    agency: 'Canadian Space Agency / GitHub',
    tagline: 'Open-Source Technical Handbook for Radar Remote Sensing & Time-Series',
    description: 'Open-source Python and Jupyter tutorial repository by CSA teaching radar image processing, SAR polarimetry, terrain correction, and change detection algorithms.',
    url: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial',
    category: 'Partner Space Missions & Radar',
    capabilities: [
      'Python scripts and Jupyter notebooks for SAR processing',
      'Polarimetric decomposition algorithms',
      'Multitemporal SAR speckle filtering & change detection'
    ],
    badgeColor: '#eab308'
  }
];

