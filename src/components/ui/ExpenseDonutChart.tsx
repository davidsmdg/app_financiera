import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';

export interface DonutSegment {
  label: string;
  value: number;
  color: string; // Hex o clase
  percentage: number;
}

export interface ExpenseDonutChartProps {
  totalAmount: number;
  currency?: string;
  periodLabel?: string;
  segments: DonutSegment[];
  className?: string;
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({
  totalAmount,
  currency = "USD",
  periodLabel = "Gastos del Mes",
  segments,
  className,
}) => {
  // Cálculo SVG del anillo donut
  let cumulativePercentage = 0;

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col items-center", className)}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#2a2542]">Perfil de Distribución</h4>
          <p className="text-xs text-[#9f9cb2]">{periodLabel}</p>
        </div>
      </div>

      {/* Gráfico Donut SVG con agujero central de monto */}
      <div className="relative w-48 h-48 my-3 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {segments.map((seg, i) => {
            const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
            const strokeDashoffset = -cumulativePercentage;
            cumulativePercentage += seg.percentage;

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                pathLength="100"
                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Centro del Donut */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-[10px] text-[#9f9cb2] uppercase tracking-wider font-semibold">Total</span>
          <span className="text-xl font-black text-[#2a2542] tracking-tight">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Leyenda y Desglose por Segmento */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-all">
            <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#2a2542] truncate">{seg.label}</p>
              <p className="text-[10px] text-[#9f9cb2]">{seg.percentage}% • {formatCurrency(seg.value, currency)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
