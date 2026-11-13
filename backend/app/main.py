
import os
import sys

# Ensure backend root directory is in sys.path
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import logging
import uvicorn

from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field, ConfigDict

from app.services.data_processor import clean_time_series
from app.services.trend_analyzer import analyze_trend
from app.services.seasonal_analysis import deseasonalize_series
from app.services.nasa_resources import (
    get_all_nasa_resources,
    get_nasa_resource_by_id,
    NASA_DATA_RESOURCES
)


# ==========================================
# 1. APPLICATION CONFIGURATION
# ==========================================

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("orbit-api")

APP_TITLE = "Earth Systems Trend Detective"
APP_VERSION = "2.0.0"

MAX_OBSERVATIONS = 10000
MAX_REGIONS = 20

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]


# ==========================================
# 2. FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title=APP_TITLE,
    description=(
        "Scientific Earth observation trend analysis API "
        "using NASA datasets, NumPy, SciPy and PyMannKendall."
    ),
    version=APP_VERSION
)


# ==========================================
# 3. CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS if FRONTEND_ORIGINS else ["*"],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# 4. PYDANTIC REQUEST MODELS
# ==========================================

class ObservationPoint(BaseModel):

    model_config = ConfigDict(
        extra="ignore",
        allow_inf_nan=False
    )

    date: str = Field(
        ...,
        min_length=4,
        max_length=50
    )

    value: float


class AnalysisRequest(BaseModel):

    model_config = ConfigDict(extra="ignore")

    variableId: str = Field(
        default="T2M",
        min_length=1,
        max_length=100
    )

    dataset: str = Field(
        default="NASA_POWER",
        min_length=1,
        max_length=100
    )

    observations: List[ObservationPoint] = Field(
        ...,
        min_length=1,
        max_length=MAX_OBSERVATIONS
    )

    alpha: float = Field(
        default=0.05,
        gt=0,
        lt=1
    )

    deseasonalize: bool = False


class RegionRequest(BaseModel):

    model_config = ConfigDict(extra="ignore")

    name: str = Field(
        default="Unknown Region",
        min_length=1,
        max_length=150
    )

    coordinates: Optional[Dict[str, Any]] = None

    observations: List[ObservationPoint] = Field(
        ...,
        min_length=1,
        max_length=MAX_OBSERVATIONS
    )


class ComparisonRequest(BaseModel):

    model_config = ConfigDict(extra="ignore")

    variableId: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    regions: List[RegionRequest] = Field(
        ...,
        min_length=1,
        max_length=MAX_REGIONS
    )

    alpha: float = Field(
        default=0.05,
        gt=0,
        lt=1
    )


# ==========================================
# 5. HELPER FUNCTIONS
# ==========================================

def convert_observations(
    observations: List[ObservationPoint]
) -> List[Dict[str, Any]]:
    """
    Convert validated Pydantic observations
    into dictionaries for service functions.
    """

    return [
        observation.model_dump()
        for observation in observations
    ]


def get_data_summary(
    observations: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generate basic descriptive statistics.
    """

    values = [
        item["value"]
        for item in observations
    ]

    return {
        "count": len(values),
        "mean": round(float(sum(values) / len(values)), 6),
        "min": round(float(min(values)), 6),
        "max": round(float(max(values)), 6)
    }


# ==========================================
# 6. HEALTH CHECK ENDPOINT
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "HEALTHY",
        "service": APP_TITLE,
        "version": APP_VERSION,
        "engine": [
            "Python",
            "FastAPI",
            "NumPy",
            "SciPy",
            "PyMannKendall"
        ],
        "supportedMethods": [
            "OLS Linear Regression",
            "Original Mann-Kendall",
            "Sen's Slope",
            "Climatological Deseasonalization"
        ],
        "alphaDefault": 0.05,
        "nasaResourcesCount": len(NASA_DATA_RESOURCES)
    }


# ==========================================
# 7. ROOT ENDPOINT
# ==========================================

@app.get("/")
def root():

    return {
        "message": "Welcome to Earth Systems Trend Detective API",
        "status": "RUNNING",
        "documentation": "/docs",
        "health": "/health",
        "resourcesEndpoint": "/api/resources"
    }


# ==========================================
# 7.1. NASA DATA & RESOURCES ENDPOINTS
# ==========================================

@app.get("/api/resources")
def list_nasa_resources(
    category: Optional[str] = None,
    capability: Optional[str] = None
):
    """
    Returns the official NASA Data & Resources catalog from the Space Apps Challenge:
    - Giovanni (NASA GES DISC)
    - Hydrology Time Series (Data Rods / LDAS)
    - AppEEARS (NASA LP DAAC)
    - Climate Data Online (NOAA NCDC CDO)
    - Time-Series Analysis of SeaWiFS Chlorophyll (Methodology Reference)
    """
    items = get_all_nasa_resources(category=category, capability=capability)
    return {
        "status": "SUCCESS",
        "count": len(items),
        "totalCatalogCount": len(NASA_DATA_RESOURCES),
        "resources": items
    }


@app.get("/api/resources/{resource_id}")
def get_nasa_resource(resource_id: str):
    """
    Returns detailed metadata, capabilities, key variables, and
    access links for a specific NASA resource.
    """
    resource = get_nasa_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=404,
            detail=f"NASA resource '{resource_id}' not found. Available IDs: {[r['id'] for r in NASA_DATA_RESOURCES]}"
        )
    return {
        "status": "SUCCESS",
        "resource": resource
    }


# ==========================================
# 8. MAIN TREND ANALYSIS ENDPOINT
# ==========================================

@app.post("/api/analyze")
def run_analysis(payload: AnalysisRequest):

    try:

        logger.info(
            "Starting analysis: variable=%s dataset=%s",
            payload.variableId,
            payload.dataset
        )

        # ----------------------------------
        # STEP 1: Convert input observations
        # ----------------------------------

        raw_observations = convert_observations(
            payload.observations
        )

        # ----------------------------------
        # STEP 2: Clean and validate data
        # ----------------------------------

        cleaned = clean_time_series(
            raw_observations
        )

        if len(cleaned) < 4:

            return {
                "status": "INSUFFICIENT_DATA",
                "variableId": payload.variableId,
                "dataset": payload.dataset,
                "observationCount": len(cleaned),
                "message": (
                    "At least 4 valid observations are required "
                    "for trend analysis."
                ),
                "cleanedObservations": cleaned
            }

        logger.info(
            "Valid observations after cleaning: %s",
            len(cleaned)
        )

        # ----------------------------------
        # STEP 3: Optional deseasonalization
        # ----------------------------------

        seasonal_data = None
        deseasonalized_applied = False

        if payload.deseasonalize:

            seasonal_data = deseasonalize_series(
                cleaned
            )

            if seasonal_data.get("status") == "SUCCESS":

                deseasonalized_obs = [
                    {
                        "date": item["date"],
                        "value": item["deseasonalized"]
                    }
                    for item in seasonal_data["series"]
                ]

                if len(deseasonalized_obs) >= 4:

                    analysis_observations = deseasonalized_obs
                    deseasonalized_applied = True

                else:

                    analysis_observations = cleaned

            else:

                # Fallback to original observations
                analysis_observations = cleaned

                logger.warning(
                    "Deseasonalization skipped: %s",
                    seasonal_data.get("message")
                )

        else:

            analysis_observations = cleaned

        # ----------------------------------
        # STEP 4: Perform trend analysis
        # ----------------------------------

        trend_result = analyze_trend(
            analysis_observations,
            alpha=payload.alpha
        )

        # ----------------------------------
        # STEP 5: Generate descriptive stats
        # ----------------------------------

        summary = get_data_summary(cleaned)

        # ----------------------------------
        # STEP 6: Response metadata
        # ----------------------------------

        return {

            "status": "SUCCESS",

            "variableId": payload.variableId,

            "dataset": payload.dataset,

            "deseasonalizedRequested": payload.deseasonalize,

            "deseasonalizedApplied": deseasonalized_applied,

            "seasonalProfile": seasonal_data,

            "dataSummary": summary,

            "analysisMetadata": {
                "inputObservations": len(raw_observations),
                "validObservations": len(cleaned),
                "analysisObservations": len(analysis_observations),
                "significanceLevel": payload.alpha,
                "timeUnit": "years",
                "analysisType": (
                    "Deseasonalized"
                    if deseasonalized_applied
                    else "Original Time Series"
                )
            },

            "results": trend_result,

            "cleanedObservations": cleaned

        }

    except HTTPException:
        raise

    except ValueError as error:

        logger.warning(
            "Invalid analysis input: %s",
            str(error)
        )

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception:

        logger.exception(
            "Unexpected error during trend analysis"
        )

        raise HTTPException(
            status_code=500,
            detail="Internal trend analysis error."
        )


# ==========================================
# 9. MULTI-REGION COMPARISON ENDPOINT
# ==========================================

@app.post("/api/compare")
def compare_regions(payload: ComparisonRequest):

    try:

        comparison_results = []

        logger.info(
            "Starting region comparison for %s regions",
            len(payload.regions)
        )

        for region in payload.regions:

            name = region.name

            # ----------------------------------
            # STEP 1: Clean regional observations
            # ----------------------------------

            raw_observations = convert_observations(
                region.observations
            )

            cleaned = clean_time_series(
                raw_observations
            )

            # ----------------------------------
            # STEP 2: Check data availability
            # ----------------------------------

            if len(cleaned) < 4:

                comparison_results.append({

                    "regionName": name,

                    "coordinates": region.coordinates,

                    "count": len(cleaned),

                    "trendClassification": "Insufficient Data",

                    "isSignificant": False,

                    "message": (
                        "At least 4 valid observations "
                        "are required."
                    )

                })

                continue

            # ----------------------------------
            # STEP 3: Run trend analysis
            # ----------------------------------

            result = analyze_trend(
                cleaned,
                alpha=payload.alpha
            )

            # ----------------------------------
            # STEP 4: Calculate statistics
            # ----------------------------------

            summary = get_data_summary(cleaned)

            # ----------------------------------
            # STEP 5: Append regional result
            # ----------------------------------

            comparison_results.append({

                "regionName": name,

                "coordinates": region.coordinates,

                "count": len(cleaned),

                "mean": summary["mean"],

                "min": summary["min"],

                "max": summary["max"],

                "trendClassification": (
                    result.get("trendClassification")
                ),

                "isSignificant": (
                    result.get("isSignificant")
                ),

                "senSlope": result.get(
                    "senSlope", {}
                ).get("slope"),

                "linearSlope": result.get(
                    "linearRegression", {}
                ).get("slope"),

                "pValue": result.get(
                    "mannKendall", {}
                ).get("pValue"),

                "durationYears": result.get(
                    "durationYears"
                ),

                "confidenceInterval": result.get(
                    "senSlope", {}
                ).get("confidenceInterval")

            })

        # ----------------------------------
        # STEP 6: Final comparison response
        # ----------------------------------

        valid_regions = sum(
            1
            for item in comparison_results
            if item.get("trendClassification")
            != "Insufficient Data"
        )

        return {

            "status": "SUCCESS",

            "variableId": payload.variableId,

            "significanceLevel": payload.alpha,

            "regionsCount": len(comparison_results),

            "analyzedRegions": valid_regions,

            "insufficientDataRegions": (
                len(comparison_results) - valid_regions
            ),

            "regions": comparison_results

        }

    except HTTPException:
        raise

    except ValueError as error:

        logger.warning(
            "Invalid comparison input: %s",
            str(error)
        )

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception:

        logger.exception(
            "Unexpected error during regional comparison"
        )

        raise HTTPException(
            status_code=500,
            detail="Internal regional comparison error."
        )


# ==========================================
# 10. APPLICATION STARTUP
# ==========================================

@app.on_event("startup")
async def startup_event():

    logger.info("=" * 50)
    logger.info("EARTH SYSTEMS TREND DETECTIVE")
    logger.info("Scientific Computing API Started")
    logger.info("Version: %s", APP_VERSION)
    logger.info("Status: READY")
    logger.info("=" * 50)


# ==========================================
# 11. LOCAL DEVELOPMENT SERVER
# ==========================================

if __name__ == "__main__":

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
