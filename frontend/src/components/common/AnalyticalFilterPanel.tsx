import React, { useState } from 'react';
import { Filter, RotateCcw, Check, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ActiveFilterChips } from './ActiveFilterChips';
import type { ActiveChip } from './ActiveFilterChips';

export interface QuickPreset {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  onApply: () => void;
}

interface AnalyticalFilterPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
  hasUnsavedChanges?: boolean;
  activeChips?: ActiveChip[];
  onClearAllChips?: () => void;
  totalMatching?: number;
  entityLabel?: string;
  presets?: QuickPreset[];
  applyButtonLabel?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const AnalyticalFilterPanel: React.FC<AnalyticalFilterPanelProps> = ({
  title,
  subtitle,
  icon = <Filter className="w-4 h-4 text-[#267A69]" />,
  children,
  onApply,
  onReset,
  loading = false,
  hasUnsavedChanges = false,
  activeChips = [],
  onClearAllChips,
  totalMatching,
  entityLabel = 'entities',
  presets = [],
  applyButtonLabel = 'Apply Filters',
  className = '',
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white border border-[#DDD9D0] rounded-xl shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-[#DDD9D0] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8F0EC] border border-[#BED6CB] flex items-center justify-center shrink-0">
              {icon}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#173F35] tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-[#66736D] mt-0.5 ml-9">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0] text-[11px] font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-[#C89432]" />
              Criteria modified — Click Apply
            </span>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-[#66736D] hover:text-[#173F35] hover:bg-[#EAE6DF] rounded-md transition-colors cursor-pointer"
              title={expanded ? 'Collapse Filters' : 'Expand Filters'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Bar */}
      {presets.length > 0 && expanded && (
        <div className="px-4 sm:px-5 py-2.5 bg-[#FAF8F5] border-b border-[#EAE6DF] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-[#66736D] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-[#C89432]" />
            Quick Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={p.onApply}
              disabled={loading}
              className="px-2.5 py-1 rounded-md bg-white border border-[#DDD9D0] hover:border-[#267A69] hover:bg-[#E8F0EC] text-[#26312D] hover:text-[#173F35] text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={p.description || p.label}
            >
              {p.icon && <span>{p.icon}</span>}
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter Controls Body */}
      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {children}
          </div>

          {/* Actions & Commit Buttons */}
          <div className="pt-3 border-t border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApply}
                disabled={loading}
                className="px-5 py-2 bg-[#173F35] hover:bg-[#267A69] text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F5EEDB]" />
                    <span>{applyButtonLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EAE6DF] text-[#26312D] border border-[#DDD9D0] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                title="Reset all filters to default national scope"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#66736D]" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="text-[11px] text-[#66736D] text-right">
              Configure criteria, then click <strong className="text-[#173F35] font-semibold">{applyButtonLabel}</strong> to commit cohort
            </div>
          </div>

          {/* Active Applied Criteria Chips */}
          <ActiveFilterChips
            chips={activeChips}
            onClearAll={onClearAllChips}
            totalMatching={totalMatching}
            entityLabel={entityLabel}
          />
        </div>
      )}
    </div>
  );
};
