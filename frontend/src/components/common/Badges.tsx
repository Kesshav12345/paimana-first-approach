import React from 'react';

export const RiskBadge: React.FC<{ band: string; score?: number }> = ({ band, score }) => {
  const b = (band || 'LOW').toUpperCase();
  let color = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  
  if (b === 'CRITICAL') {
    color = 'bg-red-50 text-[#C62828] border-red-300 font-bold';
  } else if (b === 'HIGH') {
    color = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  } else if (b === 'MODERATE') {
    color = 'bg-yellow-50 text-yellow-800 border-yellow-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${color}`}>
      {b} {score !== undefined ? `(${Math.round(score)})` : ''}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const s = (severity || 'LOW').toUpperCase();
  let color = 'bg-slate-100 text-slate-700 border-slate-300';
  
  if (s === 'CRITICAL') {
    color = 'bg-red-50 text-[#C62828] border-red-300 font-semibold';
  } else if (s === 'HIGH') {
    color = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  } else if (s === 'MODERATE') {
    color = 'bg-yellow-50 text-yellow-800 border-yellow-300';
  } else if (s === 'LOW') {
    color = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
      {s}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();
  let color = 'bg-blue-50 text-[#1877C9] border-blue-200';
  
  if (s.includes('RESOLVED') || s.includes('COMPLETED')) {
    color = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (s.includes('DELAY') || s.includes('ACTION_INITIATED')) {
    color = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (s.includes('UNDER_REVIEW') || s.includes('REVIEWED')) {
    color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (s.includes('CRITICAL') || s.includes('ESCALATED')) {
    color = 'bg-red-50 text-[#C62828] border-red-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
