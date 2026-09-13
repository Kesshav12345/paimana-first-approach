import React from 'react';

interface StateItem {
  state_name: string;
  project_count: number;
  total_investment_cr: number;
  high_risk_count: number;
  critical_risk_count: number;
  active_warning_count: number;
}

interface IndiaRiskMapProps {
  states: StateItem[];
  selectedState?: string;
  onSelectState?: (stateName: string) => void;
}

export const IndiaRiskMap: React.FC<IndiaRiskMapProps> = ({
  states,
  selectedState,
  onSelectState
}) => {
  const topStates = states.slice(0, 16);
  const maxProjects = Math.max(...states.map(s => s.project_count), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Geographic Project & Risk Density</h3>
          <p className="text-xs text-slate-400">Distribution across States and Union Territories</p>
        </div>
        {selectedState && (
          <button
            onClick={() => onSelectState && onSelectState('')}
            className="text-xs text-blue-400 hover:underline"
          >
            Clear Selection ({selectedState})
          </button>
        )}
      </div>

      {/* State Density Heat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {topStates.map((st) => {
          const isSelected = selectedState === st.state_name;
          const densityPct = Math.round((st.project_count / maxProjects) * 100);
          const hasCritical = st.critical_risk_count > 0;

          return (
            <div
              key={st.state_name}
              onClick={() => onSelectState && onSelectState(st.state_name)}
              className={`p-3 rounded border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 truncate">
                <span className="truncate" title={st.state_name}>{st.state_name}</span>
                <span className="text-slate-400 text-[11px] ml-1">{st.project_count}</span>
              </div>

              {/* Mini Density Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    hasCritical ? 'bg-rose-500' : st.high_risk_count > 0 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(10, densityPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>₹{(st.total_investment_cr / 1000).toFixed(1)}k Cr</span>
                {hasCritical && (
                  <span className="text-rose-400 font-semibold">{st.critical_risk_count} crit</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
