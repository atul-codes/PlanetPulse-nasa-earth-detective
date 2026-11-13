# 🚀 Vercel Deployment Guide — Earth Systems Trend Detective

Since you have **already deployed** the backend and frontend as two separate Vercel projects, this guide covers only the **configuration updates** needed after integrating the new NASA Resources API, multi-format date parsing, and diagnostic improvements.

---

## 📋 Pre-Deployment Checklist

Before pushing, verify locally:

```bash
cd backend
python test_backend.py    # Must show: 74 passed, 0 failed
```

---

## 1️⃣ Backend (Python FastAPI) — Vercel Update

### Step 1: Push the new code

Your backend Vercel project watches a Git branch. Push the latest changes:

```bash
git add .
git commit -m "feat: NASA resources API, multi-format date parsing, diagnostic improvements"
git push origin main
```

Vercel will auto-detect the push and start a new deployment.

### Step 2: Verify `backend/vercel.json`

Your backend `vercel.json` is already correct — no changes needed:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

> **Important:** Make sure in Vercel Dashboard → your backend project → **Settings → General → Root Directory** is set to `backend`.

### Step 3: Set Environment Variables in Vercel Dashboard

Go to **Vercel Dashboard → Backend Project → Settings → Environment Variables** and add/verify:

| Variable | Value | Required? |
| --- | --- | --- |
| `FRONTEND_ORIGINS` | `https://your-frontend-name.vercel.app` | ✅ Yes |
| `NASA_API_KEY` | Your NASA API key (or `DEMO_KEY`) | Optional |

**How to set:**

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your **backend** project
3. Go to **Settings** → **Environment Variables**
4. Add `FRONTEND_ORIGINS` with value = your frontend's Vercel URL
5. Example: `https://nasa-earth-detective.vercel.app,https://nasa-earth-detective-main.vercel.app`
6. Select **Production**, **Preview**, **Development** checkboxes
7. Click **Save**

### Step 4: Redeploy

After setting env vars, trigger a redeploy:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

### Step 5: Verify New Endpoints

Once deployed, test these URLs in your browser (replace `your-backend` with your actual Vercel domain):

```
https://your-backend.vercel.app/
https://your-backend.vercel.app/health
https://your-backend.vercel.app/api/resources
https://your-backend.vercel.app/api/resources/giovanni
https://your-backend.vercel.app/docs
```

Expected responses:

- `/` → JSON with `title: "Earth Systems Trend Detective"`
- `/health` → `nasaResourcesCount: 12`
- `/api/resources` → `count: 12` with all 12 NASA resources
- `/api/resources/giovanni` → Giovanni resource details
- `/docs` → Swagger interactive API documentation

---

## 2️⃣ Frontend (Next.js) — Vercel Update

### Step 1: Push the new code

Same as backend — push triggers auto-deploy:

```bash
git add .
git commit -m "feat: NASA resources catalog, slope unit fixes, backend diagnostics"
git push origin main
```

### Step 2: Verify Root Directory

In Vercel Dashboard → your frontend project → **Settings → General → Root Directory**, make sure it's set to `frontend`.

### Step 3: Set Environment Variables in Vercel Dashboard

Go to **Vercel Dashboard → Frontend Project → Settings → Environment Variables** and add/verify:

| Variable | Value | Required? |
| --- | --- | --- |
| `PYTHON_BACKEND_URL` | `https://your-backend-project.vercel.app` | ✅ **Critical** |
| `NASA_API_KEY` | Your NASA API key (or `DEMO_KEY`) | Optional |

**This is the most important step!** Without `PYTHON_BACKEND_URL`, the frontend will always fall back to the JS engine instead of using the Python SciPy backend.

**How to set:**

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your **frontend** project
3. Go to **Settings** → **Environment Variables**
4. Add `PYTHON_BACKEND_URL` with your backend's **full Vercel URL** (including `https://`)
5. Example: `https://nasa-earth-detective-backend.vercel.app`
6. ⚠️ **DO NOT add a trailing slash** — correct: `https://x.vercel.app`, wrong: `https://x.vercel.app/`
7. Select **Production**, **Preview**, **Development** checkboxes
8. Click **Save**

### Step 4: Redeploy

After setting env vars, trigger a redeploy (same as backend — Deployments → ⋯ → Redeploy).

### Step 5: Verify Everything Works

1. Open your frontend URL in browser
2. Go to **Dashboard** → select a preset (e.g., "Lucknow")
3. Click **Execute Investigation**
4. In the **Verdict Card**, look for the engine badge:
   - `⚡ Python (SciPy)` in **green** = Backend is connected ✅
   - `JS Engine (Fallback)` in **amber** = Backend not reachable (hover for diagnostic)
5. Go to **Data Sources** page → verify the 12 NASA resource cards appear with filter tabs

---

## 3️⃣ CORS Troubleshooting

If you see CORS errors in browser console after deploying:

### Problem

Frontend at `https://frontend.vercel.app` gets blocked calling `https://backend.vercel.app/api/analyze`.

### Solution

In the **backend** project's Vercel environment variables, update `FRONTEND_ORIGINS`:

```
FRONTEND_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app
```

Include **both** the production URL and any preview/branch URLs you use.

> **Note:** The backend already has a regex rule that allows all `*.vercel.app` origins (`allow_origin_regex=r"^https:\/\/.*\.vercel\.app$"`), so most Vercel-to-Vercel calls should work out of the box. But if you have a custom domain, add it to `FRONTEND_ORIGINS`.

---

## 4️⃣ Quick Reference: All Environment Variables

### Backend Project (Vercel)

| Variable | Purpose | Example Value |
| --- | --- | --- |
| `FRONTEND_ORIGINS` | CORS allowed origins (comma-separated) | `https://nasa-earth-detective.vercel.app` |
| `NASA_API_KEY` | NASA Open API key (optional) | `DEMO_KEY` |

### Frontend Project (Vercel)

| Variable | Purpose | Example Value |
| --- | --- | --- |
| `PYTHON_BACKEND_URL` | Full URL of deployed backend | `https://nasa-backend.vercel.app` |
| `NASA_API_KEY` | For Landsat satellite imagery | `DEMO_KEY` |

---

## 5️⃣ New Endpoints Added (What Changed)

These are the **new endpoints** your backend now serves that weren't there before:

| Endpoint | Method | What's New |
| --- | --- | --- |
| `/api/resources` | GET | Returns all 12 NASA Space Apps challenge resources. Supports `?category=` and `?capability=` filters. |
| `/api/resources/{id}` | GET | Returns a single resource by ID (e.g., `giovanni`, `appeears`, `csa-sar-tutorial`). |
| `/health` | GET | Now includes `nasaResourcesCount: 12` in response. |
| `/api/analyze` | POST | Now accepts all date formats: `YYYY`, `YYYYMM`, `YYYY-MM`, `YYYY/MM`, `YYYY-MM-DD`, ISO 8601. No more rejected monthly observations. |

---

## 6️⃣ Verification Checklist After Deploy

After both projects are redeployed, verify:

- [ ] `https://backend.vercel.app/health` returns `status: "healthy"` and `nasaResourcesCount: 12`
- [ ] `https://backend.vercel.app/api/resources` returns 12 resources
- [ ] `https://backend.vercel.app/docs` loads Swagger UI
- [ ] Frontend loads without errors
- [ ] Dashboard investigation shows `⚡ Python (SciPy)` badge (green)
- [ ] Data Sources page shows 12 NASA resource cards with working filters
- [ ] Hovering the engine badge shows no diagnostic errors
- [ ] Slopes show realistic values (e.g., ~+0.04°C/yr, NOT +0.48°C/yr)
