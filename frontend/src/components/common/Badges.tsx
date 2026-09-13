import React from 'react';

export const RiskBadge: React.FC<{ band: string; score?: number }> = ({ band, score }) => {
  const b = (band || 'LOW').toUpperCase();
  let bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
  if (b === 'CRITICAL') bg = 'bg-red-950/70 text-red-400 border-red-800 animate-pulse';
  else if (b === 'HIGH') bg = 'bg-orange-950/60 text-orange-400 border-orange-800';
  else if (b === 'MODERATE') bg = 'bg-amber-950/60 text-amber-400 border-amber-800';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${bg}`}>
      {b} {score !== undefined ? `(${Math.round(score)})` : ''}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const s = (severity || 'LOW').toUpperCase();
  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  if (s === 'CRITICAL') bg = 'bg-rose-900/60 text-rose-300 border-rose-700';
  else if (s === 'HIGH') bg = 'bg-orange-900/60 text-orange-300 border-orange-700';
  else if (s === 'MODERATE') bg = 'bg-amber-900/60 text-amber-300 border-amber-700';
  else if (s === 'LOW') bg = 'bg-emerald-900/60 text-emerald-300 border-emerald-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${bg}`}>
      {s}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();
  let color = 'bg-blue-950 text-blue-400 border-blue-800';
  if (s.includes('RESOLVED') || s.includes('COMPLETED')) {
    color = 'bg-emerald-950 text-emerald-400 border-emerald-800';
  } else if (s.includes('DELAY') || s.includes('ACTION_INITIATED')) {
    color = 'bg-amber-950 text-amber-400 border-amber-800';
  } else if (s.includes('UNDER_REVIEW')) {
    color = 'bg-purple-950 text-purple-400 border-purple-800';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
