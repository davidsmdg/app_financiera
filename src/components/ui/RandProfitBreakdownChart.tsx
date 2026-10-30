import React, { useState } from 'react';
import { formatCurrency, cn } from '../../lib/utils';

export interface MonthlyBarItem {
  month: string;
  amount: number;
}

export interface RandProfitBreakdownChartProps {
  monthlyData: MonthlyBarItem[];
  currency?: string;
  last30Days: number;
  last60Days: number;
  last90Days: number;
  className?: string;
}

export const RandProfitBreakdownChart: React.FC<RandProfitBreakdownChartProps> = ({
  monthlyData,
  currency = "EUR",
  last30Days = 43.30,
  last60Days = 86.43,
  last90Days = 129.38,
  className,
}) => {
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('monthly');

  // Encontrar valor máximo para escalar barras
  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 1);

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between", className)}>
      
      {/* Selector Superior: Título y Toggle Diario / Mensual */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#2a2542]">Desglose de Beneficios</h4>
          <p className="text-xs text-[#9f9cb2]">Evolución del rendimiento generado</p>
        </div>

        {/* Píldora selector estilo Rand */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs">
          <button
            onClick={() => setGranularity('daily')}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all cursor-pointer",
              granularity === 'daily' ? "bg-white font-bold text-[#2a2542] shadow-sm" : "text-[#9f9cb2]"
            )}
          >
            Diario
          </button>
          <button
            onClick={() => setGranularity('monthly')}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all cursor-pointer",
              granularity === 'monthly' ? "bg-white font-bold text-[#2a2542] shadow-sm" : "text-[#9f9cb2]"
            )}
          >
            Mensual
          </button>
        </div>
      </div>

      {/* Gráfico de Barras Gruesas Azul Eléctrico / Celeste (Estilo Rand) */}
      <div className="h-36 flex items-end justify-between gap-2.5 pt-4 pb-2 px-1">
        {monthlyData.map((item, idx) => {
          const heightPercent = Math.max(Math.round((item.amount / maxAmount) * 100), 12);
          const isLatest = idx === monthlyData.length - 1;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full flex items-end justify-center h-24">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={cn(
                    "w-full max-w-[28px] rounded-t-lg rounded-b-sm transition-all duration-300 group-hover:scale-105 cursor-pointer",
                    isLatest
                      ? "bg-[#2563eb] shadow-sm" // Azul eléctrico para el mes en curso (Marzo en el referente)
                      : "bg-[#bfdbfe]/80 group-hover:bg-[#93c5fd]" // Azul pastel suave para meses anteriores
                  )}
                  title={`${item.month}: ${formatCurrency(item.amount, currency)}`}
                />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight",
                isLatest ? "text-[#2563eb]" : "text-[#9f9cb2]"
              )}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tres Métricas Inferiores: Últ. 30 días, 60 días, 90 días (Idéntico a Rand) */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
        <div className="p-2 rounded-squircle-sm bg-slate-50/70 border border-slate-100/60">
          <span className="text-[10px] text-[#9f9cb2] block">Últ. 30 días</span>
          <span className="text-xs font-black text-[#2a2542]">{formatCurrency(last30Days, currency)}</span>
        </div>
        <div className="p-2 rounded-squircle-sm bg-slate-50/70 border border-slate-100/60">
          <span className="text-[10px] text-[#9f9cb2] block">Últ. 60 días</span>
          <span className="text-xs font-black text-[#2a2542]">{formatCurrency(last60Days, currency)}</span>
        </div>
        <div className="p-2 rounded-squircle-sm bg-slate-50/70 border border-slate-100/60">
          <span className="text-[10px] text-[#9f9cb2] block">Últ. 90 días</span>
          <span className="text-xs font-black text-[#2a2542]">{formatCurrency(last90Days, currency)}</span>
        </div>
      </div>

    </div>
  );
};
