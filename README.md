# 🌍 Earth Systems Trend Detective
### NASA Space Apps Challenge – Official Scientific Investigation Platform

> **Discover. Investigate. Analyze. Understand.**

**Earth Systems Trend Detective** is an interactive, production-grade scientific investigation platform designed to analyze long-term environmental and climate shifts across global coordinates. The platform integrates **real NASA satellite observations** with **robust non-parametric statistical analysis** (Mann-Kendall, Theil-Sen Median Slope, and OLS Linear Regression).

---

## 🏗️ System Architecture

The project features a **hybrid resilient architecture**:
1. **Frontend (Next.js 14 App Router)** directly interfaces with NASA public APIs for real-time observation retrieval and satellite imagery.
2. **Scientific Backend (Python FastAPI)** provides rigorous statistical analysis using NumPy, SciPy, and PyMannKendall.
3. **Embedded Fallback (Pure JavaScript)** ensures that if the Python backend is unavailable, the frontend seamlessly computes full Mann-Kendall and Theil-Sen calculations locally with zero downtime.

```
nasa-earth-detective-main/
├── backend/                              # Python Scientific Microservice
│   ├── app/
│   │   ├── main.py                       # FastAPI application & API endpoints
│   │   ├── core/
│   │   │   └── config.py                 # Configuration settings
│   │   └── services/
│   │       ├── data_processor.py         # NASA observation cleaning & ISO/YYYY-MM date parsing
│   │       ├── trend_analyzer.py         # PyMannKendall, Theil-Sen & OLS linear regression
│   │       └── seasonal_analysis.py      # Monthly climatological anomaly deseasonalization
│   ├── tests/                            # Scientific test suites
│   ├── requirements.txt                  # Python dependencies
│   └── .env                              # Backend environment variables
│
├── frontend/                             # Next.js Full-Stack Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js                   # Scientific landing page
│   │   │   ├── dashboard/page.js         # Interactive 3-column scientific dashboard
│   │   │   ├── investigate/page.js       # 7-Step guided scientific investigation wizard
│   │   │   ├── compare/page.js           # Multi-region geospatial comparative analysis
│   │   │   ├── reports/page.js           # Scientific dossier generator (CSV / printable PDF export)
│   │   │   └── api/                      # Next.js API Routes (NASA Gateway & Stats Proxy)
│   │   │       ├── analysis/route.js     # Statistical analysis orchestrator (FastAPI / JS fallback)
│   │   │       ├── nasa/observations/    # NASA POWER & GLDAS time-series data gateway
│   │   │       ├── nasa/imagery/         # NASA GIBS WMS & Landsat satellite imagery
│   │   │       └── ai/assistant/         # Contextual AI Earth Science Detective assistant
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── EarthGlobe.js         # Three.js WebGL interactive 3D Earth globe
│   │   │   │   ├── TimeSeriesChart.js    # Recharts time-series with regression & Sen's slopes
│   │   │   │   ├── VerdictCard.js        # Statistical verdict banner with live engine badge
│   │   │   │   ├── SatelliteImageryViewer.js # NASA GIBS / Landsat true-color imagery viewer
│   │   │   │   ├── YearTable.js          # Annual anomaly breakdown with CSV export
│   │   │   │   └── AiAssistantModal.js   # Contextual AI Earth science assistant modal
│   │   │   └── layout/
│   │   │       └── Navbar.js             # Mission navigation & preset switcher
│   │   └── lib/
│   │       ├── nasa/                     # NASA dataset provider, registry, & GIBS clients
│   │       └── statistics/               # JavaScript statistical trend engine & Python bridge
│   ├── package.json                      # Frontend dependencies & scripts
│   └── .env.example                      # Frontend environment variable template
└── README.md
```

---

## 🛰️ 1. NASA Datasets & Provenance

The platform directly interfaces with NASA Earth science data archives with **no synthetic or artificial data**:

| Environmental Variable | Mission / Dataset Source | Spatial Resolution | Temporal Span | Scientific Parameter |
| :--- | :--- | :--- | :--- | :--- |
| **Air Temperature (2m)** | NASA POWER / MERRA-2 Reanalysis | 0.5° × 0.5° (~50 km) | 1981 – Present | `T2M`, `T2M_MAX`, `T2M_MIN` (°C) |
| **Bias-Corrected Precipitation** | NASA POWER / MERRA-2 & GPM | 0.5° × 0.5° | 1981 – Present | `PRECTOTCORR` (mm/month) |
| **Relative Humidity (2m)** | NASA POWER Project | 0.5° × 0.5° | 1981 – Present | `RH2M` (%) |
| **MODIS Vegetation Index (NDVI)**| NASA Terra Satellite (MOD13 Composite) | 250m – 1 km | 2000 – Present | Normalized Difference Index (-1 to +1) |
| **Root-Zone Soil Moisture** | NASA GLDAS Noah Land Surface Model | 0.25° × 0.25° (~25 km)| 2000 – Present | Volumetric Water Content (kg/m²) |
| **Satellite Imagery** | NASA GIBS (Global Imagery Browse Services) & Landsat Open API | High Resolution | Daily / Near Real-Time | MODIS Terra, VIIRS Suomi NPP, Black Marble |

> **Missing Data Sentinel Handling:** All NASA `-999.0` missing-data sentinels are strictly filtered out without artificial interpolation.

---

## 📊 2. Scientific Statistical Methods

1. **Mann-Kendall Non-Parametric Rank Test:**
   - Tests for monotonic increasing or decreasing trend without assuming normality.
   - Computes $S$-statistic, tie-corrected variance $\text{Var}(S)$, standardized $Z$-score, and exact two-tailed $p$-value ($\alpha = 0.05$).
2. **Theil-Sen Robust Median Slope Estimator:**
   - Computes median of slopes across all pairwise points:
     $$\beta = \text{Median}\left( \frac{y_j - y_i}{j - i} \right) \quad \forall \, i < j$$
   - Insensitive to sensor dropouts and extreme meteorological anomalies.
3. **Ordinary Least Squares (OLS) Linear Regression:**
   - Computes rate of change, intercept, $R^2$ variance, standard error, and Student's $t$-test significance.
4. **Climatological Deseasonalization:**
   - Subtracts the long-term 12-month monthly mean cycle to uncover true underlying multidecadal signals.

---

## 🚀 3. Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **Python**: 3.10 or later

---

### Step 1: Run the Python Backend (Optional but Recommended)
The Python microservice handles high-performance statistical processing with SciPy and PyMannKendall.

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional) Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Documentation:** `http://127.0.0.1:8000/docs`
* **Health Check:** `http://127.0.0.1:8000/health`

---

### Step 2: Run the Next.js Frontend
In a **new terminal window**:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```

* Open your browser and navigate to **`http://localhost:3000`**.
* Explore the **Interactive Dashboard** at **`http://localhost:3000/dashboard`**.

---

## ⚡ 4. Live Engine Indicator

The dashboard automatically detects the backend status and informs the user:
- **`⚡ Python (SciPy)`** (Green Badge): Results calculated by the Python FastAPI backend via NumPy, SciPy, and PyMannKendall.
- **`JS Engine`** (Gray Badge): Automatically active when the backend is offline, running the embedded JavaScript statistical engine for seamless operation.

---

## 🧪 5. Demonstration Presets

Clickable benchmark investigations available directly in the application:

1. **Indo-Gangetic Plain Heat Warming:**
   - *Target:* Lucknow, India ($26.85^\circ\text{N}, 80.95^\circ\text{E}$)
   - *Dataset:* NASA POWER Air Temperature (`T2M`)
   - *Signal:* Statistically significant warming trend ($p < 0.001$, $+0.038^\circ\text{C}$/yr).
2. **Amazon Basin Canopy Degradation:**
   - *Target:* Rondônia, Brazil ($-10.50^\circ\text{S}, -62.80^\circ\text{W}$)
   - *Dataset:* MODIS Terra NDVI
   - *Signal:* Long-term vegetative canopy decline.
3. **Arctic Polar Amplification:**
   - *Target:* Svalbard / Barents Sea ($78.22^\circ\text{N}, 15.63^\circ\text{E}$)
   - *Dataset:* NASA POWER / MERRA-2 Arctic Air Temperature
   - *Signal:* Rapid thermal increase at $>3\times$ global mean rate.
4. **Indian Subcontinent Monsoon Variability:**
   - *Target:* Nagpur, Maharashtra, India ($21.15^\circ\text{N}, 79.09^\circ\text{E}$)
   - *Dataset:* NASA POWER & GPM IMERG Precipitation
5. **Sahel Agricultural Soil Moisture Depletion:**
   - *Target:* Niamey, Niger ($13.51^\circ\text{N}, 2.13^\circ\text{E}$)
   - *Dataset:* NASA GLDAS Noah Topsoil Moisture (0–10 cm)

---

## 📄 6. License & Space Apps Attribution
Developed for the **NASA International Space Apps Challenge**.
Data provided courtesy of the **NASA Langley Research Center POWER Project**, **NASA Earth Science Data and Information System (ESDIS)**, **NASA GIBS**, and the **MODIS / GLDAS Science Teams**.

