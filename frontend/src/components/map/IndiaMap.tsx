import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import { INDIA_STATE_PATHS, INDIA_MAP_WIDTH, INDIA_MAP_HEIGHT } from './indiaMapData';

export interface StateDistributionItem {
  state_name: string;
  project_count: number;
  total_investment_cr: number;
  high_risk_count: number;
  critical_risk_count: number;
  active_warning_count: number;
}

interface IndiaMapProps {
  states: StateDistributionItem[];
  selectedState?: string;
  onSelectState?: (stateName: string) => void;
  title?: string;
  subtitle?: string;
}

// Normalization helper to map any name variations
function normalizeName(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes('andaman')) return 'andaman and nicobar islands';
  if (n.includes('orissa') || n.includes('odisha')) return 'odisha';
  if (n.includes('uttaranchal') || n.includes('uttarakhand')) return 'uttarakhand';
  if (n.includes('daman') || n.includes('dadra')) return 'dadra and nagar haveli and daman and diu';
  if (n.includes('jammu') || n.includes('ladakh')) return 'jammu and kashmir';
  return n;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  states,
  selectedState,
  onSelectState,
  title = 'India Infrastructure Pulse',
  subtitle = 'Geographic Concentration, Capital Outlay, and Risk Exposure across States & Union Territories'
}) => {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Map state data by normalized name for fast lookup
  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateDistributionItem>();
    states.forEach((st) => {
      map.set(normalizeName(st.state_name), st);
    });
    return map;
  }, [states]);

  // Max projects for density calculation
  const maxProjects = useMemo(() => {
    return Math.max(...states.map((s) => s.project_count), 1);
  }, [states]);

  // Active state telemetry (hovered state, selected state, or highest density state)
  const activeTelemetry = useMemo(() => {
    const targetName = hoveredState || selectedState;
    if (targetName) {
      const found = stateDataMap.get(normalizeName(targetName));
      if (found) return found;
      const direct = states.find((s) => s.state_name.toLowerCase() === targetName.toLowerCase());
      if (direct) return direct;
      return {
        state_name: targetName,
        project_count: 0,
        total_investment_cr: 0,
        high_risk_count: 0,
        critical_risk_count: 0,
        active_warning_count: 0
      };
    }
    // Default to top state by projects if nothing hovered
    const sorted = [...states]
      .filter((s) => s.state_name !== 'Multi-State' && s.state_name !== 'Offshore')
      .sort((a, b) => b.project_count - a.project_count);
    return sorted[0] || null;
  }, [hoveredState, selectedState, stateDataMap, states]);

  // Color generator for SVG paths according to Atlas Guidelines:
  // - Critical concentration: Terracotta (#B74436)
  // - Elevated attention / High risk: Muted Ochre (#C89432)
  // - Healthy base / High density: Forest Green (#267A69) / Deep Forest (#173F35)
  // - Moderate: Soft Forest / Sage (#6BB8A6 / #9ECAC0)
  // - Low / No data: Warm Neutral (#EAE6DF)
  const getStateColor = (stateName: string, isHovered: boolean, isSelected: boolean) => {
    const item = stateDataMap.get(normalizeName(stateName));
    if (!item || item.project_count === 0) {
      return isHovered ? '#DDD9D0' : '#EAE6DF';
    }

    if (isSelected) {
      return '#173F35'; // Highlighted in deep institutional forest
    }

    if (isHovered) {
      return '#267A69'; // Primary forest green on hover
    }

    // Risk-aware & density-aware semantic coloring
    if (item.critical_risk_count >= 5) {
      return '#B74436'; // Terracotta for critical concentration
    }
    if (item.high_risk_count >= 6 || item.critical_risk_count >= 2) {
      return '#C89432'; // Muted Ochre for elevated attention
    }

    const ratio = item.project_count / maxProjects;
    if (ratio > 0.6) return '#173F35'; // Deep Forest
    if (ratio > 0.35) return '#267A69'; // Forest Green
    if (ratio > 0.18) return '#519E8F'; // Medium Sage
    if (ratio > 0.08) return '#86BDB1'; // Soft Sage
    return '#BED6CB'; // Light Sage
  };

  // Handle state click
  const handleStateClick = (stateName: string) => {
    if (onSelectState) {
      if (selectedState === stateName) {
        onSelectState('');
      } else {
        onSelectState(stateName);
      }
    } else {
      navigate(`/states?state=${encodeURIComponent(stateName)}`);
    }
  };

  // Top ranked states for accessible companion list
  const rankedStates = useMemo(() => {
    return [...states]
      .filter((s) => s.state_name !== 'Multi-State' && s.state_name !== 'Offshore')
      .sort((a, b) => b.project_count - a.project_count)
      .slice(0, 8);
  }, [states]);

  return (
    <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6DF]">
        <div>
          <div className="flex items-center gap-2 text-[#267A69] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Geospatial Intelligence</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#173F35] tracking-tight mt-0.5">
            {title}
          </h2>
          <p className="text-xs text-[#66736D] mt-0.5">
            {subtitle}
          </p>
        </div>

        {selectedState && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#E8F0EC] border border-[#BED6CB] text-xs font-semibold text-[#173F35]">
              Active Filter: {selectedState}
            </span>
            <button
              type="button"
              onClick={() => onSelectState && onSelectState('')}
              className="text-xs text-[#66736D] hover:text-[#173F35] underline cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: SVG Map Container + Telemetry Brief Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-start">
        
        {/* SVG India Map Container on Warm Sandstone Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-[#F6F3EC] border border-[#DDD9D0] rounded-xl p-4 sm:p-6">
          <div className="w-full max-w-[490px] aspect-[560/640] relative">
            <svg
              viewBox={`0 0 ${INDIA_MAP_WIDTH} ${INDIA_MAP_HEIGHT}`}
              className="w-full h-full drop-shadow-xs select-none"
              role="img"
              aria-label="Geographical Map of India Infrastructure Portfolio"
            >
              {INDIA_STATE_PATHS.map((feat) => {
                const isSelected = selectedState?.toLowerCase() === feat.name.toLowerCase();
                const isHovered = hoveredState?.toLowerCase() === feat.name.toLowerCase();
                const fillColor = getStateColor(feat.name, isHovered, isSelected);
                const item = stateDataMap.get(normalizeName(feat.name));

                return (
                  <path
                    key={feat.id}
                    d={feat.d}
                    fill={fillColor}
                    stroke={isSelected ? '#C89432' : '#FFFFFF'}
                    strokeWidth={isSelected ? 2.2 : 0.8}
                    className="transition-colors duration-150 cursor-pointer focus:outline-none"
                    tabIndex={0}
                    aria-label={`${feat.name}: ${item ? item.project_count : 0} projects`}
                    onMouseEnter={() => setHoveredState(feat.name)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(feat.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStateClick(feat.name);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Hover Floating Pill on Map */}
            {hoveredState && (
              <div className="absolute top-2 left-2 pointer-events-none bg-[#173F35]/95 text-white px-3 py-1.5 rounded-md shadow-md border border-[#267A69] text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C89432]" />
                <span>{hoveredState}</span>
                <span className="text-[#A3B8B0] text-[11px] tabular-nums">
                  ({stateDataMap.get(normalizeName(hoveredState))?.project_count || 0} projects)
                </span>
              </div>
            )}
          </div>

          {/* Map Legend: Restrained Semantic Atlas Palette */}
          <div className="w-full mt-4 pt-3 border-t border-[#DDD9D0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#66736D]">
            <span className="font-semibold text-[#26312D]">Portfolio Density & Risk:</span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#173F35]" />
                <span>High Density</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#267A69]" />
                <span>Moderate Density</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#C89432]" />
                <span>Elevated Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#B74436]" />
                <span>Critical Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#EAE6DF] border border-[#DDD9D0]" />
                <span>Low / Nil</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Data Brief + Ranked States Table */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active State Telemetry Brief Card */}
          {activeTelemetry ? (
            <div className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE6DF]">
                <div>
                  <span className="text-[10px] font-bold text-[#267A69] uppercase tracking-wider">
                    Geographic Brief
                  </span>
                  <h3 className="text-base font-extrabold text-[#173F35] tracking-tight">
                    {activeTelemetry.state_name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/states?state=${encodeURIComponent(activeTelemetry.state_name)}`)}
                  className="px-2.5 py-1 rounded bg-white border border-[#DDD9D0] hover:border-[#173F35] text-[11px] font-semibold text-[#173F35] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Full Analytics</span>
                  <ChevronRight className="w-3 h-3 text-[#267A69]" />
                </button>
              </div>

              {/* 4-Stat Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-2.5 bg-white border border-[#EAE6DF] rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-[#66736D]">Projects</div>
                  <div className="text-xl font-extrabold text-[#173F35] tabular-nums mt-0.5">
                    {activeTelemetry.project_count}
                  </div>
                  <div className="text-[10px] text-[#66736D]">Central Sector Units</div>
                </div>

                <div className="p-2.5 bg-white border border-[#EAE6DF] rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-[#66736D]">Total Outlay</div>
                  <div className="text-xl font-extrabold text-[#173F35] tabular-nums mt-0.5">
                    ₹{((activeTelemetry.total_investment_cr || 0) / 1000).toFixed(1)}k Cr
                  </div>
                  <div className="text-[10px] text-[#66736D]">Revised Commitment</div>
                </div>

                <div className="p-2.5 bg-white border border-[#EAE6DF] rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-[#66736D]">Critical / High</div>
                  <div className="text-xl font-extrabold text-[#B74436] tabular-nums mt-0.5">
                    {(activeTelemetry.critical_risk_count || 0) + (activeTelemetry.high_risk_count || 0)}
                  </div>
                  <div className="text-[10px] text-[#66736D] flex items-center gap-1 mt-0.5">
                    <span className={`font-bold ${activeTelemetry.critical_risk_count > 0 ? 'text-[#B74436]' : 'text-[#66736D]'}`}>
                      {activeTelemetry.critical_risk_count || 0} Critical
                    </span>
                    <span>|</span>
                    <span className={`font-medium ${activeTelemetry.high_risk_count > 0 ? 'text-[#C89432]' : 'text-[#66736D]'}`}>
                      {activeTelemetry.high_risk_count || 0} High
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-[#EAE6DF] rounded-lg">
                  <div className="text-[10px] font-bold uppercase text-[#66736D]">Active Warnings</div>
                  <div className="text-xl font-extrabold text-[#C89432] tabular-nums mt-0.5">
                    {activeTelemetry.active_warning_count || 0}
                  </div>
                  <div className="text-[10px] text-[#66736D]">Triage Signals Active</div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#EAE6DF] flex items-center justify-between text-[11px] text-[#66736D]">
                <span>Click state to filter view or open dedicated state dossier.</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-xl p-5 text-center text-xs text-[#66736D]">
              Hover or click on any Indian state to inspect portfolio telemetry.
            </div>
          )}

          {/* Accessible Companion: Top Infrastructure States Table */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#DDD9D0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                State Exposure Ranking
              </span>
              <button
                type="button"
                onClick={() => navigate('/states')}
                className="text-[11px] font-semibold text-[#267A69] hover:underline cursor-pointer"
              >
                View All States →
              </button>
            </div>

            <div className="divide-y divide-[#EAE6DF]">
              {rankedStates.map((st, idx) => (
                <div
                  key={st.state_name}
                  onClick={() => handleStateClick(st.state_name)}
                  className="px-4 py-2 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-mono text-[#8C9893] tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-[#26312D]">
                      {st.state_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-[#173F35] tabular-nums">
                        {st.project_count} prjs
                      </div>
                      <div className="text-[10px] text-[#66736D] tabular-nums">
                        ₹{((st.total_investment_cr || 0) / 1000).toFixed(1)}k Cr
                      </div>
                    </div>

                    {(st.critical_risk_count > 0 || st.high_risk_count > 0) && (
                      st.critical_risk_count > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5E7E4] text-[#B74436] border border-[#E8C6C1] whitespace-nowrap">
                          {st.critical_risk_count} crit · {st.high_risk_count} high
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0] whitespace-nowrap">
                          {st.high_risk_count} high
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
