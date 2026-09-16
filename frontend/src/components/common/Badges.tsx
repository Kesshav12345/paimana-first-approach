import React from 'react';

export const RiskBadge: React.FC<{ band: string; score?: number }> = ({ band, score }) => {
  const b = (band || 'LOW').toUpperCase();
  let color = 'bg-[#E8F0EC] text-[#173F35] border-[#BED6CB]';
  
  if (b === 'CRITICAL') {
    color = 'bg-[#F5E7E4] text-[#B74436] border-[#E5B8B2] font-bold';
  } else if (b === 'HIGH') {
    color = 'bg-[#F5EEDB] text-[#C89432] border-[#DFCBB0] font-semibold';
  } else if (b === 'MODERATE') {
    color = 'bg-[#FAF3E3] text-[#9E7326] border-[#E8D8A0]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${color}`}>
      {b} {score !== undefined ? `(${Math.round(score)})` : ''}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const s = (severity || 'LOW').toUpperCase();
  let color = 'bg-[#EDEAE4] text-[#66736D] border-[#DDD9D0]';
  
  if (s === 'CRITICAL') {
    color = 'bg-[#F5E7E4] text-[#B74436] border-[#E5B8B2] font-semibold';
  } else if (s === 'HIGH') {
    color = 'bg-[#F5EEDB] text-[#C89432] border-[#DFCBB0] font-semibold';
  } else if (s === 'MODERATE') {
    color = 'bg-[#FAF3E3] text-[#9E7326] border-[#E8D8A0]';
  } else if (s === 'LOW') {
    color = 'bg-[#E8F0EC] text-[#173F35] border-[#BED6CB]';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
      {s}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();
  let color = 'bg-[#E8F0EC] text-[#267A69] border-[#BED6CB]';
  
  if (s.includes('RESOLVED') || s.includes('COMPLETED')) {
    color = 'bg-[#E8F0EC] text-[#173F35] border-[#BED6CB] font-semibold';
  } else if (s.includes('DELAY') || s.includes('ACTION_INITIATED')) {
    color = 'bg-[#F5EEDB] text-[#C89432] border-[#DFCBB0]';
  } else if (s.includes('UNDER_REVIEW') || s.includes('REVIEWED')) {
    color = 'bg-[#F6F3EC] text-[#173F35] border-[#DDD9D0]';
  } else if (s.includes('CRITICAL') || s.includes('ESCALATED')) {
    color = 'bg-[#F5E7E4] text-[#B74436] border-[#E5B8B2] font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
