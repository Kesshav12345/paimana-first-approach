import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorClass?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendDirection,
  colorClass = 'text-[#123B63]',
  icon
}) => {
  return (
    <div className="bg-white border border-[#D9E1EA] rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {icon && <span className="text-slate-400">{icon}</span>}
        </div>
        <div className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight ${colorClass}`}>
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate pr-1">{subtitle}</span>
          {trend && (
            <span className={`font-semibold flex-shrink-0 ${
              trendDirection === 'up' 
                ? 'text-rose-600' 
                : trendDirection === 'down' 
                ? 'text-emerald-700' 
                : 'text-slate-600'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
