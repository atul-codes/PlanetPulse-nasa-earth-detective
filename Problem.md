# Earth Systems Trend Detective — Technical Audit & Problem Log

This document provides a comprehensive report on:

1. **The verification and usage of all 12 official NASA and partner resource links** provided for the *NASA Space Apps Challenge: Be An Earth System Trend Detective!*.
2. **All technical issues discovered across the codebase**, their root causes, and their exact solutions.

---

## 🛰️ 1. Verification of the 12 NASA & Partner Resource Links

All 12 links have been cataloged, structured, and integrated into both the **Python FastAPI Backend** (`/api/resources`) and the **Next.js Frontend** (`/compare` - Data Sources page):

| # | Resource / Link | Agency / Source | Status in Project | Integration Purpose |
| --- | --- | --- | --- | --- |
| **1** | [`https://giovanni.gsfc.nasa.gov/`](https://giovanni.gsfc.nasa.gov/) | NASA GES DISC | **Integrated** | Core NASA Earth data visualization & time-series download portal. Exposed in `/api/resources/giovanni`. |
| **2** | [`https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series`](https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series) | NASA GES DISC / LDAS | **Integrated** | NASA Hydrology Data Rods. Provides on-the-fly time-series for multi-layer soil moisture, runoff, and ET. |
| **3** | [`https://appeears.earthdatacloud.nasa.gov/`](https://appeears.earthdatacloud.nasa.gov/) | NASA LP DAAC / USGS | **Integrated** | Application for Extracting and Exploring Analysis Ready Samples (MODIS/VIIRS vegetation time-series). |
| **4** | [`https://www.ncei.noaa.gov/cdo-web/`](https://www.ncei.noaa.gov/cdo-web/) | NOAA NCEI / NCDC | **Integrated** | Climate Data Online. Historical ground station observations (GHCN-Daily) & station mapping tool. |
| **5** | [`https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf`](https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf) | NASA NTRS | **Integrated** | Official NASA Technical Publication on SeaWiFS chlorophyll time-series & statistical significance testing. |
| **6** | [`https://climexp.knmi.nl/`](https://climexp.knmi.nl/) | KNMI / WMO | **Integrated** | Climate Explorer for research-grade statistical time-series correlation, trend fitting, and reanalysis. |
| **7** | [`https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b`](https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b) | Methodology Reference | **Integrated** | Technical reference guide for non-parametric Mann-Kendall test, Sen's slope estimator, and changepoint detection. |
| **8** | [`https://donnees-data.asc-csa.gc.ca/en/dataset/rcm`](https://donnees-data.asc-csa.gc.ca/en/dataset/rcm) | Canadian Space Agency (CSA) | **Integrated** | RADARSAT Constellation Mission (RCM) Open Data portal for C-band SAR radar imagery & wetland tracking. |
| **9** | [`http://geo.ca/`](http://geo.ca/) | Natural Resources Canada | **Integrated** | Canada's national open geospatial platform providing spatial environmental layers and WMS endpoints. |
| **10** | [`https://www.asc-csa.gc.ca/eng/satellites/swot/`](https://www.asc-csa.gc.ca/eng/satellites/swot/) | NASA / CNES / CSA / UKSA | **Integrated** | Surface Water and Ocean Topography (SWOT) satellite mission altimetry for continental lakes and rivers. |
| **11** | [`https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp`](https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp) | Canadian Space Agency (CSA) | **Integrated** | Science showcase on ecosystem vulnerability, permafrost thaw, and wetland surveillance from orbit. |
| **12** | [`https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial`](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial) | CSA Open Source | **Integrated** | Open-source Python & Jupyter tutorial repository for radar image processing and temporal change detection. |

---

## 🛠️ 2. Comprehensive Problem Log & Solutions

### Problem 1: Strict ISO Date Parsing Rejected Monthly NASA Observations

* **Location:** `backend/app/services/data_processor.py`, `backend/app/services/trend_analyzer.py`, and `backend/app/services/seasonal_analysis.py`
* **The Problem:** NASA POWER, MODIS, and other Earth science observations frequently arrive as monthly strings (`"YYYY-MM"`, `"YYYY/MM"`, or compact `"YYYYMM"`), annual strings (`"YYYY"`), or mixed formats. The backend parsers originally relied on Python's strict `datetime.fromisoformat()`. Without a day component (`-DD`), Python threw `ValueError: Invalid isoformat string: '2005-01'`.
* **Impact:** Every single monthly or annual observation was rejected as an invalid record. The backend returned `{"status": "INSUFFICIENT_DATA", "observationCount": 0}`, causing the frontend analysis to fail or silently fall back to client-side JS computations.
* **Solution:** Implemented a unified, robust multi-format date parser across all three backend services (`data_processor.py`, `trend_analyzer.py`, and `seasonal_analysis.py`):
  1. Handled `datetime` and `date` object instances directly.
  2. Supported 4-digit years (`YYYY` -> `Jan 1 UTC`).
  3. Supported 6-digit compact months (`YYYYMM` -> `YYYY-MM-01 UTC`).
  4. Normalized slashes (`/`) to hyphens (`-`) for `YYYY/MM` and `YYYY/MM/DD`.
  5. Supported 2-part dates (`YYYY-MM` or `YYYY-M` -> `YYYY-MM-01 UTC`).
  6. Supported 3-part dates (`YYYY-MM-DD` or non-padded `YYYY-M-D`).
  7. Handled ISO 8601 strings with/without timezone offsets (`Z` -> `+00:00`).
  8. Provided fallback `strptime` patterns and normalized all output to UTC.
* **Status:** **Resolved & Verified.** (Verified with automated unit tests across all 3 services).

---

### Problem 2: Double-Annualization of Slopes in UI Verdict Cards & Comparison Dashboard

* **Location:** `frontend/src/components/dashboard/VerdictCard.js`, `frontend/src/app/compare/page.js`, and `frontend/src/lib/statistics/trendEngine.js`
* **The Problem:** The frontend verdict cards and comparison table had hardcoded multiplication by 12:

  ```javascript
  const senPerYear = Number((senSlope.slope * 12).toFixed(4));
  const lrPerYear = Number((linearRegression.slope * 12).toFixed(4));
  ```

  While the JS fallback engine historically measured time in monthly index steps, the Python backend (`trend_analyzer.py`) computes elapsed decimal time directly in **years** (`slopeUnit: "value/year"`).
* **Impact:** Whenever the Python backend ran, the reported rate of change was multiplied by 12, displaying a warming/cooling rate **1200% higher** than real data (e.g., $+0.48^\circ\text{C}$/yr instead of $+0.04^\circ\text{C}$/yr).
* **Solution:**
  1. Made slope annualization conditional based on `slopeUnit`:
  ```javascript
  const senPerYear = senSlope.slope !== undefined
    ? Number((senSlope.slopeUnit === 'value/year' ? senSlope.slope : senSlope.slope * 12).toFixed(4))
    : null;
  const lrPerYear = linearRegression.slope !== undefined
    ? Number((linearRegression.slopeUnit === 'value/year' ? linearRegression.slope : linearRegression.slope * 12).toFixed(4))
    : null;
  ```
  2. Applied identical conditional annualization to `frontend/src/app/compare/page.js` (`senSlopeYear`).
  3. Added explicit `slopeUnit: 'value/month'` in `frontend/src/lib/statistics/trendEngine.js` for full contract parity.
  4. Formatted 95% Confidence Bounds (`ci95`) in `VerdictCard.js` with the corresponding annualization scaling factor.

* **Status:** **Resolved & Verified.**

---

### Problem 3: Vercel Multi-Service Entrypoint Misconfiguration

* **Location:** `vercel.json` (line 7)
* **The Problem:** The suggested Vercel configuration had `"entrypoint": "main.py"`. Vercel's ASGI/FastAPI runtime expects the entrypoint in the standard Python ASGI syntax: `"module:variable"` (e.g. `"main:app"` or `"app.main:app"`).
* **Impact:** Vercel deployed the container but could not find the ASGI handler, resulting in immediate HTTP 500 or 502 Bad Gateway errors on backend routes.
* **Solution:**
  1. Updated `vercel.json` to `"entrypoint": "main:app"`.
  2. Created a root-level shim in `backend/main.py`:

     ```python
     from app.main import app
     ```

  3. Added `backend/api/index.py` and `backend/vercel.json` for standalone Vercel deployments.
* **Status:** **Resolved & Verified.**

---

### Problem 4: `requirements.txt` Bloat Exceeding Serverless Limits

* **Location:** `backend/requirements.txt`
* **The Problem:** The original `requirements.txt` was an unpruned environment dump containing **73 packages**, including `openai`, `tokenizers`, `tiktoken`, `litellm`, `statsmodels`, `huggingface_hub`, and an unreleased development wheel `wrapt==2.6.0.dev1`.
* **Impact:**
  * Vercel functions have an uncompressed size limit of **250 MB**. The bloated packages exceeded this limit.
  * Development wheels without Linux pre-built binaries caused pip install build timeouts on Amazon Linux.
  * The backend failed to build, forcing the frontend to fall back to the JS engine.
* **Solution:** Pruned `requirements.txt` down to the **7 packages actually imported by the backend**:

  ```txt
  fastapi>=0.100.0
  uvicorn>=0.20.0
  pydantic>=2.0.0
  numpy>=1.24.0
  scipy>=1.10.0
  pymannkendall>=1.4.3
  python-dotenv>=1.0.0
  ```

* **Status:** **Resolved & Verified.**

---

### Problem 5: Next.js Public Folder Path Resolution Bug in Navbar

* **Location:** `frontend/src/components/layout/Navbar.js` (line 45)
* **The Problem:** The logo image tag was written as:

  ```jsx
  <Image src="/public/nasa-logo.svg" width={50} height={50} />
  ```

  In Next.js, all files placed inside the `public/` directory are mounted and served directly at the **root (`/`)**.
* **Impact:** The browser sent a request to `GET /public/nasa-logo.svg`, which resulted in **404 Not Found** and a broken/invisible logo in the header.
* **Solution:**
  1. Corrected the path to `/nasa-logo.svg`.
  2. Added `unoptimized` and `priority` flags to ensure crisp vector rendering without SVG optimization errors.
* **Status:** **Resolved & Verified.**

---

### Problem 6: Silent Fallback Masking Backend Errors

* **Location:** `frontend/src/lib/statistics/trendEngine.js` (line 348) & `frontend/src/components/dashboard/VerdictCard.js`
* **The Problem:** The `trendEngine.js` bridge originally wrapped the call to Python FastAPI in a `try...catch` block that caught all errors and immediately fell back to the Pure JS engine without surfacing any error details.
* **Impact:** When deployed to Vercel or running locally without backend, users saw the badge stay on **`JS Engine`** with zero indication of whether the failure was due to network timeout, missing environment variables, 404, or 502 Bad Gateway.
* **Solution:**
  1. Added granular `backendDiagnostics` capturing exact failure modes (Timeout, HTTP error status code with response body snippet, and connection refused).
  2. Enhanced `VerdictCard.js` with:
     - Live state badge indicator: `⚡ Python (SciPy)` (green when Online) vs `JS Engine (Fallback)` (amber with status dot).
     - Hover tooltip surfacing full diagnostic string (`computedBy | Diagnostic: ...`).
     - Expandable **"Detailed 95% Confidence Bounds"** drawer containing a dedicated **Backend Diagnostic Note** section with full text for debugging.
  3. Propagated diagnostics to `frontend/src/app/compare/page.js` comparison results.
* **Status:** **Resolved & Verified.**

---

### Problem 7: ModuleNotFoundError on Standalone Python Execution

* **Location:** `backend/app/main.py`, `backend/main.py`, and `backend/api/index.py`
* **The Problem:** When running unit tests, CI pipelines, or launching uvicorn from outside the `backend/` folder (such as from the project root or a serverless runner), statements like `from app.services.data_processor import ...` failed with `ModuleNotFoundError: No module named 'app'` because `backend/` was not in Python's `sys.path`, and `app` lacked explicit `__init__.py` package markers.
* **Impact:** Broke automated testing, local development scripts, and standalone command-line executions when launched from outside the immediate folder.
* **Solution:**
  1. Added dynamic directory resolution at the top of `backend/app/main.py`, `backend/main.py`, and `backend/api/index.py`:

     ```python
     import os, sys
     _backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
     if _backend_dir not in sys.path:
         sys.path.insert(0, _backend_dir)
     ```

  2. Added formal Python package initializers `backend/app/__init__.py` and `backend/app/services/__init__.py` to eliminate implicit namespace packaging issues across different Python versions.
  3. Verified execution from repository root, `backend/`, `backend/app/`, and external working directories.

* **Status:** **Resolved & Verified.**

---

### Problem 8: Absence of Official Space Apps Resource Catalog in Backend

* **Location:** `backend/app/services/nasa_resources.py` & `frontend/src/app/compare/page.js`
* **The Problem:** The project originally lacked an API service to expose and interlink the 12 official challenge resources (Giovanni, Data Rods, AppEEARS, CDO, SeaWiFS publication, Climate Explorer, CSA SAR tutorial, SWOT, RCM, Geo.ca, CSA Ecosystem monitoring, and Statistical trend methodology).
* **Impact:** Users and judges had no programmatic or visual way to explore the NASA/CSA provenance catalog within the tool.
* **Solution:**
  1. Created `backend/app/services/nasa_resources.py` with structured metadata for all 12 resources (IDs, agency affiliations, capabilities, key variables, protocols, and outbound links).
  2. Exposed REST endpoints `GET /api/resources` (with optional `?category=` and `?capability=` query parameters) and `GET /api/resources/{resource_id}` in FastAPI.
  3. Created Next.js API route `frontend/src/app/api/nasa/resources/route.js` with Python microservice proxying and resilient local registry fallback.
  4. Built an interactive visual grid of 12 resource cards on the Data Sources page (`/compare`) featuring category filter tabs (`All Portals`, `NASA Tools`, `NOAA & Literature`, `CSA & Satellites`, `Statistical Guide`) and live keyword search.
* **Status:** **Resolved & Verified.**

---

## 🚀 3. Summary of Project Health

With these 8 resolutions in place:

1. **The Python FastAPI Backend** starts cleanly, handles all observation formats without dropping records, and serves the complete 12-resource NASA catalog.
2. **The Next.js Frontend** renders crisp NASA typography, handles multi-region comparisons, and communicates seamlessly with the Python service.
3. **The Deployment Pipeline** is optimized for Vercel with slim dependencies, accurate entrypoints, and zero bundle-size violations.
