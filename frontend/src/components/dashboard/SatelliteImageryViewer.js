'use client';

import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Layers,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ExternalLink,
  ShieldCheck,
  Key,
  RefreshCw,
  Info
} from 'lucide-react';
import { SATELLITE_LAYERS } from '@/lib/nasa/imagery';

export default function SatelliteImageryViewer({
  latitude = 26.8467,
  longitude = 80.9462,
  regionName = 'Selected Target'
}) {
  const [selectedLayer, setSelectedLayer] = useState('MODIS_Terra_CorrectedReflectance_TrueColor');
  const [zoomDim, setZoomDim] = useState(0.8);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  });
  const [imageryData, setImageryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setImageError(false);

    const fetchImagery = async () => {
      try {
        const res = await fetch(
          `/api/nasa/imagery?lat=${latitude}&lon=${longitude}&layer=${selectedLayer}&date=${date}&dim=${zoomDim}`
        );
        if (!res.ok) throw new Error('Failed to load imagery metadata');
        const data = await res.json();
        if (isMounted) {
          setImageryData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Imagery fetch failed:', err);
        if (isMounted) {
          setImageError(true);
          setLoading(false);
        }
      }
    };

    fetchImagery();
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, selectedLayer, date, zoomDim]);

  const activeLayerObj =
    SATELLITE_LAYERS.find((l) => l.id === selectedLayer) || SATELLITE_LAYERS[0];

  const currentDisplayUrl =
    imageError && imageryData?.fallbackUrl
      ? imageryData.fallbackUrl
      : imageryData?.imageryUrl;

  return (
    <div className="bg-[#080e18] border border-white/[0.14] p-5 flex flex-col space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 border border-[#70a7ff]/40 bg-[#70a7ff]/10 text-[#70a7ff]">
            <Satellite className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white flex items-center space-x-2">
              <span>NASA SATELLITE IMAGERY OBSERVER</span>
            </h3>
            <p className="text-[10px] font-mono text-[#8492a8]">
              Live footprint: {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{' '}
              {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
            </p>
          </div>
        </div>

        {/* API Key Status Pill */}
        <div className="flex items-center space-x-2">
          {imageryData?.hasApiKey ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-mono border border-[#70a7ff]/40 bg-[#70a7ff]/10 text-[#a9c8ff]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#70a7ff]" />
              <span>NASA API Key Active</span>
            </span>
          ) : (
            <span
              title="Add NASA_API_KEY in .env.local to increase rate limits"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-mono border border-white/20 text-[#8492a8]"
            >
              <Key className="w-3.5 h-3.5 text-[#8492a8]" />
              <span>NASA Open Data</span>
            </span>
          )}
        </div>
      </div>

      {/* Controls Bar: Layer, Date, Zoom */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
        {/* Layer Select */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[#8492a8] flex items-center space-x-1">
            <Layers className="w-3 h-3 text-[#70a7ff]" />
            <span>SATELLITE SENSOR</span>
          </label>
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="w-full bg-[#0a101a] border border-[#2c384b] text-[#edf1f7] p-2 text-xs font-mono rounded-none focus:outline-none focus:border-[#70a7ff]"
          >
            {SATELLITE_LAYERS.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Acquisition Date */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[#8492a8] flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-[#70a7ff]" />
            <span>OBSERVATION DATE</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-[#0a101a] border border-[#2c384b] text-[#edf1f7] p-2 text-xs font-mono rounded-none focus:outline-none focus:border-[#70a7ff]"
          />
        </div>

        {/* Zoom Extent */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-[#8492a8] flex items-center justify-between">
            <span>FIELD OF VIEW</span>
            <span className="text-[#70a7ff]">{(zoomDim * 111).toFixed(0)} km</span>
          </label>
          <div className="flex items-center space-x-1 bg-[#0a101a] border border-[#2c384b] p-1">
            <button
              onClick={() => setZoomDim((prev) => Math.max(0.2, Number((prev - 0.2).toFixed(1))))}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] flex items-center space-x-1"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
              <span>IN</span>
            </button>
            <div className="flex-1 text-center text-[10px] text-[#8492a8] font-mono">
              {zoomDim}°
            </div>
            <button
              onClick={() => setZoomDim((prev) => Math.min(2.5, Number((prev + 0.2).toFixed(1))))}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] flex items-center space-x-1"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
              <span>OUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden border border-white/[0.14] bg-[#050912] flex items-center justify-center group">
        {loading ? (
          <div className="flex flex-col items-center space-y-2 text-[#70a7ff]">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-xs font-mono tracking-wider">RETRIEVING NASA ORBITAL FOOTPRINT...</span>
          </div>
        ) : currentDisplayUrl ? (
          <>
            <img
              src={currentDisplayUrl}
              alt={`NASA Satellite view of ${regionName}`}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Target Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border border-[#70a7ff] rounded-full animate-ping opacity-30" />
                <div className="absolute inset-2 border border-[#70a7ff] rounded-full" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#70a7ff]/80 -translate-x-1/2" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#70a7ff]/80 -translate-y-1/2" />
              </div>
            </div>

            {/* Top Overlay Badge */}
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-[#070b13]/90 backdrop-blur-md border border-white/[0.14] text-[10px] font-mono flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#70a7ff] animate-pulse" />
              <span className="font-bold text-white">{activeLayerObj.satellite}</span>
              <span className="text-[#8492a8]">•</span>
              <span className="text-[#a9c8ff]">{activeLayerObj.sensor}</span>
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 bg-[#070b13]/90 hover:bg-[#70a7ff] text-white hover:text-black border border-white/[0.14] transition"
                title="Fullscreen High-Resolution"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <a
                href={currentDisplayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#070b13]/90 hover:bg-[#70a7ff] text-white hover:text-black border border-white/[0.14] transition"
                title="Open raw NASA source in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-[#070b13]/90 backdrop-blur-md border border-white/[0.14] text-[10px] font-mono text-[#c0cad8] flex items-center justify-between">
              <span className="truncate">
                {regionName} ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
              </span>
              <span className="text-[#8492a8] shrink-0">{date}</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-xs font-mono text-[#8492a8] space-y-1">
            <Info className="w-6 h-6 text-[#8492a8] mx-auto" />
            <p>No orbital cloud-free pass available for this exact date.</p>
            <p className="text-[10px] text-[#8492a8]">Try adjusting the observation date by a few days.</p>
          </div>
        )}
      </div>

      {/* Layer Description */}
      <div className="text-[11px] font-sans text-[#a8b0bf] bg-[#050912] p-2.5 border border-white/[0.08] flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-[#70a7ff] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {activeLayerObj.description} <strong className="text-white">Provider:</strong> {activeLayerObj.provider}.
        </span>
      </div>

      {/* Fullscreen High-Resolution Modal */}
      {isFullscreen && currentDisplayUrl && (
        <div className="fixed inset-0 z-50 bg-[#070b13]/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.14]">
            <div className="flex items-center space-x-3">
              <Satellite className="w-5 h-5 text-[#70a7ff]" />
              <div>
                <h2 className="text-sm font-display font-medium text-white">
                  NASA High-Resolution Satellite Footprint
                </h2>
                <p className="text-xs font-mono text-[#8492a8]">
                  {regionName} — Coordinates ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°) | Date: {date}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 border border-white/[0.14] text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            <img
              src={currentDisplayUrl}
              alt={`NASA Satellite view of ${regionName}`}
              className="max-w-full max-h-[80vh] border border-white/[0.14] shadow-2xl object-contain"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.14] text-xs font-mono text-[#8492a8] flex items-center justify-between">
            <span>Mission: {activeLayerObj.satellite} ({activeLayerObj.sensor})</span>
            <span>Data Source: {activeLayerObj.provider}</span>
          </div>
        </div>
      )}
    </div>
  );
}
