'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function YearTable({
  observations = [],
  annualAggregates = {},
  unit = '°C',
  variableName = 'Air Temperature'
}) {
  const [sortField, setSortField] = useState('year');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const yearlyData = useMemo(() => {
    const yearGroups = {};

    observations.forEach(obs => {
      const y = obs.year;
      if (!yearGroups[y]) {
        yearGroups[y] = {
          year: y,
          values: [],
          months: new Set(),
        };
      }
      yearGroups[y].values.push(obs.value);
      yearGroups[y].months.add(obs.month);
    });

    const overallVals = observations.map(o => o.value);
    const overallMean = overallVals.length > 0 
      ? overallVals.reduce((a, b) => a + b, 0) / overallVals.length 
      : 0;

    const rows = Object.values(yearGroups).map(group => {
      const count = group.values.length;
      const mean = count > 0 ? group.values.reduce((a, b) => a + b, 0) / count : 0;
      const anomaly = mean - overallMean;
      const completeness = Math.min(100, Math.round((count / 12) * 100));

      return {
        year: group.year,
        mean: Number(mean.toFixed(2)),
        anomaly: Number(anomaly.toFixed(2)),
        annualSum: annualAggregates[group.year] !== undefined ? Number(annualAggregates[group.year].toFixed(2)) : null,
        count,
        completeness
      };
    });

    return { rows, overallMean: Number(overallMean.toFixed(2)) };
  }, [observations, annualAggregates]);

  const sortedRows = useMemo(() => {
    return [...yearlyData.rows].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === null) return 1;
      if (valB === null) return -1;
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [yearlyData.rows, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Year', `Mean (${unit})`, `Anomaly (${unit})`, 'Completeness (%)'];
    const rows = yearlyData.rows.map(r => [r.year, r.mean, r.anomaly, r.completeness]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NASA_${variableName.replace(/\s+/g, '_')}_AnnualData.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (yearlyData.rows.length === 0) return null;

  return (
    <div className="w-full bg-[#080e18] border border-white/[0.14] p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.1]">
        <div>
          <h3 className="text-sm font-display font-medium text-white">Annual Aggregates Table</h3>
          <p className="text-[10px] font-mono text-[#8492a8]">Baseline Mean: {yearlyData.overallMean} {unit}</p>
        </div>
        <button
          onClick={downloadCSV}
          className="px-2.5 py-1 text-[10px] font-mono border border-white/[0.14] text-[#8492a8] hover:text-white transition"
        >
          ↓ CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.1] text-[#8492a8]">
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('year')}>
                <div className="flex items-center space-x-1">
                  <span>Year</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('mean')}>
                <div className="flex items-center space-x-1">
                  <span>Mean ({unit})</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('anomaly')}>
                <div className="flex items-center space-x-1">
                  <span>Anomaly</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Completeness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-[#c4ccd8]">
            {paginatedRows.map(row => (
              <tr key={row.year} className="hover:bg-white/[0.03] transition">
                <td className="py-2.5 px-3 font-medium text-[#70a7ff]">{row.year}</td>
                <td className="py-2.5 px-3">{row.mean}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 text-[10px] border ${
                    row.anomaly > 0
                      ? 'border-[#ffd899]/40 text-[#ffd899] bg-[#ffd899]/10'
                      : row.anomaly < 0
                      ? 'border-[#70a7ff]/40 text-[#70a7ff] bg-[#70a7ff]/10'
                      : 'border-white/10 text-[#8492a8]'
                  }`}>
                    {row.anomaly > 0 ? `+${row.anomaly}` : row.anomaly} {unit}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[#8492a8]">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-white/[0.08] h-1 overflow-hidden">
                      <div
                        className="bg-[#70a7ff] h-full"
                        style={{ width: `${row.completeness}%` }}
                      />
                    </div>
                    <span className="text-[10px]">{row.completeness}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.08] text-[10px] font-mono text-[#8492a8]">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-white/[0.14] disabled:opacity-30 hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-white/[0.14] disabled:opacity-30 hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
