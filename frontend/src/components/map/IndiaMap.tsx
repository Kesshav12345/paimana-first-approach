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
  const [metricMode, setMetricMode] = useState<'PORTFOLIO' | 'RISK' | 'WARNINGS'>('PORTFOLIO');
  const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');

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

  // Semantic color generator driven explicitly by active metric mode:
  const getStateColor = (stateName: string, isHovered: boolean, isSelected: boolean) => {
    const item = stateDataMap.get(normalizeName(stateName));
    if (!item || item.project_count === 0) {
      return isHovered ? '#DDD9D0' : '#EAE6DF';
    }

    if (isSelected) {
      return '#173F35'; // Selected state highlighted in deep institutional forest
    }

    if (isHovered) {
      return '#267A69'; // Hover feedback in primary forest
    }

    // Explicit metric mode coloring:
    if (metricMode === 'PORTFOLIO') {
      const ratio = item.project_count / maxProjects;
      if (ratio > 0.50) return '#173F35'; // Deep Forest (Major Concentration)
      if (ratio > 0.25) return '#267A69'; // Forest Green (High Density)
      if (ratio > 0.10) return '#519E8F'; // Medium Sage (Moderate Density)
      if (ratio > 0.03) return '#86BDB1'; // Soft Sage (Developing Footprint)
      return '#BED6CB'; // Light Sage (Regional Footprint)
    }

    if (metricMode === 'RISK') {
      if (item.critical_risk_count >= 3 || (item.critical_risk_count + item.high_risk_count) >= 20) {
        return '#B74436'; // Terracotta (Severe Risk Concentration)
      }
      if (item.critical_risk_count >= 1 || item.high_risk_count >= 8) {
        return '#C89432'; // Dark Ochre (Elevated Risk Exposure)
      }
      if (item.high_risk_count >= 1) {
        return '#E6BA67'; // Muted Ochre (Moderate Exposure)
      }
      return '#BED6CB'; // Soft Sage (Managed / Low Risk)
    }

    if (metricMode === 'WARNINGS') {
      const warnings = item.active_warning_count || 0;
      if (warnings >= 150) return '#B74436'; // High Warning Intensity
      if (warnings >= 50) return '#C89432';  // Elevated Warning Signals
      if (warnings >= 10) return '#E6BA67';  // Emerging Warning Signals
      if (warnings >= 1) return '#BED6CB';   // Isolated Warnings
      return '#E8F0EC';                      // Clean (0 Active Warnings)
    }

    return '#BED6CB';
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector Buttons */}
          <div className="flex bg-[#FAF8F5] border border-[#DDD9D0] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('PORTFOLIO')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                metricMode === 'PORTFOLIO' ? 'bg-[#173F35] text-white shadow-2xs' : 'text-[#66736D] hover:text-[#173F35]'
              }`}
            >
              Portfolio Density
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('RISK')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                metricMode === 'RISK' ? 'bg-[#173F35] text-white shadow-2xs' : 'text-[#66736D] hover:text-[#173F35]'
              }`}
            >
              Risk Concentration
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('WARNINGS')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                metricMode === 'WARNINGS' ? 'bg-[#173F35] text-white shadow-2xs' : 'text-[#66736D] hover:text-[#173F35]'
              }`}
            >
              Active Warnings
            </button>
          </div>

          {/* View Mode Toggle: Map vs Table */}
          <div className="flex bg-[#FAF8F5] border border-[#DDD9D0] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'MAP' ? 'bg-white text-[#173F35] shadow-2xs border border-[#DDD9D0]' : 'text-[#66736D] hover:text-[#173F35]'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-[#173F35] shadow-2xs border border-[#DDD9D0]' : 'text-[#66736D] hover:text-[#173F35]'
              }`}
            >
              Table View
            </button>
          </div>

          {selectedState && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#DDD9D0]">
              <span className="px-2 py-0.5 rounded bg-[#E8F0EC] text-[11px] font-semibold text-[#173F35]">
                {selectedState}
              </span>
              <button
                type="button"
                onClick={() => onSelectState && onSelectState('')}
                className="text-[11px] text-[#66736D] hover:text-[#173F35] underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: SVG Map Container + Telemetry Brief Sidebar */}
      {viewMode === 'MAP' ? (
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
            {hoveredState && (() => {
              const hData = stateDataMap.get(normalizeName(hoveredState));
              return (
                <div className="absolute top-3 left-3 pointer-events-none bg-[#173F35]/95 text-white p-3 rounded-lg shadow-xl border border-[#267A69] text-xs backdrop-blur-xs max-w-xs transition-all z-20">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white pb-1.5 border-b border-[#267A69]">
                    <MapPin className="w-3.5 h-3.5 text-[#C89432]" />
                    <span>{hoveredState}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-[11px]">
                    <div>
                      <span className="text-[#A3B8B0] block text-[10px] uppercase font-bold">Projects</span>
                      <span className="font-extrabold text-white tabular-nums">{hData?.project_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-[#A3B8B0] block text-[10px] uppercase font-bold">Outlay</span>
                      <span className="font-extrabold text-[#C89432] tabular-nums">
                        ₹{(((hData?.total_investment_cr || 0)) / 1000).toFixed(1)}k Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[#A3B8B0] block text-[10px] uppercase font-bold">Critical / High</span>
                      <span className="font-extrabold text-[#B74436] tabular-nums">
                        {(hData?.critical_risk_count || 0)} crit · {(hData?.high_risk_count || 0)} high
                      </span>
                    </div>
                    <div>
                      <span className="text-[#A3B8B0] block text-[10px] uppercase font-bold">Active Warnings</span>
                      <span className="font-extrabold text-[#E6BA67] tabular-nums">{hData?.active_warning_count || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Map Legend: Dynamic Restrained Semantic Atlas Palette */}
          <div className="w-full mt-4 pt-3 border-t border-[#DDD9D0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#66736D]">
            <span className="font-semibold text-[#26312D]">
              {metricMode === 'PORTFOLIO' && 'Portfolio Concentration Scale:'}
              {metricMode === 'RISK' && 'Composite Risk Exposure Scale:'}
              {metricMode === 'WARNINGS' && 'Active Warning Intensity Scale:'}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              {metricMode === 'PORTFOLIO' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#173F35]" />
                    <span>Major (&gt;50%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#267A69]" />
                    <span>High (25-50%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#519E8F]" />
                    <span>Moderate (10-25%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#86BDB1]" />
                    <span>Developing (3-10%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#BED6CB]" />
                    <span>Regional (&lt;3%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#EAE6DF] border border-[#DDD9D0]" />
                    <span>Nil</span>
                  </span>
                </>
              )}

              {metricMode === 'RISK' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#B74436]" />
                    <span>Severe (≥3 Crit / ≥20 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#C89432]" />
                    <span>Elevated (≥1 Crit / ≥8 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#E6BA67]" />
                    <span>Moderate (≥1 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#BED6CB]" />
                    <span>Managed</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#EAE6DF] border border-[#DDD9D0]" />
                    <span>Nil</span>
                  </span>
                </>
              )}

              {metricMode === 'WARNINGS' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#B74436]" />
                    <span>High (≥150)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#C89432]" />
                    <span>Elevated (50-149)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#E6BA67]" />
                    <span>Emerging (10-49)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#BED6CB]" />
                    <span>Isolated (1-9)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#E8F0EC] border border-[#DDD9D0]" />
                    <span>Clean (0)</span>
                  </span>
                </>
              )}
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
                    <div className="w-20 text-right">
                      <div className="font-bold text-[#173F35] tabular-nums">
                        {st.project_count} prjs
                      </div>
                      <div className="text-[10px] text-[#66736D] tabular-nums">
                        ₹{((st.total_investment_cr || 0) / 1000).toFixed(1)}k Cr
                      </div>
                    </div>

                    <div className="w-[104px] flex justify-end">
                      {(st.critical_risk_count > 0 || st.high_risk_count > 0) && (
                        st.critical_risk_count > 0 ? (
                          <span className="w-full text-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5E7E4] text-[#B74436] border border-[#E8C6C1] whitespace-nowrap">
                            {st.critical_risk_count} crit · {st.high_risk_count} high
                          </span>
                        ) : (
                          <span className="w-full text-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0] whitespace-nowrap">
                            {st.high_risk_count} high
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
      ) : (
        /* Table View Mode: Full National State & Union Territory Registry */
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0]">
            <div className="text-xs text-[#66736D]">
              Displaying <strong className="text-[#173F35]">{states.length}</strong> States and Union Territories with central monitoring coverage.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#66736D]">Sort By:</span>
              <button
                type="button"
                onClick={() => setMetricMode('PORTFOLIO')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  metricMode === 'PORTFOLIO' ? 'bg-[#173F35] text-white' : 'bg-white border border-[#DDD9D0] text-[#66736D]'
                }`}
              >
                Project Count
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('RISK')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  metricMode === 'RISK' ? 'bg-[#173F35] text-white' : 'bg-white border border-[#DDD9D0] text-[#66736D]'
                }`}
              >
                Risk Exposure
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('WARNINGS')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  metricMode === 'WARNINGS' ? 'bg-[#173F35] text-white' : 'bg-white border border-[#DDD9D0] text-[#66736D]'
                }`}
              >
                Active Warnings
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse atlas-table">
                <thead>
                  <tr>
                    <th className="w-10 text-center">#</th>
                    <th>State / Union Territory</th>
                    <th className="text-right">Monitored Projects</th>
                    <th className="text-right">Total Outlay (₹ Cr)</th>
                    <th className="text-center">Critical Risk</th>
                    <th className="text-center">High Risk</th>
                    <th className="text-center">Active Warnings</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6DF]">
                  {[...states]
                    .sort((a, b) => {
                      if (metricMode === 'PORTFOLIO') return b.project_count - a.project_count;
                      if (metricMode === 'RISK') return ((b.critical_risk_count * 3) + b.high_risk_count) - ((a.critical_risk_count * 3) + a.high_risk_count);
                      return (b.active_warning_count || 0) - (a.active_warning_count || 0);
                    })
                    .map((st, idx) => (
                      <tr 
                        key={st.state_name}
                        className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        onClick={() => navigate(`/states?state=${encodeURIComponent(st.state_name)}`)}
                      >
                        <td className="text-center font-mono text-[#8C9893] text-xs">{idx + 1}</td>
                        <td className="font-semibold text-[#173F35]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#267A69]" />
                            <span>{st.state_name}</span>
                          </div>
                        </td>
                        <td className="text-right font-extrabold text-[#173F35] tabular-nums">
                          {st.project_count.toLocaleString()}
                        </td>
                        <td className="text-right font-semibold text-[#26312D] tabular-nums">
                          ₹{st.total_investment_cr.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="text-center">
                          {st.critical_risk_count > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F5E7E4] text-[#B74436] border border-[#E8C6C1]">
                              {st.critical_risk_count}
                            </span>
                          ) : (
                            <span className="text-[#8C9893] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-center">
                          {st.high_risk_count > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0]">
                              {st.high_risk_count}
                            </span>
                          ) : (
                            <span className="text-[#8C9893] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-center">
                          {st.active_warning_count > 0 ? (
                            <span className="font-semibold text-[#C89432] tabular-nums">
                              {st.active_warning_count}
                            </span>
                          ) : (
                            <span className="text-[#8C9893] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/states?state=${encodeURIComponent(st.state_name)}`);
                            }}
                            className="px-2.5 py-1 rounded bg-white border border-[#DDD9D0] hover:border-[#173F35] text-[11px] font-semibold text-[#173F35] inline-flex items-center gap-1 shadow-2xs"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3 h-3 text-[#267A69]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
