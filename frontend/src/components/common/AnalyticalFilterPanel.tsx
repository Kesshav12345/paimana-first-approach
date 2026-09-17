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
  icon = <Filter className="w-4 h-4 text-[#187A9E]" />,
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
    <div className={`bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#D9E0E5] bg-[#F6F7F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#FFFFFF] border border-[#D9E0E5] flex items-center justify-center shrink-0">
              {icon}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#123F63] tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-[#66737D] mt-0.5 ml-9.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#FEF9EE] text-[#D99A2B] border border-[#FCE7BE] text-[11px] font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-[#D99A2B]" />
              Criteria modified — Click Apply
            </span>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-[#66737D] hover:text-[#187A9E] hover:bg-[#EBF6FA] rounded-xs transition-colors cursor-pointer"
              title={expanded ? 'Collapse Filters' : 'Expand Filters'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Bar */}
      {presets.length > 0 && expanded && (
        <div className="px-4 sm:px-5 py-2.5 bg-[#FFFFFF] border-b border-[#D9E0E5] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-[#66737D] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-[#D99A2B]" />
            Quick Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={p.onApply}
              disabled={loading}
              className="px-2.5 py-1 rounded-xs bg-[#F6F7F8] border border-[#D9E0E5] hover:border-[#187A9E] hover:text-[#187A9E] text-[#25313B] text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="pt-3 border-t border-[#D9E0E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApply}
                disabled={loading}
                className="px-5 py-2 bg-[#187A9E] hover:bg-[#156586] text-white rounded-xs text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{applyButtonLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F6F7F8] text-[#25313B] border border-[#D9E0E5] rounded-xs text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                title="Reset all filters to default national scope"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#66737D]" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="text-[11px] text-[#66737D] text-right font-medium">
              Configure criteria, then click <strong className="text-[#123F63] font-bold">{applyButtonLabel}</strong> to commit cohort
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
