import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface BudgetMeterProps {
  categoryName: string;
  spent: number;
  limit: number;
  currency?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const BudgetMeter: React.FC<BudgetMeterProps> = ({
  categoryName,
  spent,
  limit,
  currency = "USD",
  icon,
  className,
}) => {
  const percentage = Math.round((spent / limit) * 100);
  const isNearLimit = percentage >= 85 && percentage < 100;
  const isExceeded = percentage >= 100;

  const barColor = isExceeded 
    ? "bg-[#ef4444]" 
    : isNearLimit 
    ? "bg-[#f59e0b]" 
    : "bg-[#7b52c9]";

  return (
    <div className={cn("p-4 rounded-squircle-lg bg-white border border-slate-100 shadow-card-soft", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#7b52c9]">{icon}</span>}
          <span className="text-xs font-bold text-[#2a2542]">{categoryName}</span>
          {isExceeded && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Excedido
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-[#5e5977]">
          {percentage}%
        </span>
      </div>

      {/* Barra de Progreso Suave y Redondeada */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden my-2">
        <div
          style={{ width: `${Math.min(percentage, 100)}%` }}
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#9f9cb2] pt-1">
        <span>Gastado: <strong className="text-[#2a2542]">{formatCurrency(spent, currency)}</strong></span>
        <span>Límite: <strong className="text-[#5e5977]">{formatCurrency(limit, currency)}</strong></span>
      </div>
    </div>
  );
};
