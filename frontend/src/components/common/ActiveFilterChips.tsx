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
    <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE6DF] text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[#66736D] font-medium text-[11px] mr-1">Active Scope:</span>
        {chips.length === 0 ? (
          <span className="text-[#8C9893] italic text-[11px]">All portfolio (No restrictions)</span>
        ) : (
          chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB] font-medium text-[11px] shadow-2xs"
            >
              <strong className="font-semibold text-[#173F35]">{chip.label}:</strong>
              <span>{chip.value}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 p-0.5 hover:bg-[#BED6CB]/60 rounded-full transition-colors text-[#267A69] hover:text-[#173F35] cursor-pointer"
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
            className="ml-2 text-[11px] text-[#66736D] hover:text-[#173F35] underline font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {totalMatching !== undefined && (
        <div className="text-[11px] font-semibold text-[#26312D] bg-[#FAF8F5] px-2.5 py-0.5 rounded-md border border-[#DDD9D0]">
          Cohort: <span className="text-[#173F35] font-bold tabular-nums">{totalMatching.toLocaleString()}</span> {entityLabel}
        </div>
      )}
    </div>
  );
};
