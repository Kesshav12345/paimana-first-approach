import React from 'react';

export const RiskBadge: React.FC<{ band: string; score?: number }> = ({ band, score }) => {
  const b = (band || 'LOW').toUpperCase();
  let color = 'bg-[#F0F7F3] text-[#4D8A67] border-[#CCE3D5]';
  
  if (b === 'CRITICAL') {
    color = 'bg-[#FDF2F1] text-[#B94A45] border-[#F6D3D1] font-bold';
  } else if (b === 'HIGH') {
    color = 'bg-[#FEF9EE] text-[#D99A2B] border-[#FCE7BE] font-semibold';
  } else if (b === 'MODERATE') {
    color = 'bg-[#EBF6FA] text-[#123F63] border-[#CEE8F4] font-medium';
  } else if (b === 'LOW') {
    color = 'bg-[#F0F7F3] text-[#4D8A67] border-[#CCE3D5] font-medium';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xs text-xs font-bold border ${color}`}>
      {b} {score !== undefined ? `(${Math.round(score)})` : ''}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const s = (severity || 'LOW').toUpperCase();
  let color = 'bg-[#F0F7F3] text-[#4D8A67] border-[#CCE3D5]';
  
  if (s === 'CRITICAL') {
    color = 'bg-[#FDF2F1] text-[#B94A45] border-[#F6D3D1] font-bold';
  } else if (s === 'HIGH') {
    color = 'bg-[#FEF9EE] text-[#D99A2B] border-[#FCE7BE] font-bold';
  } else if (s === 'MODERATE') {
    color = 'bg-[#EBF6FA] text-[#123F63] border-[#CEE8F4] font-semibold';
  } else if (s === 'LOW') {
    color = 'bg-[#F0F7F3] text-[#4D8A67] border-[#CCE3D5] font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xs text-xs font-semibold border ${color}`}>
      {s}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || 'ACTIVE').toUpperCase();
  let color = 'bg-[#FFFFFF] text-[#25313B] border-[#D9E0E5]';
  
  if (s.includes('RESOLVED') || s.includes('COMPLETED')) {
    color = 'bg-[#F0F7F3] text-[#4D8A67] border-[#CCE3D5] font-bold';
  } else if (s.includes('DELAY') || s.includes('ACTION_INITIATED')) {
    color = 'bg-[#FEF9EE] text-[#D99A2B] border-[#FCE7BE] font-semibold';
  } else if (s.includes('UNDER_REVIEW') || s.includes('REVIEWED')) {
    color = 'bg-[#F6F7F8] text-[#66737D] border-[#D9E0E5] font-medium';
  } else if (s.includes('CRITICAL') || s.includes('ESCALATED')) {
    color = 'bg-[#FDF2F1] text-[#B94A45] border-[#F6D3D1] font-bold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xs text-xs font-semibold border ${color}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
