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
    <div className="bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs p-3.5 sm:p-4 mb-5 flex flex-wrap items-center gap-3.5 shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4.5 h-4.5 text-[#66737D] absolute left-3.5 top-2.5" />
        <input
          type="text"
          placeholder="Search projects by name or code..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs pl-10 pr-3.5 py-2 text-sm text-[#25313B] placeholder-[#66737D] focus:outline-none focus:border-[#187A9E]"
        />
      </div>

      {/* Sector Dropdown */}
      {onSectorChange && (
        <select
          value={sector || ''}
          onChange={(e) => onSectorChange(e.target.value)}
          className="bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs px-3 py-2 text-sm text-[#25313B] focus:outline-none focus:border-[#187A9E] font-medium"
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
          className="bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs px-3 py-2 text-sm text-[#25313B] focus:outline-none focus:border-[#187A9E] font-medium"
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
          className="bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs px-3 py-2 text-sm text-[#25313B] focus:outline-none focus:border-[#187A9E] font-medium"
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
          className="bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs px-3 py-2 text-sm text-[#25313B] focus:outline-none focus:border-[#187A9E] font-medium"
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
          className="p-2 text-[#66737D] hover:text-[#187A9E] bg-[#F6F7F8] rounded-xs border border-[#D9E0E5] hover:bg-[#EBF6FA] transition cursor-pointer"
          title="Reset Filters"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  );
};
