"""
NASA & Partner Earth Science Data and Resources Registry
Official resources, space agency portals, and scientific methodology references for:
'Be An Earth System Trend Detective!' (NASA Space Apps Challenge)

Full 12-Resource Catalog:
1. NASA Giovanni (GES DISC)
2. NASA Hydrology Time Series (GES DISC / LDAS)
3. NASA AppEEARS (LP DAAC / USGS)
4. NOAA NCEI Climate Data Online (CDO)
5. NASA NTRS SeaWiFS Chlorophyll Time-Series & Significance Testing
6. KNMI Climate Explorer
7. Statistical Test Methods to Detect Trends in Time Series Data (Methodology Reference)
8. RADARSAT Constellation Mission (RCM) Open Data (Canadian Space Agency)
9. Geo.ca - Canadian Geospatial Data Infrastructure
10. SWOT Mission - Surface Water and Ocean Topography (NASA / CSA / CNES)
11. CSA Ecosystem Monitoring and Protection from Space
12. CSA Synthetic Aperture Radar (SAR) Tutorial
"""

from typing import List, Dict, Any, Optional

NASA_DATA_RESOURCES: List[Dict[str, Any]] = [
    # ── 1. NASA CORE DATA & TIME-SERIES TOOLS ──
    {
        "id": "giovanni",
        "name": "Giovanni",
        "agency": "NASA GES DISC",
        "tagline": "The Bridge Between Earth Science Data and Scientific Analysis",
        "description": (
            "Versatile tool that provides menus of numerous data variables, "
            "and allows generation of time series and download of the time series data."
        ),
        "url": "https://giovanni.gsfc.nasa.gov/",
        "category": "NASA Core Data Tools",
        "capabilities": [
            "Time-Series Generation (Area-Averaged & Point)",
            "Interannual Anomaly Time Series",
            "Spatial Animation & Correlation Maps",
            "CSV, NetCDF, and GeoTIFF Data Download"
        ],
        "keyVariables": [
            "Aerosol Optical Depth (MODIS, MERRA-2)",
            "Atmospheric Temperature & Water Vapor (AIRS)",
            "Precipitation (GPM IMERG, TRMM)",
            "Column Ozone & Trace Gases (OMI, OMPS)"
        ],
        "accessProtocol": "Web UI, OPeNDAP, REST Service",
        "badgeColor": "#70a7ff"
    },
    {
        "id": "hydrology-time-series",
        "name": "Hydrology Time Series",
        "agency": "NASA GES DISC / LDAS",
        "tagline": "High-Throughput Hydrological Time-Series Data Access (Data Rods)",
        "description": (
            "Allows generation of time-series with hydrological data across "
            "global land surface models and meteorological forcing datasets."
        ),
        "url": "https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series",
        "category": "NASA Core Data Tools",
        "capabilities": [
            "Point Time-Series On-The-Fly Generation (Data Rods)",
            "Decadal Soil Moisture & Evaporation Extraction",
            "Hydrologic Drought Index Calculation",
            "Near Real-Time Catchment Model Assimilation"
        ],
        "keyVariables": [
            "Root-Zone Soil Moisture (0-10cm, 10-40cm, 40-100cm)",
            "Total Evapotranspiration (ET)",
            "Surface Runoff & Baseflow",
            "Snow Water Equivalent (SWE)",
            "Precipitation Forcing"
        ],
        "accessProtocol": "HTTP GET Data Rods API / Web Services",
        "badgeColor": "#38ef7d"
    },
    {
        "id": "appeears",
        "name": "AppEEARS",
        "fullName": "Application for Extracting and Exploring Analysis Ready Samples",
        "agency": "NASA LP DAAC / USGS",
        "tagline": "Analysis-Ready Geospatial & Satellite Samples",
        "description": (
            "Offers a simple and efficient way to access and transform geospatial "
            "data from a variety of federal data archives. Includes time-series generation."
        ),
        "url": "https://appeears.earthdatacloud.nasa.gov/",
        "category": "NASA Core Data Tools",
        "capabilities": [
            "Point & Area Sample Extraction",
            "Vegetation Index Time-Series Generation",
            "Dynamic Interactive Charts & Quality Mask Filtering",
            "Reprojection and Format Transformation (GeoTIFF, NetCDF, CSV)"
        ],
        "keyVariables": [
            "MODIS NDVI / EVI (MOD13A2, MOD13Q1)",
            "VIIRS Surface Reflectance & Vegetation (VNP13A1)",
            "Land Surface Temperature & Emissivity (MOD11A2)",
            "ECOSTRESS Evaporative Stress Index",
            "SMAP Soil Moisture Active Passive"
        ],
        "accessProtocol": "AppEEARS REST API v1, Cloud Object Storage",
        "badgeColor": "#ffd899"
    },
    {
        "id": "climate-data-online",
        "name": "Climate Data Online (CDO)",
        "agency": "NOAA NCEI (formerly NCDC)",
        "tagline": "Global Historical Weather & Meteorological In-Situ Archive",
        "description": (
            "CDO provides free access to NCDC's archive of global historical weather "
            "and climate data in addition to station history information. This site includes a mapping tool."
        ),
        "url": "https://www.ncei.noaa.gov/cdo-web/",
        "category": "In-Situ Climatology & Weather",
        "capabilities": [
            "Global Historical Climatology Network (GHCN-Daily / GHCN-Monthly)",
            "Interactive Web Mapping & Station Picker",
            "Weather Observation Station History & Metadata Lookup",
            "Automated RESTful Web Services for Time-Series Retrieval"
        ],
        "keyVariables": [
            "Daily Maximum & Minimum Surface Temperature (TMAX, TMIN)",
            "Daily Total Precipitation (PRCP)",
            "Snowfall & Snow Depth (SNOW, SNWD)",
            "Station Historical Metadata"
        ],
        "accessProtocol": "CDO Web Services v2 Token-Based REST API",
        "badgeColor": "#ec4899"
    },

    # ── 2. SCIENTIFIC & STATISTICAL METHODOLOGY REFERENCES ──
    {
        "id": "seawifs-chlorophyll-study",
        "name": "Time-Series Analysis of SeaWiFS Chlorophyll",
        "fullName": "Time-Series Analysis of Remotely-Sensed SeaWiFS Chlorophyll in River-Influenced Coastal Regions",
        "agency": "NASA Technical Reports Server (NTRS)",
        "tagline": "Official NASA Technical Publication on Time-Series & Significance Testing",
        "description": (
            "Official NASA research publication demonstrating rigorous time-series creation, "
            "seasonal cycle decomposition, and statistical significance testing in river-influenced coastal zones."
        ),
        "url": "https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf",
        "category": "Scientific Methodology",
        "capabilities": [
            "Empirical Time-Series Formation from Multi-Year Satellite Scans",
            "Non-Parametric Mann-Kendall Trend Hypothesis Testing",
            "Theil-Sen Robust Median Slope Estimation",
            "Seasonal Climatology Separation in Complex Aquatic Plumes"
        ],
        "keyVariables": [
            "Chlorophyll-a Concentration (mg/m³)",
            "Remote Sensing Reflectance (Rrs)",
            "Normalized Water-Leaving Radiance"
        ],
        "documentId": "NASA/TP-2009-20090042747",
        "badgeColor": "#a78bfa"
    },
    {
        "id": "knmi-climate-explorer",
        "name": "KNMI Climate Explorer",
        "agency": "Royal Netherlands Meteorological Institute (KNMI) / WMO",
        "tagline": "Research-Grade Statistical Climate Analysis & Field Correlator",
        "description": (
            "Powerful web-based tool for statistical analysis of climate time-series, "
            "correlations with atmospheric fields, and empirical trend detection across global datasets."
        ),
        "url": "https://climexp.knmi.nl/",
        "category": "Scientific Methodology",
        "capabilities": [
            "Climate Time-Series Plotting & Trend Fitting",
            "Cross-Correlation Between Station Data and Reanalysis Fields",
            "Extreme Value and Return Period Calculations",
            "Geospatial Sliced Data Extraction"
        ],
        "keyVariables": [
            "Global Temperature Anomaly Indices",
            "Atmospheric Teleconnection Indices (ENSO, NAO, SOI)",
            "Gridded Precipitation and Pressure Fields"
        ],
        "badgeColor": "#14b8a6"
    },
    {
        "id": "statistical-trend-testing-guide",
        "name": "Statistical Test Methods to Detect Trends",
        "agency": "Scientific Methodology Reference",
        "tagline": "Non-Parametric Statistical Testing Guide for Time-Series Analysis",
        "description": (
            "Comprehensive technical breakdown of non-parametric methods for detecting "
            "environmental time-series trends (Mann-Kendall test, Sen's Slope Estimator, and Pettitt's changepoint test)."
        ),
        "url": "https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b",
        "category": "Scientific Methodology",
        "capabilities": [
            "Non-Parametric Mann-Kendall Trend Test Implementation",
            "Sen's Slope Non-Parametric Estimator Formulation",
            "Tie-Correction for Tied Environmental Data",
            "Pettitt & Buishand Changepoint Inhomogeneity Detection"
        ],
        "keyVariables": [
            "S Statistic & Variance Var(S)",
            "Standardized Normal Z Score",
            "Confidence Intervals for Slopes"
        ],
        "badgeColor": "#f59e0b"
    },

    # ── 3. RADAR & PARTNER SPACE MISSIONS (CSA / EARTH OBSERVATION) ──
    {
        "id": "csa-rcm-data",
        "name": "RADARSAT Constellation Mission (RCM) Open Data",
        "agency": "Canadian Space Agency (CSA) / Open Government Canada",
        "tagline": "C-Band Synthetic Aperture Radar (SAR) Earth Observation",
        "description": (
            "Official open portal for accessing SAR observations from Canada's three-satellite "
            "RADARSAT Constellation Mission for all-weather environmental, maritime, and flood monitoring."
        ),
        "url": "https://donnees-data.asc-csa.gc.ca/en/dataset/rcm",
        "category": "Partner Space Missions & Radar",
        "capabilities": [
            "All-Weather Day-and-Night Microwave Surface Imaging",
            "Surface Soil Moisture & Wetland Extent Delineation",
            "Sea Ice Monitoring & River Ice Breakup Tracking",
            "Disaster Response & Rapid Flood Extent Mapping"
        ],
        "keyVariables": [
            "C-Band Radar Backscatter (HH, VV, HV, VH polarizations)",
            "Compact Polarimetry Decompositions",
            "Coherence & Interferometric SAR (InSAR) Displacements"
        ],
        "badgeColor": "#ef4444"
    },
    {
        "id": "geo-ca-portal",
        "name": "Geo.ca Geospatial Platform",
        "agency": "Natural Resources Canada / Geo.ca",
        "tagline": "National Geospatial Open Data Infrastructure",
        "description": (
            "Canada's national open spatial infrastructure integrating federal, provincial, "
            "and territorial Earth observation layers, climate indicators, and geospatial web services."
        ),
        "url": "http://geo.ca/",
        "category": "Partner Space Missions & Radar",
        "capabilities": [
            "Federated Spatial Data Search & Visualization",
            "WMS/WFS/REST Mapping Endpoints",
            "Ecosystem and Natural Resource Geo-layers",
            "Interactive Geo-Viewer Integration"
        ],
        "keyVariables": [
            "Geospatial Land Cover & Topography",
            "Watershed Boundaries & River Basin Polygons",
            "Environmental Hazard & Wildfire Perimeters"
        ],
        "badgeColor": "#06b6d4"
    },
    {
        "id": "swot-satellite-mission",
        "name": "SWOT Satellite Mission",
        "fullName": "Surface Water and Ocean Topography Mission",
        "agency": "NASA / CNES / CSA / UK Space Agency",
        "tagline": "Revolutionary High-Precision Altimetry for Earth's Water Bodies",
        "description": (
            "Joint international satellite mission providing the first comprehensive global survey "
            "of Earth's surface water, measuring the height and elevation of oceans, rivers, and lakes."
        ),
        "url": "https://www.asc-csa.gc.ca/eng/satellites/swot/",
        "category": "Partner Space Missions & Radar",
        "capabilities": [
            "Ka-Band Radar Interferometer (KaRIn) Elevation Profiling",
            "Global River Discharge & Lake Water Storage Estimation",
            "Mesoscale and Sub-Mesoscale Ocean Circulation Eddies",
            "High-Resolution Continental Hydrology Mapping"
        ],
        "keyVariables": [
            "Water Surface Elevation (WSE)",
            "River Width, Slope, and Estimated Flow Rate",
            "Lake and Reservoir Surface Area and Storage Changes"
        ],
        "badgeColor": "#3b82f6"
    },
    {
        "id": "csa-ecosystem-monitoring",
        "name": "Ecosystem Monitoring & Protection from Space",
        "agency": "Canadian Space Agency (CSA)",
        "tagline": "Earth Observation Strategies for Climate Vulnerability",
        "description": (
            "Official CSA science showcase demonstrating how satellite telemetry protects forests, "
            "coastal zones, permafrost, and northern wildlife habitats from accelerating climate impacts."
        ),
        "url": "https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp",
        "category": "Partner Space Missions & Radar",
        "capabilities": [
            "Ecosystem Vulnerability Mapping",
            "Permafrost Thaw and Wildfire Regeneration Tracking",
            "Wetland Carbon Sink and Peatland Health Surveillance",
            "Satellite Indicators for Biodiversity Conservation"
        ],
        "keyVariables": [
            "Canopy Greenness & Biomass Density",
            "Forest Disturbance Extents",
            "Wetland Hydro-period Changes"
        ],
        "badgeColor": "#22c55e"
    },
    {
        "id": "csa-sar-tutorial",
        "name": "CSA Synthetic Aperture Radar (SAR) Tutorial",
        "agency": "Canadian Space Agency / GitHub",
        "tagline": "Open-Source Technical Handbook for Radar Remote Sensing & Time-Series",
        "description": (
            "Open-source Python and Jupyter tutorial repository by CSA teaching radar image processing, "
            "SAR polarimetry, terrain correction, and temporal change detection algorithms."
        ),
        "url": "https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial",
        "category": "Partner Space Missions & Radar",
        "capabilities": [
            "Python Scripts & Jupyter Notebooks for SAR Processing",
            "Polarimetric Decomposition (Freeman-Durden, Cloude-Pottier)",
            "Multitemporal SAR Speckle Filtering & Change Detection",
            "Practical Exercises with RADARSAT Data"
        ],
        "keyVariables": [
            "Radar Backscatter (Sigma Nought, Gamma Nought)",
            "Polarimetric Entropy and Anisotropy",
            "Coherence Matrices"
        ],
        "badgeColor": "#eab308"
    }
]


def get_all_nasa_resources(
    category: Optional[str] = None,
    capability: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve all registered resources with optional category or capability filtering.
    """
    resources = NASA_DATA_RESOURCES

    if category:
        cat_lower = category.lower().strip()
        resources = [
            r for r in resources
            if cat_lower in r.get("category", "").lower()
        ]

    if capability:
        cap_lower = capability.lower().strip()
        resources = [
            r for r in resources
            if any(cap_lower in c.lower() for c in r.get("capabilities", []))
        ]

    return resources


def get_nasa_resource_by_id(resource_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve single resource by ID.
    """
    norm_id = resource_id.lower().strip()
    for res in NASA_DATA_RESOURCES:
        if res["id"] == norm_id:
            return res
    return None
