'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
import VerdictCard from '@/components/dashboard/VerdictCard';
import YearTable from '@/components/dashboard/YearTable';
import AiAssistantModal from '@/components/dashboard/AiAssistantModal';
import SatelliteImageryViewer from '@/components/dashboard/SatelliteImageryViewer';
import {
  ENVIRONMENTAL_VARIABLES,
  INVESTIGATION_PRESETS,
  POPULAR_LOCATIONS
} from '@/lib/nasa/datasetRegistry';
import {
  Sliders,
  Calendar,
  Layers,
  Database,
  MapPin,
  Sparkles,
  Info,
  Loader2,
  Bookmark,
  ArrowUpRight
} from 'lucide-react';

// Dynamic client-only WebGL Globe
const EarthGlobe = dynamic(() => import('@/components/dashboard/EarthGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex-1 min-h-[500px] bg-[#070b13] flex flex-col items-center justify-center border border-white/[0.1] space-y-2">
      <div className="w-3 h-3 rounded-full bg-[#70a7ff] animate-ping" />
      <span className="text-xs font-mono text-[#a8b0bf]">INITIALIZING 3D ORTHOGRAPHIC ENGINE...</span>
    </div>
  )
});

export default function DashboardPage() {
  const [selectedVariable, setSelectedVariable] = useState('T2M');
  const [latitude, setLatitude] = useState(26.8467);
  const [longitude, setLongitude] = useState(80.9462);
  const [regionName, setRegionName] = useState('Indo-Gangetic Plain (Lucknow)');
  const [startYear, setStartYear] = useState(2005);
  const [endYear, setEndYear] = useState(2024);
  const [resolution, setResolution] = useState('monthly');
  const [deseasonalize, setDeseasonalize] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [statsResult, setStatsResult] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const activeVariable = ENVIRONMENTAL_VARIABLES[selectedVariable] || ENVIRONMENTAL_VARIABLES.T2M;

  const executeInvestigation = async (options = {}) => {
    const curVar = options.variable || selectedVariable;
    const curLat = options.lat !== undefined ? options.lat : latitude;
    const curLon = options.lon !== undefined ? options.lon : longitude;
    const curStart = options.start || startYear;
    const curEnd = options.end || endYear;
    const curDeseas = options.deseasonalize !== undefined ? options.deseasonalize : deseasonalize;

    setLoading(true);
    setError(null);

    try {
      const obsRes = await fetch(
        `/api/nasa/observations?variable=${curVar}&lat=${curLat}&lon=${curLon}&start=${curStart}&end=${curEnd}&resolution=${resolution}`
      );

      if (!obsRes.ok) {
        const errJson = await obsRes.json();
        throw new Error(errJson.error || 'Failed to fetch observations from NASA API');
      }

      const obsData = await obsRes.json();
      setObservationData(obsData);

      const analysisRes = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variableId: curVar,
          dataset: obsData.provider,
          observations: obsData.observations,
          alpha: 0.05,
          deseasonalize: curDeseas
        })
      });

      if (!analysisRes.ok) {
        throw new Error('Statistical analysis engine error');
      }

      const analysisData = await analysisRes.json();
      setStatsResult({
        ...analysisData.results,
        computedBy: analysisData.computedBy,
        engineStatus: analysisData.engineStatus,
        backendDiagnostics: analysisData.backendDiagnostics
      });
    } catch (err) {
      console.error('Investigation error:', err);
      setError(err.message || 'Error running investigation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pVar = params.get('variable');
    const pLat = params.get('lat');
    const pLon = params.get('lon');
    const pStart = params.get('start');
    const pEnd = params.get('end');
    const pPreset = params.get('preset');

    if (pPreset) {
      const preset = INVESTIGATION_PRESETS.find((p) => p.id === pPreset);
      if (preset) {
        setSelectedVariable(preset.variableId);
        setLatitude(preset.latitude);
        setLongitude(preset.longitude);
        setRegionName(preset.regionName);
        setStartYear(preset.startYear);
        setEndYear(preset.endYear);
        executeInvestigation({
          variable: preset.variableId,
          lat: preset.latitude,
          lon: preset.longitude,
          start: preset.startYear,
          end: preset.endYear
        });
        return;
      }
    }

    if (pVar && ENVIRONMENTAL_VARIABLES[pVar]) setSelectedVariable(pVar);
    if (pLat && !isNaN(parseFloat(pLat))) setLatitude(parseFloat(pLat));
    if (pLon && !isNaN(parseFloat(pLon))) setLongitude(parseFloat(pLon));
    if (pStart && !isNaN(parseInt(pStart, 10))) setStartYear(parseInt(pStart, 10));
    if (pEnd && !isNaN(parseInt(pEnd, 10))) setEndYear(parseInt(pEnd, 10));

    executeInvestigation({
      variable: pVar || selectedVariable,
      lat: pLat ? parseFloat(pLat) : latitude,
      lon: pLon ? parseFloat(pLon) : longitude,
      start: pStart ? parseInt(pStart, 10) : startYear,
      end: pEnd ? parseInt(pEnd, 10) : endYear
    });
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedVariable(preset.variableId);
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setRegionName(preset.regionName);
    setStartYear(preset.startYear);
    setEndYear(preset.endYear);
    executeInvestigation({
      variable: preset.variableId,
      lat: preset.latitude,
      lon: preset.longitude,
      start: preset.startYear,
      end: preset.endYear
    });
  };

  const handleCoordinateSelect = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);

    const nearest = POPULAR_LOCATIONS.find((loc) => {
      const dLat = Math.abs(loc.lat - lat);
      const dLon = Math.abs(loc.lon - lon);
      return dLat < 2.0 && dLon < 2.0;
    });

    const label = nearest
      ? nearest.name
      : `${lat >= 0 ? lat.toFixed(2) + '°N' : Math.abs(lat).toFixed(2) + '°S'}, ${
          lon >= 0 ? lon.toFixed(2) + '°E' : Math.abs(lon).toFixed(2) + '°W'
        }`;

    setRegionName(label);
    executeInvestigation({ lat, lon });
  };

  const handleToggleDeseasonalize = () => {
    const nextState = !deseasonalize;
    setDeseasonalize(nextState);
    if (observationData) {
      executeInvestigation({ deseasonalize: nextState });
    }
  };

  const inputCls =
    'w-full bg-[#0a101a] border border-[#2c384b] text-[#edf1f7] px-3 py-2 text-xs font-sans rounded-none focus:outline-none focus:border-[#70a7ff] transition';

  return (
    <div className="h-screen bg-[#070b13] text-[#f3f5f8] flex flex-col overflow-hidden">
      <Navbar onSelectPreset={handleSelectPreset} />

      {/* Preset Banner Toolbar matching ORBIT */}
      <div className="bg-[#080e18] border-b border-white/[0.14] py-2 px-6 shrink-0">
        <div className="max-w-[1720px] mx-auto flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8492a8] uppercase tracking-[0.12em] shrink-0">
            <span>PRESETS:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {INVESTIGATION_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1 text-xs font-mono transition flex items-center gap-2 border ${
                  regionName.includes(p.regionName.split(' ')[0])
                    ? 'border-[#70a7ff] bg-[#70a7ff]/15 text-white'
                    : 'border-white/[0.14] bg-[#0a101a] text-[#c0cad8] hover:border-white/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Dashboard */}
      <main className="flex-1 min-h-0 max-w-[1720px] w-full mx-auto px-4 py-3 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-3 flex flex-col min-h-0 border border-white/[0.14] bg-[#0b111c] overflow-hidden">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0f1726] border-b border-white/[0.14]">
            <div className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-[#70a7ff]" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white">
                Investigation Controls
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#70a7ff] flex items-center space-x-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70a7ff] animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Environmental Variable */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8492a8] flex items-center justify-between">
                <span>Environmental Variable</span>
                <span className="text-[#70a7ff]">{activeVariable.unit}</span>
              </label>
              <select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className={inputCls}
              >
                {Object.values(ENVIRONMENTAL_VARIABLES).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Geographic Region */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8492a8] flex items-center justify-between">
                <span>Geographic Target</span>
                <MapPin className="w-3.5 h-3.5 text-[#ffd899]" />
              </label>
              <select
                onChange={(e) => {
                  const loc = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) {
                    setLatitude(loc.lat);
                    setLongitude(loc.lon);
                    setRegionName(loc.name);
                    executeInvestigation({ lat: loc.lat, lon: loc.lon });
                  }
                }}
                className={inputCls}
              >
                <option value="">Select Benchmark Target...</option>
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.region})
                  </option>
                ))}
              </select>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#8492a8] block mb-1">LATITUDE</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#8492a8] block mb-1">LONGITUDE</span>
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

            {/* Observation Window */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8492a8] flex items-center justify-between">
                <span>Observation Window</span>
                <Calendar className="w-3.5 h-3.5 text-[#70a7ff]" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#8492a8] block mb-1">START YEAR</span>
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
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#8492a8] block mb-1">END YEAR</span>
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

            {/* Run Button */}
            <button
              onClick={() => executeInvestigation()}
              disabled={loading}
              className="button w-full justify-center text-xs py-3 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING NASA RECORD...</span>
                </>
              ) : (
                <>
                  <span>RUN INVESTIGATION</span>
                  <span className="text-sm">↗</span>
                </>
              )}
            </button>

            {/* Variable Definition Card */}
            <div className="pt-4 border-t border-white/[0.14] space-y-2">
              <div className="eyebrow text-[#70a7ff]">Variable Definition</div>
              <p className="text-[#a8b0bf] leading-relaxed text-xs">
                {activeVariable.definition}
              </p>
              <div className="pt-2 border-t border-white/[0.08] text-[11px] font-mono text-[#8492a8] space-y-1">
                <div className="flex justify-between">
                  <span>Native Unit:</span>
                  <span className="text-white">{activeVariable.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spatial Grid:</span>
                  <span className="text-white">{activeVariable.spatialResolution}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="text-white">{activeVariable.coverage}</span>
                </div>
              </div>
            </div>

            {/* Quick Location Chips */}
            <div className="border-t border-white/[0.14] pt-3 space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#8492a8] block">Quick Targets</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.slice(0, 8).map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleCoordinateSelect(loc.lat, loc.lon)}
                    className={`px-2.5 py-1 text-[10px] font-mono border transition ${
                      regionName.includes(loc.name.split(',')[0])
                        ? 'border-[#70a7ff] text-[#70a7ff] bg-[#70a7ff]/10'
                        : 'border-white/[0.14] bg-[#0a101a] text-[#8492a8] hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span>{loc.name.split(',')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CENTER COLUMN: Earth Globe + Satellite Imagery (5 cols) ─── */}
        <div className="lg:col-span-5 flex flex-col min-h-0 border border-white/[0.14] bg-[#0b111c] overflow-hidden">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0f1726] border-b border-white/[0.14]">
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[#70a7ff]" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white">
                Earth Observation Globe
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#70a7ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70a7ff] animate-pulse" />
              <span>
                {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{' '}
                {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
              </span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Globe */}
            <div className="w-full h-[430px] shrink-0 bg-[#070b13]">
              <EarthGlobe
                latitude={latitude}
                longitude={longitude}
                variableId={selectedVariable}
                trendDirection={statsResult?.trendClassification || 'increasing'}
                onCoordinateSelect={handleCoordinateSelect}
              />
            </div>

            {/* Target Readout */}
            <div className="mx-3 my-2 bg-[#080e18] border border-white/[0.14] px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#70a7ff] shrink-0" />
                <span className="text-[#8492a8]">ACTIVE TARGET:</span>
                <span className="text-white font-medium truncate">{regionName}</span>
              </div>
              <div className="shrink-0 text-[#70a7ff] text-[11px]">
                {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{' '}
                {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
              </div>
            </div>

            {/* NASA Satellite Imagery */}
            <div className="px-3 pb-4">
              <SatelliteImageryViewer
                latitude={latitude}
                longitude={longitude}
                regionName={regionName}
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Statistical Analysis (4 cols) ─── */}
        <div className="lg:col-span-4 flex flex-col min-h-0 border border-white/[0.14] bg-[#0b111c] overflow-hidden">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0f1726] border-b border-white/[0.14]">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-[#70a7ff]" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white">
                Statistical Analysis
              </span>
            </div>
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-[#a9c8ff] text-[10px] font-mono transition"
            >
              <Sparkles className="w-3 h-3 text-[#ffd899]" />
              <span>AI Detective</span>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 text-xs font-mono text-red-300">
                {error}
              </div>
            )}

            {/* Verdict Card */}
            <VerdictCard
              statsResult={statsResult || {}}
              variableName={activeVariable.name}
              unit={activeVariable.unit}
              regionName={regionName}
              onOpenAiAssistant={() => setAiModalOpen(true)}
            />

            {/* Time Series Graph */}
            <TimeSeriesChart
              data={observationData?.observations || []}
              fittedData={statsResult?.fittedSeries || []}
              variableName={activeVariable.name}
              unit={activeVariable.unit}
              statsResult={statsResult || {}}
              isDeseasonalized={deseasonalize}
              onToggleDeseasonalize={handleToggleDeseasonalize}
            />

            {/* Year-by-Year Table */}
            <YearTable
              observations={observationData?.observations || []}
              annualAggregates={observationData?.annualAggregates || {}}
              unit={activeVariable.unit}
              variableName={activeVariable.name}
            />
          </div>
        </div>
      </main>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        variableId={selectedVariable}
        variableName={activeVariable.name}
        regionName={regionName}
        coordinates={{ lat: latitude, lon: longitude }}
        statsResult={statsResult || {}}
        datasetMetadata={observationData?.metadata || {}}
      />
    </div>
  );
}
