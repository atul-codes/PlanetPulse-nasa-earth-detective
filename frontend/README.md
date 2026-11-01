# 🌍 Earth Systems Trend Detective — Frontend
### NASA Space Apps Challenge – Official Scientific Investigation Platform

> **Discover. Investigate. Analyze. Understand.**

This is the Next.js frontend application for **Earth Systems Trend Detective**. It provides an interactive 3D WebGL Earth globe, time-series visualizations, satellite imagery viewer, and non-parametric statistical hypothesis testing for real NASA Earth observation datasets.

For root repository setup and full documentation, refer to the [Root README](../README.md).

---

## 🚀 Running the Frontend

### Prerequisites
- Node.js v18.0.0 or higher
- npm (or pnpm / yarn)

### Installation & Startup

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🌐 Hybrid Statistical Architecture

1. **NASA Data Fetching:** Directly connects with official NASA public APIs (NASA POWER API, NASA GIBS WMS, NASA Planetary Open API).
2. **Analysis Delegation:** Dispatches time-series observations to the Python FastAPI backend (`http://127.0.0.1:8000/api/analyze`) for SciPy & PyMannKendall analysis.
3. **Embedded Fallback:** If the Python backend is not running, the application automatically falls back to an embedded Pure JavaScript scientific calculation engine (`src/lib/statistics/trendEngine.js`) so that users can continue testing without interruption.

---

## 📁 Key Frontend Directories

- `src/app/page.js`: Scientific landing page
- `src/app/dashboard/page.js`: 3-Column main interactive investigation dashboard
- `src/app/investigate/page.js`: Guided 7-step mission wizard
- `src/app/compare/page.js`: Multi-region comparison view
- `src/app/reports/page.js`: Scientific dossier and printable PDF report generation
- `src/app/api/`: Next.js serverless route handlers for NASA observations, imagery, and analysis dispatch
- `src/components/dashboard/`: Three.js globe, Recharts time-series chart, NASA imagery viewer, and statistical verdict cards
- `src/lib/nasa/`: NASA dataset provider and API adapters
- `src/lib/statistics/`: Mann-Kendall, Sen's slope, and Linear Regression statistical engine
