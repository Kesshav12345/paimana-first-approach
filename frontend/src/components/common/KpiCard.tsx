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
  colorClass = 'text-[#25313B]',
  icon
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs p-5 sm:p-6 shadow-xs hover:border-[#187A9E] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#66737D]">
            {title}
          </span>
          {icon && <span className="text-[#187A9E]">{icon}</span>}
        </div>
        <div className={`mt-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${colorClass}`}>
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-[#D9E0E5] flex items-center justify-between text-xs sm:text-sm text-[#66737D]">
          <span className="truncate pr-1 font-medium">{subtitle}</span>
          {trend && (
            <span className={`font-bold flex-shrink-0 tabular-nums ${
              trendDirection === 'up' 
                ? 'text-[#B94A45]' 
                : trendDirection === 'down' 
                ? 'text-[#4D8A67]' 
                : 'text-[#66737D]'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
