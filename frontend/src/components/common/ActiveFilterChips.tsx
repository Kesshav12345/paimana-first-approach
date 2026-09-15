import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface ActiveChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: ActiveChip[];
  onClearAll?: () => void;
  className?: string;
  totalMatching?: number;
  entityLabel?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onClearAll,
  className = '',
  totalMatching,
  entityLabel = 'projects',
}) => {
  if (chips.length === 0 && totalMatching === undefined) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 font-medium text-[11px] mr-1">Active Criteria:</span>
        {chips.length === 0 ? (
          <span className="text-slate-400 italic text-[11px]">All portfolio (No restrictions)</span>
        ) : (
          chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium text-[11px] shadow-2xs"
            >
              <strong className="font-semibold text-blue-900">{chip.label}:</strong>
              <span>{chip.value}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 p-0.5 hover:bg-blue-200/60 rounded-full transition-colors text-blue-600 hover:text-blue-900 cursor-pointer"
                title={`Remove filter: ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}

        {chips.length > 1 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-2 text-[11px] text-slate-500 hover:text-slate-800 underline font-medium flex items-center gap-0.5"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {totalMatching !== undefined && (
        <div className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
          Cohort: <span className="text-blue-700 font-bold">{totalMatching.toLocaleString()}</span> {entityLabel}
        </div>
      )}
    </div>
  );
};
