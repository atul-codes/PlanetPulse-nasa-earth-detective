/**
 * NASA POWER API Client
 * Official API for NASA Langley Research Center Prediction of Worldwide Energy Resources
 * Endpoint: https://power.larc.nasa.gov/api/temporal/monthly/point
 */

// In-memory cache for API queries
const apiCache = new Map();

/**
 * Fetches monthly point time-series from NASA POWER
 * @param {Object} params
 * @param {string} params.parameter NASA parameter (T2M, PRECTOTCORR, RH2M, etc.)
 * @param {number} params.latitude Decimal latitude (-90 to 90)
 * @param {number} params.longitude Decimal longitude (-180 to 180)
 * @param {number} params.startYear Start year (e.g. 2000)
 * @param {number} params.endYear End year (e.g. 2024)
 * @param {string} params.community SB (Sustainable Buildings) or AG (Agroclimatology)
 */
export async function fetchNasaPowerMonthly({
  parameter = 'T2M',
  latitude,
  longitude,
  startYear = 2005,
  endYear = 2024,
  community = 'SB'
}) {
  const lat = parseFloat(latitude).toFixed(4);
  const lon = parseFloat(longitude).toFixed(4);
  const start = parseInt(startYear, 10);
  const end = parseInt(endYear, 10);

  const cacheKey = `POWER_${parameter}_${lat}_${lon}_${start}_${end}_${community}`;
  if (apiCache.has(cacheKey)) {
    return { ...apiCache.get(cacheKey), fromCache: true };
  }

  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameter}&community=${community}&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EarthSystemsTrendDetective/1.0 (NASA Space Apps Challenge)'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`NASA POWER API HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const rawParamData = json.properties?.parameter?.[parameter];

    if (!rawParamData) {
      throw new Error(`Parameter '${parameter}' not found in NASA POWER response.`);
    }

    // Process observations
    // NASA POWER returns keys formatted as YYYYMM (e.g., "200501" for Jan 2005)
    // and "YYYY13" for the annual aggregate.
    const observations = [];
    const annualAggregates = {};
    const valuesList = [];

    const sortedKeys = Object.keys(rawParamData).sort();

    for (const key of sortedKeys) {
      const val = rawParamData[key];

      // Missing data sentinel in NASA POWER is -999 or -999.0
      if (val === null || val === undefined || val <= -900) {
        continue;
      }

      const year = parseInt(key.substring(0, 4), 10);
      const monthStr = key.substring(4, 6);

      // Handle annual 13th entry
      if (monthStr === '13') {
        annualAggregates[year] = val;
        continue;
      }

      const month = parseInt(monthStr, 10);
      const dateFormatted = `${year}-${monthStr.padStart(2, '0')}`;

      valuesList.push(val);
      observations.push({
        date: dateFormatted,
        year,
        month,
        value: Number(val.toFixed(3)),
        rawKey: key
      });
    }

    // Compute baseline mean and anomalies
    const meanVal = valuesList.length > 0 
      ? valuesList.reduce((acc, v) => acc + v, 0) / valuesList.length 
      : 0;

    for (const obs of observations) {
      obs.anomaly = Number((obs.value - meanVal).toFixed(3));
    }

    const result = {
      parameter,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      startYear: start,
      endYear: end,
      observationCount: observations.length,
      meanValue: Number(meanVal.toFixed(3)),
      units: json.parameters?.[parameter]?.units || '',
      longName: json.parameters?.[parameter]?.longname || parameter,
      annualAggregates,
      observations,
      metadata: {
        provider: 'NASA Langley Research Center POWER Project',
        model: 'MERRA-2 Atmospheric Reanalysis Assimilation',
        timestamp: new Date().toISOString(),
        elevation: json.geometry?.coordinates?.[2] || null
      },
      fromCache: false
    };

    apiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching NASA POWER:', error);
    throw error;
  }
}

