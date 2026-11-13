'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  ENVIRONMENTAL_CATEGORIES,
  ENVIRONMENTAL_VARIABLES,
  POPULAR_LOCATIONS
} from '@/lib/nasa/datasetRegistry';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
  Database,
  Sparkles
} from 'lucide-react';

export default function InvestigationWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [category, setCategory] = useState('climate');
  const [variableId, setVariableId] = useState('T2M');
  const [datasetId, setDatasetId] = useState('NASA_POWER');
  const [locationName, setLocationName] = useState('Indo-Gangetic Plain (Lucknow)');
  const [latitude, setLatitude] = useState(26.8467);
  const [longitude, setLongitude] = useState(80.9462);
  const [startYear, setStartYear] = useState(2005);
  const [endYear, setEndYear] = useState(2024);
  const [resolution, setResolution] = useState('monthly');

  const selectedVarObj = ENVIRONMENTAL_VARIABLES[variableId] || ENVIRONMENTAL_VARIABLES.T2M;

  const nextStep = () => setCurrentStep((s) => Math.min(7, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const launchInvestigation = () => {
    router.push(
      `/dashboard?variable=${variableId}&lat=${latitude}&lon=${longitude}&start=${startYear}&end=${endYear}&resolution=${resolution}`
    );
  };

  const inputCls =
    'w-full bg-[#0a101a] border border-[#2c384b] text-[#edf1f7] p-3 text-xs font-sans rounded-none focus:outline-none focus:border-[#70a7ff] transition';

  return (
    <div className="bg-[#070b13] text-[#f3f5f8] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 wrap py-12 max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 border-b border-white/[0.14] pb-6">
          <div className="eyebrow mb-2">
            02 / Scientific Methodology &bull; Step {currentStep} of 7
          </div>
          <h1 className="font-display font-medium text-[clamp(28px,4vw,48px)] leading-tight tracking-[-0.04em] text-white">
            Design Your Investigation
          </h1>
          <p className="text-sm text-[#a8b0bf] mt-2 max-w-xl">
            Follow the guided NASA mission workflow to formulate your scientific inquiry with real satellite archives.
          </p>

          {/* Stepper Dots */}
          <div className="grid grid-cols-7 gap-2 mt-6">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1 transition-all ${s < currentStep
                    ? 'bg-[#70a7ff]'
                    : s === currentStep
                      ? 'bg-[#a9c8ff]'
                      : 'bg-white/10'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Step Card */}
        <div className="border border-white/[0.14] bg-gradient-to-br from-[#111a29] to-[#0b111c] p-6 sm:p-9 min-h-[400px] flex flex-col justify-between">
          {/* STEP 1: CATEGORY */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 01</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Select Earth System Realm
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Choose the Earth observation realm you want to analyze across historical records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ENVIRONMENTAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      const matchingVar = Object.values(ENVIRONMENTAL_VARIABLES).find(
                        (v) => v.category === cat.id
                      );
                      if (matchingVar) setVariableId(matchingVar.id);
                    }}
                    className={`p-4 border text-left transition flex items-center justify-between ${category === cat.id
                        ? 'border-[#70a7ff] bg-[#70a7ff]/10 text-white'
                        : 'border-[#2c384b] bg-[#0a101a] text-[#c4ccd8] hover:border-white/40'
                      }`}
                  >
                    <span className="font-display font-medium text-sm">{cat.name}</span>
                    {category === cat.id && <Check className="w-4 h-4 text-[#70a7ff]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: VARIABLE */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 02</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Select Observation Variable
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Choose the physical atmospheric or land parameter.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Object.values(ENVIRONMENTAL_VARIABLES)
                  .filter((v) => v.category === category)
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariableId(v.id)}
                      className={`p-4 border text-left transition flex flex-col gap-1 ${variableId === v.id
                          ? 'border-[#70a7ff] bg-[#70a7ff]/10 text-white'
                          : 'border-[#2c384b] bg-[#0a101a] text-[#c4ccd8] hover:border-white/40'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-medium text-sm">{v.name}</span>
                        <span className="font-mono text-[10px] text-[#ffd899]">{v.unit}</span>
                      </div>
                      <span className="text-[11px] text-[#8492a8] font-mono">{v.provider}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATASET */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 03</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Confirm NASA Mission Source
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Review data provenance, spatial grid resolution, and assimilation instrument.
                </p>
              </div>

              <div className="p-6 bg-[#080e18] border border-white/[0.08] text-xs font-mono space-y-4">
                <div className="flex items-center space-x-2 text-[#70a7ff] font-bold">
                  <Database className="w-4 h-4" />
                  <span>{selectedVarObj.provider}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.1]">
                  <div>
                    <span className="text-[#8492a8] block text-[10px]">SPATIAL RESOLUTION</span>
                    <span className="text-white font-medium">{selectedVarObj.spatialResolution}</span>
                  </div>
                  <div>
                    <span className="text-[#8492a8] block text-[10px]">MISSION COVERAGE</span>
                    <span className="text-white font-medium">{selectedVarObj.coverage}</span>
                  </div>
                  <div>
                    <span className="text-[#8492a8] block text-[10px]">MEASUREMENT UNIT</span>
                    <span className="text-white font-medium">{selectedVarObj.unit}</span>
                  </div>
                  <div>
                    <span className="text-[#8492a8] block text-[10px]">API STATUS</span>
                    <span className="text-[#70a7ff] font-medium">NASA POWER Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 04</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Select Geographical Target
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Select a preset climate benchmark or enter custom decimal degrees.
                </p>
              </div>

              <div className="space-y-3">
                <select
                  onChange={(e) => {
                    const loc = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
                    if (loc) {
                      setLocationName(loc.name);
                      setLatitude(loc.lat);
                      setLongitude(loc.lon);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">Choose a benchmark target...</option>
                  {POPULAR_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name} ({l.region})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8] block mb-1">Latitude (-90 to +90)</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8] block mb-1">Longitude (-180 to +180)</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: HISTORICAL PERIOD */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 05</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Define Observation Window
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Select multi-year range (recommended: 15 to 30 years for climate trend significance).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8] block mb-1">Start Year</span>
                  <input
                    type="number"
                    min="1981"
                    max="2024"
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8] block mb-1">End Year</span>
                  <input
                    type="number"
                    min="1981"
                    max="2025"
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: RESOLUTION */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow">Step 06</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Sampling Interval
                </h2>
                <p className="text-xs text-[#a8b0bf] mt-1">
                  Specify resolution for time series regression and non-parametric rank testing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolution('monthly')}
                  className={`p-4 border text-left transition ${resolution === 'monthly'
                      ? 'border-[#70a7ff] bg-[#70a7ff]/10 text-white'
                      : 'border-[#2c384b] bg-[#0a101a] text-[#c4ccd8]'
                    }`}
                >
                  <span className="font-display font-medium text-sm block">Monthly Aggregation</span>
                  <span className="text-[11px] text-[#8492a8] mt-1 block">
                    12 points per year; captures seasonal cycle nuances.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResolution('daily')}
                  className={`p-4 border text-left transition ${resolution === 'daily'
                      ? 'border-[#70a7ff] bg-[#70a7ff]/10 text-white'
                      : 'border-[#2c384b] bg-[#0a101a] text-[#c4ccd8]'
                    }`}
                >
                  <span className="font-display font-medium text-sm block">Annualized Mean</span>
                  <span className="text-[11px] text-[#8492a8] mt-1 block">
                    Annual mean values for long-term decadal overview.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow text-[#a9c8ff]">Step 07 · Ready</div>
                <h2 className="font-display text-2xl font-medium text-white mt-1">
                  Review Investigation Specification
                </h2>
              </div>

              <div className="p-5 bg-[#080e18] border border-white/[0.08] text-xs font-mono space-y-3">
                <div className="flex justify-between border-b border-white/[0.1] pb-2">
                  <span className="text-[#8492a8]">Target Variable:</span>
                  <span className="text-white font-medium">{selectedVarObj.name} ({selectedVarObj.unit})</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.1] pb-2">
                  <span className="text-[#8492a8]">NASA Mission:</span>
                  <span className="text-[#70a7ff] font-medium">{selectedVarObj.provider}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.1] pb-2">
                  <span className="text-[#8492a8]">Location:</span>
                  <span className="text-white font-medium">{locationName} ({latitude}°, {longitude}°)</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.1] pb-2">
                  <span className="text-[#8492a8]">Observation Horizon:</span>
                  <span className="text-white font-medium">{startYear} – {endYear} ({resolution})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Statistical Engine:</span>
                  <span className="text-[#a9c8ff] font-medium">Mann-Kendall & Sen's Slope (95% CI)</span>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="pt-6 border-t border-white/[0.14] flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="button-outline text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 7 ? (
              <button
                onClick={nextStep}
                className="button"
              >
                <span>Continue</span>
                <span className="text-sm">↗</span>
              </button>
            ) : (
              <button
                onClick={launchInvestigation}
                className="button"
              >
                <span>Launch Scientific Workspace</span>
                <span className="text-sm">↗</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
