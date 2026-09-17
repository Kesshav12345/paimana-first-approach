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

  // Semantic color generator driven explicitly by active metric mode (Institutional Palette):
  const getStateColor = (stateName: string, isHovered: boolean, isSelected: boolean) => {
    const item = stateDataMap.get(normalizeName(stateName));
    if (!item || item.project_count === 0) {
      return isHovered ? '#D9E0E5' : '#F6F7F8';
    }

    if (isSelected) {
      return '#187A9E'; // Selected state highlighted in PAIMANA Blue
    }

    if (isHovered) {
      return '#156586'; // Hover feedback in vibrant PAIMANA Blue shade
    }

    // Explicit metric mode coloring:
    if (metricMode === 'PORTFOLIO') {
      const ratio = item.project_count / maxProjects;
      if (ratio > 0.50) return '#123F63'; // Deep Blue (Major Concentration)
      if (ratio > 0.25) return '#187A9E'; // PAIMANA Blue (High Density)
      if (ratio > 0.10) return '#5EBDE0'; // Sky Blue (Moderate Density)
      if (ratio > 0.03) return '#B2E1F1'; // Soft Blue (Developing Footprint)
      return '#E3EFF5'; // Light Blue-Grey Tint (Regional Footprint)
    }

    if (metricMode === 'RISK') {
      if (item.critical_risk_count >= 3 || (item.critical_risk_count + item.high_risk_count) >= 20) {
        return '#B94A45'; // Critical Red (Severe Risk Concentration)
      }
      if (item.critical_risk_count >= 1 || item.high_risk_count >= 8) {
        return '#D99A2B'; // Saffron (Elevated Risk Exposure)
      }
      if (item.high_risk_count >= 1) {
        return '#F5D592'; // Soft Saffron (Moderate Exposure)
      }
      return '#E3EFF5'; // Managed / Low Risk
    }

    if (metricMode === 'WARNINGS') {
      const warnings = item.active_warning_count || 0;
      if (warnings >= 150) return '#B94A45'; // High Warning Intensity (Critical Red)
      if (warnings >= 50) return '#D99A2B';  // Elevated Warning Signals (Saffron)
      if (warnings >= 10) return '#F5D592';  // Emerging Warning Signals (Light Saffron)
      if (warnings >= 1) return '#E3EFF5';   // Isolated Warnings
      return '#F6F7F8';                      // Clean (0 Active Warnings)
    }

    return '#E3EFF5';
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
    <div className="bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E0E5]">
        <div>
          <div className="flex items-center gap-2 text-[#123F63] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#187A9E]" />
            <span>Interactive Geospatial Intelligence</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#25313B] tracking-tight mt-0.5">
            {title}
          </h2>
          <p className="text-xs text-[#66737D] mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector Buttons */}
          <div className="flex bg-[#F6F7F8] border border-[#D9E0E5] p-0.5 rounded-xs text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('PORTFOLIO')}
              className={`px-3 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'PORTFOLIO' ? 'bg-[#187A9E] text-white shadow-2xs' : 'text-[#66737D] hover:text-[#25313B]'
              }`}
            >
              Portfolio Density
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('RISK')}
              className={`px-3 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'RISK' ? 'bg-[#187A9E] text-white shadow-2xs' : 'text-[#66737D] hover:text-[#25313B]'
              }`}
            >
              Risk Concentration
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('WARNINGS')}
              className={`px-3 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                metricMode === 'WARNINGS' ? 'bg-[#187A9E] text-white shadow-2xs' : 'text-[#66737D] hover:text-[#25313B]'
              }`}
            >
              Active Warnings
            </button>
          </div>

          {/* View Mode Toggle: Map vs Table */}
          <div className="flex bg-[#F6F7F8] border border-[#D9E0E5] p-0.5 rounded-xs text-xs">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`px-2.5 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'MAP' ? 'bg-white text-[#123F63] border border-[#D9E0E5]' : 'text-[#66737D] hover:text-[#25313B]'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-[#123F63] border border-[#D9E0E5]' : 'text-[#66737D] hover:text-[#25313B]'
              }`}
            >
              Table View
            </button>
          </div>

          {selectedState && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#D9E0E5]">
              <span className="px-2 py-0.5 rounded-xs bg-[#EBF6FA] text-[11px] font-semibold text-[#123F63]">
                {selectedState}
              </span>
              <button
                type="button"
                onClick={() => onSelectState && onSelectState('')}
                className="text-[11px] text-[#66737D] hover:text-[#187A9E] underline cursor-pointer"
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
        
        {/* SVG India Map Container on Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs p-4 sm:p-6">
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
                    stroke={isSelected ? '#D99A2B' : '#FFFFFF'}
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
                <div className="absolute top-3 left-3 pointer-events-none bg-[#123F63]/95 text-white p-3 rounded-xs shadow-lg border border-white/20 text-xs max-w-xs transition-all z-20">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white pb-1.5 border-b border-white/20">
                    <MapPin className="w-3.5 h-3.5 text-[#187A9E]" />
                    <span>{hoveredState}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-[11px]">
                    <div>
                      <span className="text-[#D9E0E5] block text-[10px] uppercase font-semibold">Projects</span>
                      <span className="font-extrabold text-white tabular-nums">{hData?.project_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-[#D9E0E5] block text-[10px] uppercase font-semibold">Outlay</span>
                      <span className="font-extrabold text-[#D99A2B] tabular-nums">
                        ₹{(((hData?.total_investment_cr || 0)) / 1000).toFixed(1)}k Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[#D9E0E5] block text-[10px] uppercase font-semibold">Critical / High</span>
                      <span className="font-extrabold text-[#B94A45] tabular-nums">
                        {(hData?.critical_risk_count || 0)} crit · {(hData?.high_risk_count || 0)} high
                      </span>
                    </div>
                    <div>
                      <span className="text-[#D9E0E5] block text-[10px] uppercase font-semibold">Active Warnings</span>
                      <span className="font-extrabold text-white tabular-nums">{hData?.active_warning_count || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Map Legend: Dynamic Scale */}
          <div className="w-full mt-4 pt-3 border-t border-[#D9E0E5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#66737D]">
            <span className="font-semibold text-[#25313B]">
              {metricMode === 'PORTFOLIO' && 'Portfolio Concentration Scale:'}
              {metricMode === 'RISK' && 'Composite Risk Exposure Scale:'}
              {metricMode === 'WARNINGS' && 'Active Warning Intensity Scale:'}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              {metricMode === 'PORTFOLIO' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#123F63]" />
                    <span>Major (&gt;50%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#187A9E]" />
                    <span>High (25-50%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#5EBDE0]" />
                    <span>Moderate (10-25%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#B2E1F1]" />
                    <span>Developing (3-10%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#E3EFF5]" />
                    <span>Regional (&lt;3%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#F6F7F8] border border-[#D9E0E5]" />
                    <span>Nil</span>
                  </span>
                </>
              )}

              {metricMode === 'RISK' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#B94A45]" />
                    <span>Severe (≥3 Crit / ≥20 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#D99A2B]" />
                    <span>Elevated (≥1 Crit / ≥8 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#F5D592]" />
                    <span>Moderate (≥1 High)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#E3EFF5]" />
                    <span>Managed</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#F6F7F8] border border-[#D9E0E5]" />
                    <span>Nil</span>
                  </span>
                </>
              )}

              {metricMode === 'WARNINGS' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#B94A45]" />
                    <span>High (≥150)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#D99A2B]" />
                    <span>Elevated (50-149)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#F5D592]" />
                    <span>Emerging (10-49)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#E3EFF5]" />
                    <span>Isolated (1-9)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-none bg-[#F6F7F8] border border-[#D9E0E5]" />
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
            <div className="bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs p-4 sm:p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D9E0E5]">
                <div>
                  <span className="text-[10px] font-bold text-[#123F63] uppercase tracking-wider">
                    Geographic Brief
                  </span>
                  <h3 className="text-base font-extrabold text-[#25313B] tracking-tight">
                    {activeTelemetry.state_name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/states?state=${encodeURIComponent(activeTelemetry.state_name)}`)}
                  className="px-2.5 py-1 rounded-xs bg-[#F6F7F8] border border-[#D9E0E5] hover:border-[#187A9E] text-[11px] font-semibold text-[#123F63] hover:text-[#187A9E] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Analytics</span>
                  <ChevronRight className="w-3 h-3 text-[#187A9E]" />
                </button>
              </div>

              {/* 4-Stat Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-2.5 bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs">
                  <div className="text-[10px] font-bold uppercase text-[#66737D]">Projects</div>
                  <div className="text-xl font-extrabold text-[#25313B] tabular-nums mt-0.5">
                    {activeTelemetry.project_count}
                  </div>
                  <div className="text-[10px] text-[#66737D]">Central Sector Units</div>
                </div>

                <div className="p-2.5 bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs">
                  <div className="text-[10px] font-bold uppercase text-[#66737D]">Total Outlay</div>
                  <div className="text-xl font-extrabold text-[#123F63] tabular-nums mt-0.5">
                    ₹{((activeTelemetry.total_investment_cr || 0) / 1000).toFixed(1)}k Cr
                  </div>
                  <div className="text-[10px] text-[#66737D]">Revised Commitment</div>
                </div>

                <div className="p-2.5 bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs">
                  <div className="text-[10px] font-bold uppercase text-[#66737D]">Critical / High</div>
                  <div className="text-xl font-extrabold text-[#B94A45] tabular-nums mt-0.5">
                    {(activeTelemetry.critical_risk_count || 0) + (activeTelemetry.high_risk_count || 0)}
                  </div>
                  <div className="text-[10px] text-[#66737D] flex items-center gap-1 mt-0.5">
                    <span className={`font-bold ${activeTelemetry.critical_risk_count > 0 ? 'text-[#B94A45]' : 'text-[#66737D]'}`}>
                      {activeTelemetry.critical_risk_count || 0} Critical
                    </span>
                    <span>|</span>
                    <span className={`font-medium ${activeTelemetry.high_risk_count > 0 ? 'text-[#D99A2B]' : 'text-[#66737D]'}`}>
                      {activeTelemetry.high_risk_count || 0} High
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs">
                  <div className="text-[10px] font-bold uppercase text-[#66737D]">Active Warnings</div>
                  <div className="text-xl font-extrabold text-[#25313B] tabular-nums mt-0.5">
                    {activeTelemetry.active_warning_count || 0}
                  </div>
                  <div className="text-[10px] text-[#66737D]">Triage Signals Active</div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#D9E0E5] flex items-center justify-between text-[11px] text-[#66737D]">
                <span>Click state to filter view or open dedicated state dossier.</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs p-5 text-center text-xs text-[#66737D]">
              Hover or click on any Indian state to inspect portfolio telemetry.
            </div>
          )}

          {/* Accessible Companion: Top Infrastructure States Table */}
          <div className="bg-white border border-[#D9E0E5] rounded-xs overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#F6F7F8] border-b border-[#D9E0E5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#25313B] uppercase tracking-wider">
                State Exposure Ranking
              </span>
              <button
                type="button"
                onClick={() => navigate('/states')}
                className="text-[11px] font-semibold text-[#123F63] hover:text-[#187A9E] hover:underline cursor-pointer"
              >
                View All States →
              </button>
            </div>

            <div className="divide-y divide-[#D9E0E5]">
              {rankedStates.map((st, idx) => (
                <div
                  key={st.state_name}
                  onClick={() => handleStateClick(st.state_name)}
                  className="px-4 py-2 flex items-center justify-between hover:bg-[#F6F7F8] transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-mono text-[#66737D] tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-[#25313B]">
                      {st.state_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="w-20 text-right">
                      <div className="font-bold text-[#25313B] tabular-nums">
                        {st.project_count} prjs
                      </div>
                      <div className="text-[10px] text-[#66737D] tabular-nums">
                        ₹{((st.total_investment_cr || 0) / 1000).toFixed(1)}k Cr
                      </div>
                    </div>

                    <div className="w-[104px] flex justify-end">
                      {(st.critical_risk_count > 0 || st.high_risk_count > 0) && (
                        st.critical_risk_count > 0 ? (
                          <span className="w-full text-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-[#FDF2F1] text-[#B94A45] border border-[#F6D3D1] whitespace-nowrap">
                            {st.critical_risk_count} crit · {st.high_risk_count} high
                          </span>
                        ) : (
                          <span className="w-full text-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-[#FEF9EE] text-[#D99A2B] border border-[#FCE7BE] whitespace-nowrap">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F7F8] p-3 rounded-xs border border-[#D9E0E5]">
            <div className="text-xs text-[#66737D]">
              Displaying <strong className="text-[#25313B]">{states.length}</strong> States and Union Territories with central monitoring coverage.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#66737D]">Sort By:</span>
              <button
                type="button"
                onClick={() => setMetricMode('PORTFOLIO')}
                className={`px-2 py-0.5 rounded-xs text-xs font-semibold cursor-pointer ${
                  metricMode === 'PORTFOLIO' ? 'bg-[#187A9E] text-white' : 'bg-white border border-[#D9E0E5] text-[#66737D]'
                }`}
              >
                Project Count
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('RISK')}
                className={`px-2 py-0.5 rounded-xs text-xs font-semibold cursor-pointer ${
                  metricMode === 'RISK' ? 'bg-[#187A9E] text-white' : 'bg-white border border-[#D9E0E5] text-[#66737D]'
                }`}
              >
                Risk Exposure
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('WARNINGS')}
                className={`px-2 py-0.5 rounded-xs text-xs font-semibold cursor-pointer ${
                  metricMode === 'WARNINGS' ? 'bg-[#187A9E] text-white' : 'bg-white border border-[#D9E0E5] text-[#66737D]'
                }`}
              >
                Active Warnings
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#D9E0E5] rounded-xs overflow-hidden shadow-xs">
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
                <tbody className="divide-y divide-[#D9E0E5]">
                  {[...states]
                    .sort((a, b) => {
                      if (metricMode === 'PORTFOLIO') return b.project_count - a.project_count;
                      if (metricMode === 'RISK') return ((b.critical_risk_count * 3) + b.high_risk_count) - ((a.critical_risk_count * 3) + a.high_risk_count);
                      return (b.active_warning_count || 0) - (a.active_warning_count || 0);
                    })
                    .map((st, idx) => (
                      <tr 
                        key={st.state_name}
                        className="hover:bg-[#F6F7F8] transition-colors cursor-pointer"
                        onClick={() => navigate(`/states?state=${encodeURIComponent(st.state_name)}`)}
                      >
                        <td className="text-center font-mono text-[#66737D] text-xs">{idx + 1}</td>
                        <td className="font-semibold text-[#25313B]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#187A9E]" />
                            <span>{st.state_name}</span>
                          </div>
                        </td>
                        <td className="text-right font-extrabold text-[#25313B] tabular-nums">
                          {st.project_count.toLocaleString()}
                        </td>
                        <td className="text-right font-semibold text-[#25313B] tabular-nums">
                          ₹{st.total_investment_cr.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="text-center">
                          {st.critical_risk_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-[#FDF2F1] text-[#B94A45] border border-[#F6D3D1]">
                              {st.critical_risk_count}
                            </span>
                          ) : (
                            <span className="text-[#66737D] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-center">
                          {st.high_risk_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-[#FEF9EE] text-[#D99A2B] border border-[#FCE7BE]">
                              {st.high_risk_count}
                            </span>
                          ) : (
                            <span className="text-[#66737D] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-center">
                          {st.active_warning_count > 0 ? (
                            <span className="font-semibold text-[#D99A2B] tabular-nums">
                              {st.active_warning_count}
                            </span>
                          ) : (
                            <span className="text-[#66737D] text-xs font-mono">0</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/states?state=${encodeURIComponent(st.state_name)}`);
                            }}
                            className="px-2.5 py-1 rounded-xs bg-[#F6F7F8] border border-[#D9E0E5] hover:border-[#187A9E] text-[11px] font-semibold text-[#123F63] hover:text-[#187A9E] inline-flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3 h-3 text-[#187A9E]" />
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
