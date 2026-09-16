import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ExternalLink
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
  title = 'National Infrastructure Geographic Distribution',
  subtitle = 'Central Sector Projects across States and Union Territories'
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

  // Active state telemetry (either hovered, or selected, or top state)
  const activeTelemetry = useMemo(() => {
    const targetName = hoveredState || selectedState;
    if (targetName) {
      const found = stateDataMap.get(normalizeName(targetName));
      if (found) return found;
      // If found directly in states array
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
    return null;
  }, [hoveredState, selectedState, stateDataMap, states]);

  // Color generator for SVG paths
  const getStateColor = (stateName: string, isHovered: boolean, isSelected: boolean) => {
    const item = stateDataMap.get(normalizeName(stateName));
    if (!item || item.project_count === 0) {
      return isHovered ? '#CBD5E1' : '#E2E8F0';
    }

    if (isSelected) {
      return '#0B2945'; // Highlighted in deep institutional navy
    }

    if (isHovered) {
      return '#1877C9'; // Primary blue on hover
    }

    const ratio = item.project_count / maxProjects;
    if (ratio > 0.6) return '#1D4ED8';
    if (ratio > 0.35) return '#2563EB';
    if (ratio > 0.18) return '#3B82F6';
    if (ratio > 0.08) return '#60A5FA';
    return '#93C5FD';
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
      .slice(0, 10);
  }, [states]);

  return (
    <div className="bg-white border border-[#D9E1EA] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-[#1877C9] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Geospatial Density</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B2945] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        {selectedState && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-[#1877C9]">
              Filtered: {selectedState}
            </span>
            <button
              type="button"
              onClick={() => onSelectState && onSelectState('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Real SVG Map (Left/Center) + Telemetry & Ranked List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
        
        {/* SVG India Map Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 sm:p-4">
          <div className="w-full max-w-[480px] aspect-[560/640] relative">
            <svg
              viewBox={`0 0 ${INDIA_MAP_WIDTH} ${INDIA_MAP_HEIGHT}`}
              className="w-full h-full drop-shadow-xs select-none"
              role="img"
              aria-label="Interactive Map of India Infrastructure"
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
                    stroke={isSelected ? '#F59E0B' : '#FFFFFF'}
                    strokeWidth={isSelected ? 2 : 0.8}
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

            {/* Quick Map Overlay Note */}
            <div className="absolute bottom-2 left-2 text-[10px] text-slate-600 bg-white/90 backdrop-blur px-2 py-1 rounded border border-slate-200">
              Click state to inspect cohort
            </div>
          </div>

          {/* Choropleth Legend */}
          <div className="w-full mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Project Density:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#93C5FD]" title="Low" />
                <span className="w-3 h-3 rounded-xs bg-[#3B82F6]" title="Medium" />
                <span className="w-3 h-3 rounded-xs bg-[#1D4ED8]" title="High" />
                <span className="w-3 h-3 rounded-xs bg-[#0B2945]" title="Selected" />
              </div>
              <span className="text-[10px] text-slate-600">(Low &rarr; High)</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" />
              <span>Red outline: Critical risk</span>
            </div>
          </div>
        </div>

        {/* Right Panel: State Hover Telemetry & Accessible Ranked List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active State Telemetry Card */}
          <div className="bg-[#F8FAFC] border border-[#D9E1EA] rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {hoveredState ? 'Focused Jurisdiction' : selectedState ? 'Selected State' : 'State Intelligence'}
                </span>
                <h4 className="text-base font-extrabold text-[#0B2945]">
                  {activeTelemetry ? activeTelemetry.state_name : 'Hover over any state'}
                </h4>
              </div>

              {activeTelemetry && (
                <button
                  type="button"
                  onClick={() => navigate(`/states?state=${encodeURIComponent(activeTelemetry.state_name)}`)}
                  className="px-2.5 py-1 rounded bg-[#1877C9] hover:bg-[#123B63] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Analytics</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {activeTelemetry ? (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Projects Monitored</span>
                  <div className="text-lg font-bold text-[#123B63] mt-0.5">
                    {activeTelemetry.project_count.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Sanctioned Value</span>
                  <div className="text-lg font-bold text-[#0B2945] mt-0.5">
                    ₹{(activeTelemetry.total_investment_cr / 1000).toFixed(1)}k Cr
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Active Warnings</span>
                  <div className="text-lg font-bold text-[#F59E0B] mt-0.5">
                    {activeTelemetry.active_warning_count}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Critical / High Risk</span>
                  <div className="text-lg font-bold text-[#C62828] mt-0.5">
                    {activeTelemetry.critical_risk_count} crit / {activeTelemetry.high_risk_count} high
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-600">
                Point your cursor over any state or union territory on the map to inspect live project counts, capital commitments, and risk status.
              </div>
            )}
          </div>

          {/* Accessible Non-Map Alternative: Top States Ranked List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Top States by Portfolio Scale
              </span>
              <span className="text-[11px] text-slate-600">Accessible Index</span>
            </div>

            <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
              {rankedStates.map((st, idx) => {
                const isSelected = selectedState === st.state_name;
                return (
                  <div
                    key={st.state_name}
                    onClick={() => handleStateClick(st.state_name)}
                    className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-[#1877C9] text-[#0B2945] font-semibold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-[11px] font-mono text-slate-600 w-4">{idx + 1}.</span>
                      <span className="truncate font-medium">{st.state_name}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-semibold text-[#123B63]">
                        {st.project_count} prjs
                      </span>
                      <span className="text-slate-600 text-[11px]">
                        ₹{(st.total_investment_cr / 1000).toFixed(0)}k Cr
                      </span>
                      {st.critical_risk_count > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-red-50 text-[#C62828] border border-red-200 text-[10px] font-bold">
                          {st.critical_risk_count} crit
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
