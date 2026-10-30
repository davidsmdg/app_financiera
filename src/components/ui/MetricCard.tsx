import React from 'react';
import { cn } from '../../lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  theme?: 'coral' | 'cyan' | 'amber' | 'purple' | 'emerald';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  sparkline?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  theme = 'purple',
  sparkline,
  onClick,
}) => {
  const themeStyles = {
    coral: "bg-[#ff6166] text-white shadow-soft",
    cyan: "bg-[#06b6d4] text-white shadow-soft",
    amber: "bg-[#f59e0b] text-white shadow-soft",
    purple: "bg-[#5b4bf6] text-white shadow-soft",
    emerald: "bg-[#10b981] text-white shadow-soft",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-squircle-xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-95 min-h-[140px]",
        themeStyles[theme]
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-90">{icon}</span>}
          <span className="text-xs font-medium tracking-wide opacity-90">{title}</span>
        </div>
      </div>

      <div className="my-auto py-2">
        {sparkline ? (
          <div className="h-10 flex items-center justify-center opacity-90">{sparkline}</div>
        ) : (
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        )}
      </div>

      <div className="flex items-baseline justify-between pt-1 border-t border-white/20">
        <span className="text-xs font-semibold">{subtitle || value}</span>
      </div>
    </div>
  );
};
