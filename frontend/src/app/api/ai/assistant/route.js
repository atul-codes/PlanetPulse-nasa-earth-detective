import { NextResponse } from 'next/server';
import { ENVIRONMENTAL_VARIABLES } from '@/lib/nasa/datasetRegistry';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      question,
      variableId = 'T2M',
      regionName = 'Selected Region',
      coordinates = {},
      statsResult = {},
      datasetMetadata = {}
    } = body;

    const varConfig = ENVIRONMENTAL_VARIABLES[variableId] || { name: variableId, unit: '' };
    const classification = statsResult.trendClassification || 'Analysis pending';
    const isSignificant = statsResult.isSignificant;
    const mkPValue = statsResult.mannKendall?.pValue;
    const senSlope = statsResult.senSlope?.slope;
    const lrSlope = statsResult.linearRegression?.slope;
    const totalChangePct = statsResult.linearRegression?.totalChangePercent;
    const rSquared = statsResult.linearRegression?.rSquared;
    const count = statsResult.observationCount || 0;

    // Generate scientific contextual interpretation based on actual computed data
    let interpretation = "";
    let hypotheses = [];
    let limitations = [];

    if (classification.includes('Significant Increasing')) {
      interpretation = `The Mann-Kendall non-parametric test confirms a statistically significant increasing trend (p = ${mkPValue} < 0.05, Z = ${statsResult.mannKendall?.zScore}) in ${varConfig.name} over the observed timeframe across ${regionName}. Sen's robust slope indicates a median rate of change of approximately +${senSlope} ${varConfig.unit} per timestep (+${totalChangePct}% overall).`;
      
      if (variableId.includes('T2M')) {
        hypotheses = [
          "Increased surface greenhouse gas radiative forcing trapping longwave thermal radiation.",
          "Regional land use changes (e.g. urban heat island effect or reduced vegetative canopy cooling).",
          "Altered regional circulation patterns and persistent high-pressure atmospheric ridges."
        ];
      } else if (variableId.includes('PRECTOT')) {
        hypotheses = [
          "Clausius-Clapeyron atmospheric thermodynamics: a warmer atmosphere holds ~7% more water vapor per degree Celsius, intensifying precipitation events.",
          "Monsoonal shifts altering regional convective moisture convergence."
        ];
      } else {
        hypotheses = [
          "Multi-decadal anthropogenic and climatic forcing shifts.",
          "Long-term vegetative or hydrological cycle shifts."
        ];
      }
    } else if (classification.includes('Significant Decreasing')) {
      interpretation = `The empirical analysis identifies a statistically significant downward trend (p = ${mkPValue} < 0.05) in ${varConfig.name} across ${regionName}. Sen's median slope demonstrates a rate of ${senSlope} ${varConfig.unit} per period (${totalChangePct}% total shift).`;

      if (variableId.includes('NDVI')) {
        hypotheses = [
          "Direct deforestation, logging, and agricultural conversion reducing perennial canopy cover.",
          "Prolonged moisture deficits and droughts diminishing vegetative greenness.",
          "Wildfire scarring and subsequent secondary scrub succession."
        ];
      } else if (variableId.includes('SOILM')) {
        hypotheses = [
          "Enhanced evaporative demand exceeding precipitation recharge.",
          "Shifts in seasonal precipitation timing and increased groundwater withdrawal."
        ];
      } else {
        hypotheses = [
          "Regional environmental degradation or changes in atmospheric moisture transport.",
          "Land-cover transformations impacting local moisture retention."
        ];
      }
    } else {
      interpretation = `The time-series shows ${classification} (p = ${mkPValue} >= 0.05). In formal scientific terms, we fail to reject the null hypothesis of no monotonic trend at the 95% confidence level. Importantly, a non-significant result does NOT prove the absence of environmental change—it indicates that natural multi-year variability, cyclical oscillations (such as ENSO/IOD), or noise currently outweigh any unidirectional linear or monotonic drift.`;
      hypotheses = [
        "High interannual and seasonal climate variability masking subtle underlying long-term trends.",
        "Equilibrium conditions or compensating positive and negative anomalies over the chosen observation window."
      ];
    }

    limitations = [
      `Spatial resolution: ${varConfig.spatialResolution || 'Coarse grid reanalysis'}; localized microclimates may exhibit variations not fully resolved at this scale.`,
      `Data completeness: Based on ${count} valid observations from ${varConfig.provider}.`,
      "Statistical caveat: Monotonic trend tests identify unidirectional slopes but do not establish causality. Correlation does not equal direct cause."
    ];

    // Detailed responses tailored to common detective questions
    let specificAnswer = "";
    const qLower = (question || '').toLowerCase();

    if (qLower.includes('p-value') || qLower.includes('p value') || qLower.includes('significance')) {
      specificAnswer = `In this investigation, the calculated Mann-Kendall p-value is ${mkPValue}. In hypothesis testing, the p-value represents the probability of observing a trend this strong (or stronger) purely by random chance if no genuine trend existed. Because ${mkPValue < 0.05 ? `${mkPValue} is less than our threshold of 0.05, we reject the null hypothesis and conclude the trend is statistically significant.` : `${mkPValue} is greater than 0.05, the trend does not meet the standard 95% scientific confidence threshold.`}`;
    } else if (qLower.includes('sen') || qLower.includes('slope')) {
      specificAnswer = `Sen's slope is a non-parametric estimator calculated by taking the median of slopes between all possible pairs of points in the dataset. Unlike ordinary linear regression, Sen's slope is virtually immune to extreme weather anomalies and sensor outliers. Here, Sen's slope is ${senSlope} ${varConfig.unit} per timestep.`;
    } else if (qLower.includes('deseason') || qLower.includes('season')) {
      specificAnswer = `Earth systems undergo pronounced annual cycles (e.g., summer/winter warmth, monsoon rains). Deseasonalization removes the recurring 12-month climatological cycle, isolating the underlying multi-year baseline anomaly without seasonal oscillations obscuring long-term shifts.`;
    } else {
      specificAnswer = `Based on the ${varConfig.name} observations for ${regionName} (${coordinates.lat || ''}, ${coordinates.lon || ''}), the data exhibits a ${classification}. Linear regression accounts for R² = ${rSquared || 'N/A'}, reflecting how much of the variance is captured by the linear trajectory.`;
    }

    return NextResponse.json({
      question: question || 'Scientific Interpretation Summary',
      variable: varConfig.name,
      region: regionName,
      coordinates,
      verdict: classification,
      isSignificant,
      statisticalSummary: {
        pValue: mkPValue,
        sensSlope: senSlope,
        linearSlope: lrSlope,
        totalChangePercent: totalChangePct,
        observationCount: count
      },
      interpretation,
      specificAnswer,
      workingHypotheses: hypotheses,
      scientificLimitations: limitations,
      methodologyNote: "Computed via Mann-Kendall non-parametric rank test, Theil-Sen median estimator, and OLS regression under 95% confidence bounds (alpha = 0.05)."
    });
  } catch (error) {
    console.error('API /api/ai/assistant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI Earth Science request.' },
      { status: 500 }
    );
  }
}

