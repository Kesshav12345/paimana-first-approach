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
    <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D9E0E5] text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[#66737D] font-semibold text-[11px] mr-1">Active Scope:</span>
        {chips.length === 0 ? (
          <span className="text-[#66737D] italic text-[11px]">All portfolio (No restrictions)</span>
        ) : (
          chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-[#F6F7F8] text-[#25313B] border border-[#D9E0E5] font-medium text-[11px]"
            >
              <strong className="font-bold text-[#123F63]">{chip.label}:</strong>
              <span>{chip.value}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 p-0.5 hover:bg-[#EBF6FA] rounded-xs transition-colors text-[#66737D] hover:text-[#187A9E] cursor-pointer"
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
            className="ml-2 text-[11px] text-[#66737D] hover:text-[#187A9E] underline font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {totalMatching !== undefined && (
        <div className="text-[11px] font-semibold text-[#25313B] bg-[#F6F7F8] px-2.5 py-0.5 rounded-xs border border-[#D9E0E5]">
          Cohort: <span className="text-[#123F63] font-bold tabular-nums">{totalMatching.toLocaleString()}</span> {entityLabel}
        </div>
      )}
    </div>
  );
};
