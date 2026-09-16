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
  colorClass = 'text-[#173F35]',
  icon
}) => {
  return (
    <div className="bg-white border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs hover:border-[#C4BFB6] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
            {title}
          </span>
          {icon && <span className="text-[#8C9893]">{icon}</span>}
        </div>
        <div className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${colorClass}`}>
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-[#EAE6DF] flex items-center justify-between text-xs text-[#66736D]">
          <span className="truncate pr-1">{subtitle}</span>
          {trend && (
            <span className={`font-semibold flex-shrink-0 tabular-nums ${
              trendDirection === 'up' 
                ? 'text-[#B74436]' 
                : trendDirection === 'down' 
                ? 'text-[#267A69]' 
                : 'text-[#66736D]'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
