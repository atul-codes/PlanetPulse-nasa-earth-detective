/**
 * Pure JavaScript Scientific Trend Analysis Engine
 * Implements:
 * - Mann-Kendall Non-parametric Trend Test (S, Var(S), Z, p-value)
 * - Theil-Sen Non-parametric Slope Estimator & 95% Confidence Interval
 * - Ordinary Least Squares (OLS) Linear Regression (slope, intercept, R², p-value, standard error)
 * - Seasonal Climatological Decomposition (Deseasonalization)
 * - Seamless integration with Python FastAPI backend with zero-latency fallback
 */

// Error function approximation for normal cumulative distribution
function erf(x) {
  // Abramowitz and Stegun formula 7.1.26
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

// Normal Cumulative Distribution Function (CDF)
function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Student-t CDF approximation for regression p-value
function studentTCDF(t, df) {
  if (df <= 0) return 1.0;
  // For df > 30, student t is virtually indistinguishable from normal distribution
  if (df > 30) {
    return normalCDF(t);
  }
  const x = df / (df + t * t);
  // Approximation
  return normalCDF(t * Math.sqrt((df - 2) / Math.max(1, df)));
}

/**
 * 1. Mann-Kendall Non-Parametric Trend Test
 * Tests for monotonic increasing or decreasing trend in a time-series without assuming normality.
 */
export function calculateMannKendall(values, alpha = 0.05) {
  const n = values.length;
  if (n < 4) {
    return {
      trend: 'no trend',
      sStatistic: 0,
      varS: 0,
      zScore: 0,
      pValue: 1.0,
      isSignificant: false,
      message: 'Minimum 4 points required for Mann-Kendall test.'
    };
  }

  // Calculate S statistic
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = values[j] - values[i];
      if (diff > 1e-7) s += 1;
      else if (diff < -1e-7) s -= 1;
    }
  }

  // Calculate variance of S with tie corrections
  const tieMap = new Map();
  for (const v of values) {
    const rounded = Number(v.toFixed(4));
    tieMap.set(rounded, (tieMap.get(rounded) || 0) + 1);
  }

  let tieCorrection = 0;
  for (const count of tieMap.values()) {
    if (count > 1) {
      tieCorrection += count * (count - 1) * (2 * count + 5);
    }
  }

  const varS = (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18;

  // Calculate Z score
  let z = 0;
  if (varS > 0) {
    if (s > 0) z = (s - 1) / Math.sqrt(varS);
    else if (s < 0) z = (s + 1) / Math.sqrt(varS);
    else z = 0;
  }

  // Two-tailed p-value
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  const isSignificant = pValue < alpha;

  let trend = 'no trend';
  if (isSignificant) {
    trend = z > 0 ? 'increasing' : 'decreasing';
  }

  return {
    trend,
    sStatistic: s,
    varS,
    zScore: Number(z.toFixed(4)),
    pValue: Number(pValue.toFixed(6)),
    isSignificant
  };
}

/**
 * 2. Theil-Sen Median Slope Estimator
 * Robust non-parametric estimate of the slope rate per time step
 */
export function calculateSensSlope(values, alpha = 0.05) {
  const n = values.length;
  if (n < 2) return { slope: 0, ci95: [0, 0] };

  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      slopes.push((values[j] - values[i]) / (j - i));
    }
  }

  slopes.sort((a, b) => a - b);
  const totalSlopes = slopes.length;
  const mid = Math.floor(totalSlopes / 2);
  const medianSlope = totalSlopes % 2 === 0
    ? (slopes[mid - 1] + slopes[mid]) / 2
    : slopes[mid];

  // 95% Confidence Interval for Sen's Slope
  const zCritical = 1.95996; // 95% normal quantile
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;
  const cAlpha = zCritical * Math.sqrt(varS);

  const k1 = Math.max(0, Math.min(totalSlopes - 1, Math.floor((totalSlopes - cAlpha) / 2)));
  const k2 = Math.max(0, Math.min(totalSlopes - 1, Math.ceil((totalSlopes + cAlpha) / 2)));

  return {
    slope: Number(medianSlope.toFixed(6)),
    slopeUnit: 'value/month',
    ci95: [
      Number(slopes[k1].toFixed(6)),
      Number(slopes[k2].toFixed(6))
    ]
  };
}

/**
 * 3. Ordinary Least Squares (OLS) Linear Regression
 */
export function calculateLinearRegression(values, alpha = 0.05) {
  const n = values.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: values[0] || 0,
      rSquared: 0,
      pValue: 1.0,
      standardError: 0,
      ci95: [0, 0],
      totalChangeAbsolute: 0,
      totalChangePercent: 0
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) {
    return {
      slope: 0,
      intercept: sumY / n,
      rSquared: 0,
      pValue: 1.0,
      standardError: 0,
      ci95: [0, 0],
      totalChangeAbsolute: 0,
      totalChangePercent: 0
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Residual Sum of Squares (RSS) & R-squared
  let rss = 0;
  let tss = 0;
  const meanY = sumY / n;
  for (let i = 0; i < n; i++) {
    const fitted = intercept + slope * i;
    rss += Math.pow(values[i] - fitted, 2);
    tss += Math.pow(values[i] - meanY, 2);
  }

  const rSquared = tss > 0 ? Math.max(0, Math.min(1, 1 - rss / tss)) : 0;
  const df = n - 2;
  const varianceResidual = df > 0 ? rss / df : 0;
  const standardError = df > 0 && sumX2 - (sumX * sumX) / n > 0
    ? Math.sqrt(varianceResidual / (sumX2 - (sumX * sumX) / n))
    : 0;

  const tStat = standardError > 0 ? slope / standardError : 0;
  const pValue = df > 0 ? 2 * (1 - studentTCDF(Math.abs(tStat), df)) : 1.0;

  const tCritical = 1.96; // 95% level
  const ciLower = slope - tCritical * standardError;
  const ciUpper = slope + tCritical * standardError;

  const startFitted = intercept;
  const endFitted = intercept + slope * (n - 1);
  const totalChangeAbs = endFitted - startFitted;
  const totalChangePct = Math.abs(startFitted) > 1e-6
    ? (totalChangeAbs / Math.abs(startFitted)) * 100
    : 0;

  return {
    slope: Number(slope.toFixed(6)),
    slopeUnit: 'value/month',
    intercept: Number(intercept.toFixed(4)),
    rSquared: Number(rSquared.toFixed(4)),
    pValue: Number(pValue.toFixed(6)),
    standardError: Number(standardError.toFixed(6)),
    ci95: [Number(ciLower.toFixed(6)), Number(ciUpper.toFixed(6))],
    totalChangeAbsolute: Number(totalChangeAbs.toFixed(4)),
    totalChangePercent: Number(totalChangePct.toFixed(2))
  };
}

/**
 * 4. Deseasonalization (Climatological Monthly Anomaly Decomposition)
 */
export function deseasonalizeSeries(observations) {
  if (observations.length < 12) {
    return {
      status: 'SKIPPED',
      series: observations,
      seasonalCycle: {}
    };
  }

  const monthBuckets = {};
  for (let m = 1; m <= 12; m++) monthBuckets[m] = [];

  for (const obs of observations) {
    const month = obs.month || parseInt(String(obs.date).slice(5, 7), 10);
    if (month >= 1 && month <= 12) {
      monthBuckets[month].push(obs.value);
    }
  }

  const monthlyMeans = {};
  for (let m = 1; m <= 12; m++) {
    const arr = monthBuckets[m];
    monthlyMeans[m] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  const totalMean = observations.reduce((a, b) => a + b.value, 0) / observations.length;

  const series = observations.map(obs => {
    const month = obs.month || parseInt(String(obs.date).slice(5, 7), 10) || 1;
    const climatology = monthlyMeans[month] || totalMean;
    const anomaly = obs.value - climatology;
    const deseasonalized = anomaly + totalMean;

    return {
      date: obs.date,
      year: obs.year,
      month: obs.month,
      original: obs.value,
      deseasonalized: Number(deseasonalized.toFixed(3)),
      anomaly: Number(anomaly.toFixed(3)),
      seasonalBaseline: Number(climatology.toFixed(3))
    };
  });

  return {
    status: 'SUCCESS',
    method: 'Climatological Monthly Anomaly Decomposition',
    overallMean: Number(totalMean.toFixed(3)),
    seasonalCycle: monthlyMeans,
    series
  };
}

/**
 * 5. Master Trend Analysis Orchestrator
 * Integrates with Python FastAPI backend if available, or executes pure JS engine
 */
export async function performScientificAnalysis(observations, options = {}) {
  const {
    variableId = 'T2M',
    dataset = 'NASA_POWER',
    alpha = 0.05,
    deseasonalize = false,
    usePythonBackend = true
  } = options;

  let backendDiagnostics = null;

  // Attempt Python FastAPI first if enabled
  if (usePythonBackend && typeof window === 'undefined') {
    const rawBase = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
    const backendBase = rawBase.startsWith('http://') || rawBase.startsWith('https://')
      ? rawBase
      : `https://${rawBase}`;

    let targetUrl = `${backendBase}/api/analyze`;
    try {
      targetUrl = new URL('/api/analyze', backendBase).toString();
    } catch {
      targetUrl = `${backendBase}/api/analyze`;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId,
          dataset,
          observations,
          alpha,
          deseasonalize
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        console.log(`[TrendEngine] Successfully computed via Python FastAPI backend (${targetUrl}).`);
        return {
          ...pyData,
          computedBy: 'Python FastAPI (PyMannKendall & SciPy)',
          engineStatus: 'ONLINE',
          backendDiagnostics: null
        };
      } else {
        const errText = await pyResponse.text();
        backendDiagnostics = `HTTP ${pyResponse.status} from ${targetUrl}: ${errText.slice(0, 120)}`;
        console.warn(`[TrendEngine] Python backend responded with status ${pyResponse.status}:`, errText);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        backendDiagnostics = `Timeout (6000ms) contacting Python backend at ${targetUrl}`;
      } else {
        backendDiagnostics = `Connection error (${targetUrl}): ${err.message}`;
      }
      console.warn(`[TrendEngine] Python backend unavailable (${backendBase}):`, err.message, '- Falling back to JavaScript engine.');
    }
  }

  // Pure JavaScript Scientific Calculation Engine
  const validObs = observations.filter(o => o && o.value !== null && o.value > -900 && !isNaN(o.value));
  validObs.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (validObs.length < 4) {
    return {
      status: 'INSUFFICIENT_DATA',
      trendClassification: 'Insufficient Data',
      observationCount: validObs.length,
      message: 'Fewer than 4 valid observations available for statistical testing.',
      backendDiagnostics,
      engineStatus: 'FALLBACK'
    };
  }

  let workingObs = validObs;
  let seasonalProfile = null;

  if (deseasonalize) {
    seasonalProfile = deseasonalizeSeries(validObs);
    if (seasonalProfile.status === 'SUCCESS') {
      workingObs = seasonalProfile.series.map(s => ({
        date: s.date,
        year: s.year,
        month: s.month,
        value: s.deseasonalized
      }));
    }
  }

  const values = workingObs.map(o => o.value);
  const mk = calculateMannKendall(values, alpha);
  const sen = calculateSensSlope(values, alpha);
  const lr = calculateLinearRegression(values, alpha);

  // Standardized trend verdict classification
  let trendClassification = 'No clear monotonic trend';
  if (mk.isSignificant) {
    trendClassification = (sen.slope > 0 || lr.slope > 0)
      ? 'Significant Increasing Trend'
      : 'Significant Decreasing Trend';
  } else {
    if (sen.slope > 1e-5 || lr.slope > 1e-5) {
      trendClassification = 'Non-significant Increasing Trend';
    } else if (sen.slope < -1e-5 || lr.slope < -1e-5) {
      trendClassification = 'Non-significant Decreasing Trend';
    }
  }

  const fittedSeries = workingObs.map((obs, idx) => ({
    date: obs.date,
    linear: Number((lr.intercept + lr.slope * idx).toFixed(3)),
    sen: Number((lr.intercept + sen.slope * idx).toFixed(3))
  }));

  return {
    variableId,
    dataset,
    deseasonalizedApplied: deseasonalize,
    seasonalProfile,
    computedBy: 'Embedded Scientific Engine (JS Mann-Kendall & Theil-Sen)',
    engineStatus: 'FALLBACK',
    backendDiagnostics,
    results: {
      status: 'SUCCESS',
      trendClassification,
      isSignificant: mk.isSignificant,
      significanceLevel: alpha,
      observationCount: values.length,
      linearRegression: lr,
      mannKendall: mk,
      senSlope: sen,
      fittedSeries
    },
    cleanedObservations: workingObs
  };
}

