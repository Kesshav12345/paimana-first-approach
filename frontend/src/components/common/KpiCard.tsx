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
  colorClass = 'text-[#0A365C]',
  icon
}) => {
  return (
    <div className="bg-white border-2 border-[#B8D9F2] rounded-xl p-4 sm:p-5 shadow-xs hover:border-[#1BA0E2] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A6572]">
            {title}
          </span>
          {icon && <span className="text-[#1BA0E2]">{icon}</span>}
        </div>
        <div className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${colorClass}`}>
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-[#B8D9F2]/60 flex items-center justify-between text-xs text-[#4A6572]">
          <span className="truncate pr-1">{subtitle}</span>
          {trend && (
            <span className={`font-semibold flex-shrink-0 tabular-nums ${
              trendDirection === 'up' 
                ? 'text-[#C53030]' 
                : trendDirection === 'down' 
                ? 'text-[#1BA0E2]' 
                : 'text-[#4A6572]'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
