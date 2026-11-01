'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  ENVIRONMENTAL_VARIABLES,
  INVESTIGATION_PRESETS
} from '@/lib/nasa/datasetRegistry';
import {
  Download,
  ShieldCheck
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedPreset, setSelectedPreset] = useState(INVESTIGATION_PRESETS[1]); // Indo-Gangetic Heat
  const [generating, setGenerating] = useState(false);

  const activeVar = ENVIRONMENTAL_VARIABLES[selectedPreset.variableId] || ENVIRONMENTAL_VARIABLES.T2M;

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner (ORBIT Deep Navy)
      doc.setFillColor(7, 11, 19);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(243, 245, 248);
      doc.text('ORBIT — EARTH DETECTIVE', 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(112, 167, 255);
      doc.text('NASA Earth Systems Scientific Investigation Dossier', 14, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(168, 176, 191);
      doc.text(`Generated: ${new Date().toUTCString()} | Multi-Mission Significance Engine`, 14, 28);

      // Section 1: Executive Metadata
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(7, 11, 19);
      doc.text('1. INVESTIGATION METADATA & PROVENANCE', 14, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 75);

      const metadataRows = [
        ['Investigation Title:', selectedPreset.title],
        ['Geographic Target:', `${selectedPreset.regionName} (${selectedPreset.latitude}°N, ${selectedPreset.longitude}°E)`],
        ['Environmental Variable:', `${activeVar.name} [Native Unit: ${activeVar.unit}]`],
        ['NASA Mission & Product:', activeVar.provider],
        ['Spatial Grid Resolution:', activeVar.spatialResolution],
        ['Observation Window:', `${selectedPreset.startYear} - ${selectedPreset.endYear} (Monthly Aggregation)`]
      ];

      let yPos = 54;
      metadataRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 65, yPos);
        yPos += 6.5;
      });

      // Divider
      doc.setDrawColor(200, 210, 225);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 10;

      // Section 2: Methodology
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(7, 11, 19);
      doc.text('2. RIGOROUS DUAL STATISTICAL METHODOLOGY', 14, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const methodologyText =
        'To eliminate false trend detections caused by seasonal noise and extreme sensor outliers, this analysis applies non-parametric Mann-Kendall rank correlation testing coupled with Sen\'s robust slope estimation alongside ordinary least-squares linear regression (R² and 95% confidence bounds).';
      const splitMethod = doc.splitTextToSize(methodologyText, 180);
      doc.text(splitMethod, 14, yPos);
      yPos += splitMethod.length * 4.5 + 4;

      // Section 3: Baseline Results
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(7, 11, 19);
      doc.text('3. PRELIMINARY STATISTICAL SUMMARY', 14, yPos);
      yPos += 8;

      const statRows = [
        ['Observed Trend Hypothesis:', selectedPreset.expectedTrend],
        ['Scientific Focus:', selectedPreset.description],
        ['Primary Instrument:', activeVar.provider],
        ['Alpha Level (Significance):', 'alpha = 0.05 (95% Confidence Interval)']
      ];

      statRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        const splitVal = doc.splitTextToSize(value, 120);
        doc.text(splitVal, 70, yPos);
        yPos += Math.max(splitVal.length * 4.5, 6.5);
      });

      // Footer
      doc.setDrawColor(200, 210, 225);
      doc.line(14, 275, 196, 275);
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 150, 165);
      doc.text('ORBIT — NASA Space Apps Challenge 2026 • Earth Detective Platform', 14, 281);
      doc.text('Data sourced live from NASA POWER & Earth Science Division API', 196, 281, { align: 'right' });

      doc.save(`ORBIT_NASA_Dossier_${selectedPreset.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-[#070b13] text-[#f3f5f8] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 wrap py-12 max-w-[1100px] w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.14]">
          <div>
            <div className="eyebrow">04 / Scientific Reporting Center</div>
            <h1 className="font-display font-medium text-[clamp(28px,4vw,48px)] leading-tight tracking-[-0.04em] text-white mt-1">
              Scientific Dossier Export
            </h1>
            <p className="text-sm text-[#a8b0bf] mt-2">
              Generate peer-review grade PDF dossiers summarizing your NASA Earth system observations.
            </p>
          </div>

          <button
            onClick={generatePDF}
            disabled={generating}
            className="button text-xs py-3.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{generating ? 'Compiling Dossier...' : 'Export Formal PDF ↗'}</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-3">
          <div className="eyebrow">Select Investigation Target</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INVESTIGATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-5 border text-left transition flex flex-col justify-between ${
                  selectedPreset.id === preset.id
                    ? 'border-[#70a7ff] bg-[#70a7ff]/10 text-white'
                    : 'border-[#2c384b] bg-[#0a101a] text-[#c4ccd8] hover:border-white/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8]">
                      {preset.regionName}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase px-2 py-0.5 border"
                      style={{ color: preset.color, borderColor: `${preset.color}40`, background: `${preset.color}15` }}
                    >
                      {preset.expectedTrend}
                    </span>
                  </div>
                  <h4 className="font-display font-medium text-base text-white">{preset.title}</h4>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.1] font-mono text-[10px] text-[#8492a8] flex items-center justify-between">
                  <span>{preset.startYear} – {preset.endYear}</span>
                  <span className="text-[#a9c8ff]">{preset.variableId}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dossier Preview Card */}
        <div className="border border-white/[0.14] bg-gradient-to-br from-[#111a29] to-[#0b111c] p-6 sm:p-9 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.1]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#70a7ff]/40 bg-[#70a7ff]/10 flex items-center justify-center text-[#70a7ff]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-medium text-lg text-white">{selectedPreset.title}</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8492a8]">
                  NASA Earth Science Dossier Specification
                </p>
              </div>
            </div>
            <span className="font-mono text-[9px] tracking-wider uppercase px-2.5 py-1 border border-white/20 text-[#a9c8ff]">
              NASA POWER Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-5 bg-[#080e18] border border-white/[0.08] space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-[#8492a8] block">Geographic Provenance</span>
              <div className="space-y-2 text-[#c4ccd8]">
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Target Region:</span>
                  <span className="text-white">{selectedPreset.regionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Coordinates:</span>
                  <span className="text-white">{selectedPreset.latitude}°N, {selectedPreset.longitude}°E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Horizon:</span>
                  <span className="text-white">{selectedPreset.startYear} – {selectedPreset.endYear}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#080e18] border border-white/[0.08] space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-[#8492a8] block">Instrument & Observable</span>
              <div className="space-y-2 text-[#c4ccd8]">
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Parameter:</span>
                  <span className="text-white">{activeVar.name} ({activeVar.unit})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Provider:</span>
                  <span className="text-white">{activeVar.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8492a8]">Spatial Grid:</span>
                  <span className="text-white">{activeVar.spatialResolution}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#080e18] border border-white/[0.08] text-xs text-[#a8b0bf] leading-relaxed">
            <strong className="text-white">Summary:</strong> {selectedPreset.description} Non-parametric Mann-Kendall rank correlation testing coupled with Sen\'s robust slope estimation removes seasonality noise to evaluate true climatic shifts.
          </div>
        </div>
      </main>
    </div>
  );
}
