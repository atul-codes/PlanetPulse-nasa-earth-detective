'use client';

import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertTriangle, BookOpen } from 'lucide-react';

export default function AiAssistantModal({
  isOpen,
  onClose,
  variableId = 'T2M',
  variableName = 'Air Temperature (2m)',
  regionName = 'Indo-Gangetic Plain',
  coordinates = {},
  statsResult = {},
  datasetMetadata = {}
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleAsk = async (customQuery) => {
    const questionText = customQuery || query;
    if (!questionText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          variableId,
          regionName,
          coordinates,
          statsResult,
          datasetMetadata
        })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What does this calculated p-value mean scientifically?",
    "Why is Sen's slope preferred over standard linear regression?",
    "What physical mechanisms could explain this observed trend?",
    "What are the data limitations and resolution constraints of this NASA product?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b13]/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#080e18] border border-white/[0.14] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.1] flex items-center justify-between bg-[#0b111c]">
          <div className="flex items-center space-x-3">
            <div className="p-2 border border-[#70a7ff]/40 bg-[#70a7ff]/10 text-[#70a7ff]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-base text-white">
                AI Earth Science Detective
              </h3>
              <p className="text-[11px] font-mono text-[#8492a8]">
                Contextual scientific analysis of NASA observations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8492a8] hover:text-white border border-transparent hover:border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Active Context Banner */}
          <div className="p-3 bg-[#0a101a] border border-white/[0.08] text-xs font-mono flex items-center justify-between">
            <span className="text-[#8492a8]">INVESTIGATION CONTEXT:</span>
            <span className="text-[#70a7ff] font-medium">{variableName} @ {regionName}</span>
          </div>

          {/* Quick sample question chips */}
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#8492a8]">Recommended Detective Inquiries</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sq);
                    handleAsk(sq);
                  }}
                  className="text-left text-xs font-mono px-3 py-1.5 bg-[#0a101a] border border-[#2c384b] hover:border-[#70a7ff] text-[#c0cad8] hover:text-white transition"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {loading && (
            <div className="p-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-[#70a7ff] animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#8492a8]">Evaluating statistical significance and atmospheric physics...</p>
            </div>
          )}

          {response && !loading && (
            <div className="space-y-3 pt-3 border-t border-white/[0.1]">
              {/* Specific Answer */}
              <div className="p-4 bg-[#0a101a] border border-[#70a7ff]/30 text-xs text-[#edf1f7] leading-relaxed">
                <div className="text-[#70a7ff] font-mono text-[11px] uppercase tracking-wider font-bold mb-1.5 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Detective Explanation</span>
                </div>
                {response.specificAnswer}
              </div>

              {/* Statistical interpretation */}
              <div className="p-3.5 bg-[#0a101a] border border-white/[0.08] text-xs text-[#c4ccd8]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffd899] font-bold block mb-1">
                  Observed Evidence & Trend Verdict
                </span>
                <p>{response.interpretation}</p>
              </div>

              {/* Working Hypotheses */}
              {response.workingHypotheses?.length > 0 && (
                <div className="p-3.5 bg-[#0a101a] border border-white/[0.08] text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#a9c8ff] font-bold block mb-1">
                    Plausible Physical Hypotheses
                  </span>
                  <ul className="space-y-1 list-disc list-inside text-[#8492a8]">
                    {response.workingHypotheses.map((hypo, idx) => (
                      <li key={idx}><span className="text-[#f3f5f8]">{hypo}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scientific Limitations */}
              {response.scientificLimitations?.length > 0 && (
                <div className="p-3.5 bg-[#0a101a] border border-white/[0.08] text-xs text-[#8492a8]">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#ffd899] flex items-center space-x-1.5 mb-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ffd899]" />
                    <span>Scientific Limitations & Uncertainties</span>
                  </div>
                  <ul className="space-y-0.5 list-disc list-inside text-[#8492a8]">
                    {response.scientificLimitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-white/[0.1] bg-[#0b111c] flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about this trend, p-value, or NASA mission..."
            className="flex-1 bg-[#0a101a] border border-[#2c384b] p-3 text-xs text-[#edf1f7] font-sans placeholder:text-[#5e6d82] focus:outline-none focus:border-[#70a7ff] transition"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="button py-3 px-4 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
