'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

export default function VerdictCard({
  statsResult = {},
  variableName = 'Air Temperature (2m)',
  unit = '°C',
  regionName = 'Indo-Gangetic Plain',
  onOpenAiAssistant
}) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    trendClassification = 'Awaiting Analysis',
    isSignificant = false,
    observationCount = 0,
    linearRegression = {},
    mannKendall = {},
    senSlope = {},
    significanceLevel = 0.05,
    computedBy = null,
    engineStatus = null,
    backendDiagnostics = null
  } = statsResult;

  const senPerYear = senSlope.slope !== undefined
    ? Number((senSlope.slopeUnit === 'value/year' ? senSlope.slope : senSlope.slope * 12).toFixed(4))
    : null;
  const lrPerYear = linearRegression.slope !== undefined
    ? Number((linearRegression.slopeUnit === 'value/year' ? linearRegression.slope : linearRegression.slope * 12).toFixed(4))
    : null;

  return (
    <div className="w-full bg-[#080e18] border border-white/[0.14] p-5 sm:p-6 flex flex-col justify-between space-y-6">
      <div>
        {/* Top Eyebrow */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#70a7ff]">
              The Detective's Note
            </span>
            {computedBy && (
              <span
                title={backendDiagnostics ? `${computedBy} | Note: ${backendDiagnostics}` : computedBy}
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded-none border ${
                  engineStatus === 'ONLINE'
                    ? 'text-[#38ef7d] border-[#38ef7d]/40 bg-[#38ef7d]/10'
                    : 'text-[#8492a8] border-white/10 bg-white/5'
                }`}
              >
                {computedBy.includes('Python') ? '⚡ Python (SciPy)' : 'JS Engine'}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#8492a8]">
            ALPHA = {significanceLevel}
          </span>
        </div>

        {/* Heading */}
        <h3 className="font-display font-medium text-2xl text-white mb-2">
          {isSignificant ? 'Signal, not certainty.' : 'Natural variability dominates.'}
        </h3>

        {/* Narrative Subhead */}
        <p className="text-xs text-[#a8b0bf] leading-relaxed mb-5">
          {isSignificant
            ? `The data confirms a ${trendClassification.toLowerCase()} in ${variableName} across ${regionName}.`
            : `Observations show ${trendClassification.toLowerCase()}. We fail to reject the null hypothesis of no monotonic trend.`}
        </p>

        {/* Three Complementary Scientific Tests */}
        <div className="space-y-4 pt-4 border-t border-white/[0.14]">
          {/* 01 Linear Regression */}
          <div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-xs text-[#70a7ff]">01</span>
                <span className="font-display font-medium text-xs text-white">Linear regression</span>
              </div>
              <span className="font-mono text-xs text-[#c0cad8]">
                {lrPerYear !== null ? `${lrPerYear > 0 ? '+' : ''}${lrPerYear} ${unit}/yr` : '—'}
              </span>
            </div>
            <p className="text-xs text-[#8492a8] mt-0.5 ml-6">
              Fits a straight line to estimate the rate of change (R² = {linearRegression.rSquared ?? '—'}).
            </p>
          </div>

          {/* 02 Mann-Kendall */}
          <div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-xs text-[#70a7ff]">02</span>
                <span className="font-display font-medium text-xs text-white">Mann-Kendall</span>
              </div>
              <span className={`font-mono text-xs ${isSignificant ? 'text-[#70a7ff] font-bold' : 'text-[#8492a8]'}`}>
                p = {mannKendall.pValue !== undefined ? mannKendall.pValue.toFixed(5) : '—'}
              </span>
            </div>
            <p className="text-xs text-[#8492a8] mt-0.5 ml-6">
              {isSignificant
                ? 'Statistically meaningful monotonic direction (p < 0.05).'
                : 'Not statistically significant at the 95% confidence level.'}
            </p>
          </div>

          {/* 03 Sen's Slope */}
          <div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-xs text-[#70a7ff]">03</span>
                <span className="font-display font-medium text-xs text-white">Sen's slope</span>
              </div>
              <span className="font-mono text-xs text-[#a9c8ff] font-bold">
                {senPerYear !== null ? `${senPerYear > 0 ? '+' : ''}${senPerYear} ${unit}/yr` : '—'}
              </span>
            </div>
            <p className="text-xs text-[#8492a8] mt-0.5 ml-6">
              Robust median estimate resilient against sensor outliers and extreme events.
            </p>
          </div>
        </div>

        {/* Expandable Advanced Confidence Intervals */}
        <div className="mt-4 pt-3 border-t border-white/[0.1]">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between font-mono text-[11px] text-[#8492a8] hover:text-white transition"
          >
            <span>Detailed 95% Confidence Bounds</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 bg-[#050912] text-xs font-mono text-[#a8b0bf] space-y-1.5 border border-white/[0.08]">
              <div className="flex justify-between">
                <span>Mann-Kendall Z-score:</span>
                <span className="text-white">{mannKendall.zScore ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Sen's 95% CI Range:</span>
                <span className="text-white">
                  {senSlope.ci95 ? `[${senSlope.ci95[0]}, ${senSlope.ci95[1]}]` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Modeled Change:</span>
                <span className="text-[#ffd899]">
                  {linearRegression.totalChangePercent !== undefined
                    ? `${linearRegression.totalChangePercent > 0 ? '+' : ''}${linearRegression.totalChangePercent}%`
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom AI Assistant Link */}
      <div className="pt-4 border-t border-white/[0.14] flex items-center justify-between">
        <button
          onClick={onOpenAiAssistant}
          className="font-mono text-xs text-[#70a7ff] hover:text-[#a9c8ff] flex items-center space-x-1.5 group"
        >
          <span>Ask AI Detective about this trend</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
        </button>

        <span className="font-mono text-[10px] text-[#8492a8]">
          {observationCount} Obs
        </span>
      </div>
    </div>
  );
}
