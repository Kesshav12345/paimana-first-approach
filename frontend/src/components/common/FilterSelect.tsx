import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSelectProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | FilterOption>;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  allOption?: boolean | string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  icon,
  disabled = false,
  className = '',
  tooltip,
  allOption = true,
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const hasAll = options.some(opt => typeof opt === 'object' ? opt.value === 'ALL' : opt === 'ALL');

  const defaultAllLabel = (() => {
    const l = label.toLowerCase();
    if (l.includes('state') || l.includes('geography')) return 'All States / UTs';
    if (l.includes('ministry')) return 'All Ministries';
    if (l.includes('sector')) return 'All Sectors';
    if (l.includes('risk')) return 'All Risk Bands';
    if (l.includes('cost') || l.includes('escalation')) return 'All Budget Profiles';
    if (l.includes('delay') || l.includes('schedule') || l.includes('slippage')) return 'All Schedule Profiles';
    if (l.includes('warn') || l.includes('alert')) return 'All Alert Levels';
    if (l.includes('corridor') || l.includes('footprint')) return 'All Geographies';
    return `All (${label})`;
  })();

  const allLabel = typeof allOption === 'string' ? allOption : defaultAllLabel;

  return (
    <div className={`space-y-1 ${className}`} title={tooltip}>
      <label
        htmlFor={selectId}
        className="block text-[11px] font-semibold text-slate-700 tracking-wide flex items-center gap-1"
      >
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span>{label}</span>
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value || 'ALL'}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all truncate"
        >
          {allOption !== false && !hasAll && (
            <option value="ALL" className="text-slate-800 font-semibold">
              {allLabel}
            </option>
          )}
          {options.map((opt) => {
            const isObj = typeof opt === 'object';
            const optVal = isObj ? opt.value : opt;
            const optLabel = isObj ? opt.label : opt;
            const optCount = isObj && opt.count !== undefined ? ` (${opt.count.toLocaleString()})` : '';

            return (
              <option key={optVal} value={optVal} className="text-slate-800">
                {optLabel}
                {optCount}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
