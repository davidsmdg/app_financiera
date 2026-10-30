import React, { useState } from 'react';
import { cn, formatCurrency } from '../../lib/utils';

export interface CurvePoint {
  month: string;
  value: number;
}

export interface CashFlowWaveChartProps {
  title?: string;
  subtitle?: string;
  points: CurvePoint[];
  currency?: string;
  className?: string;
}

export const CashFlowWaveChart: React.FC<CashFlowWaveChartProps> = ({
  title = "Flujo de Balance",
  subtitle = "Evolución de saldo mensual",
  points,
  currency = "USD",
  className,
}) => {
  const [activePoint, setActivePoint] = useState<number>(3); // Agosto seleccionado por defecto

  const selected = points[activePoint] || points[0];

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-[#2a2542]">{title}</h4>
          <p className="text-xs text-[#9f9cb2]">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#9f9cb2] uppercase tracking-wider block">Saldo {selected.month}</span>
          <span className="text-base font-black text-[#7b52c9]">
            {formatCurrency(selected.value, currency)}
          </span>
        </div>
      </div>

      {/* Gráfico de Ondas Suaves SVG */}
      <div className="relative h-36 w-full my-3">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            {/* Degradado de relleno para la ola */}
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7b52c9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7b52c9" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Área sombreada bajo la curva */}
          <path
            d="M 0 80 Q 80 110, 150 70 T 250 20 T 350 75 T 400 60 L 400 120 L 0 120 Z"
            fill="url(#waveGradient)"
          />

          {/* Curva Secundaria Ámbar (Gastos/Límite) */}
          <path
            d="M 0 70 Q 70 85, 140 70 T 260 55 T 350 80 T 400 70"
            fill="none"
            stroke="url(#amberWave)"
            strokeWidth="3"
            strokeDasharray="4 4"
            className="opacity-70"
          />

          {/* Curva Principal Violeta (Saldo / Ingresos) */}
          <path
            d="M 0 80 Q 80 110, 150 70 T 250 20 T 350 75 T 400 60"
            fill="none"
            stroke="#7b52c9"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Línea indicadora vertical en el punto activo */}
          <line
            x1="250"
            y1="20"
            x2="250"
            y2="120"
            stroke="#7b52c9"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          {/* Círculo indicador con halo */}
          <circle cx="250" cy="20" r="7" fill="#ffffff" stroke="#7b52c9" strokeWidth="3" />
          <circle cx="250" cy="20" r="3" fill="#7b52c9" />
        </svg>
      </div>

      {/* Meses del eje X interactivos */}
      <div className="flex items-center justify-between text-xs text-[#9f9cb2] font-semibold pt-2 border-t border-slate-100">
        {points.map((pt, idx) => (
          <button
            key={idx}
            onClick={() => setActivePoint(idx)}
            className={cn(
              "px-2 py-1 rounded-md transition-all cursor-pointer",
              activePoint === idx
                ? "bg-[#ede9fe] text-[#7b52c9] font-bold"
                : "hover:text-[#2a2542]"
            )}
          >
            {pt.month}
          </button>
        ))}
      </div>
    </div>
  );
};
