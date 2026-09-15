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
  icon = <Filter className="w-4 h-4 text-blue-600" />,
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
    <div className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 ml-9">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Filters changed — Apply to update
            </span>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title={expanded ? 'Collapse Filters' : 'Expand Filters'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Bar (if provided) */}
      {presets.length > 0 && expanded && (
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={p.onApply}
              disabled={loading}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApply}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{applyButtonLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                title="Reset all filters to default national scope"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-right">
              Formulate question, then click <strong className="text-slate-600 font-semibold">{applyButtonLabel}</strong> to commit cohort
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
