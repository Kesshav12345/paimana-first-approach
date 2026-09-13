import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sector?: string;
  onSectorChange?: (val: string) => void;
  state?: string;
  onStateChange?: (val: string) => void;
  riskBand?: string;
  onRiskBandChange?: (val: string) => void;
  severity?: string;
  onSeverityChange?: (val: string) => void;
  onReset?: () => void;
  sectorsList?: string[];
  statesList?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  sector,
  onSectorChange,
  state,
  onStateChange,
  riskBand,
  onRiskBandChange,
  severity,
  onSeverityChange,
  onReset,
  sectorsList = [],
  statesList = []
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search projects by name or code..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Sector Dropdown */}
      {onSectorChange && (
        <select
          value={sector || ''}
          onChange={(e) => onSectorChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Sectors</option>
          {sectorsList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {/* State Dropdown */}
      {onStateChange && (
        <select
          value={state || ''}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All States / UTs</option>
          {statesList.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      )}

      {/* Risk Band Dropdown */}
      {onRiskBandChange && (
        <select
          value={riskBand || ''}
          onChange={(e) => onRiskBandChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Risk Bands</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
        </select>
      )}

      {/* Severity Dropdown */}
      {onSeverityChange && (
        <select
          value={severity || ''}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
        </select>
      )}

      {/* Reset Button */}
      {onReset && (
        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 transition"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
