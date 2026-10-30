import React from 'react';
import { formatCurrency, cn } from '../../lib/utils';

export interface YieldCardProps {
  totalProfit: number;
  apyPercentage: number;
  currency?: string;
  apyLabel?: string;
  modeLabel?: string;
  className?: string;
}

export const YieldCard: React.FC<YieldCardProps> = ({
  totalProfit = 713.41,
  apyPercentage = 5.0,
  currency = "EUR",
  apyLabel = "en EUR",
  modeLabel = "Modo híbrido",
  className,
}) => {
  return (
    <div className={cn("bg-white p-5 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#2a2542]">Tus beneficios acumulados</span>
        <span className="text-[11px] font-semibold text-[#7b52c9] bg-[#f4effb] px-2.5 py-0.5 rounded-full">
          {modeLabel}
        </span>
      </div>

      {/* Tarjeta con Contorno Cian Suave y Divisor Vertical (Estilo Rand) */}
      <div className="rounded-squircle-lg border-2 border-[#06b6d4]/40 bg-[#f0fdfa]/40 p-4 flex items-center justify-between">
        {/* Beneficios Totales */}
        <div className="flex-1 pr-4">
          <span className="text-[10px] text-[#9f9cb2] uppercase tracking-wider font-bold block mb-1">
            Beneficios totales
          </span>
          <div className="text-2xl font-black text-[#2a2542] tracking-tight">
            {formatCurrency(totalProfit, currency)}
          </div>
          <span className="text-[10px] text-[#06b6d4] font-bold tracking-wider uppercase mt-0.5 block">
            {currency} Rendimiento
          </span>
        </div>

        {/* Divisor vertical */}
        <div className="w-px h-12 bg-slate-200" />

        {/* APY Rendimiento Porcentual */}
        <div className="pl-4 text-right">
          <span className="text-[10px] text-[#9f9cb2] uppercase tracking-wider font-bold block mb-1">
            Tu APY Anual
          </span>
          <div className="text-2xl font-black text-[#06b6d4] tracking-tight">
            {apyPercentage}%
          </div>
          <span className="text-[10px] text-[#9f9cb2] font-semibold block mt-0.5">
            {apyLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
