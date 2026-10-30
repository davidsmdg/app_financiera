import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface SavingsChallengeGoalProps {
  title: string;
  category: string;
  imageIllustration?: string;
  savedAmount: number;
  targetAmount: number;
  deadlineDate?: string;
  currency?: string;
  className?: string;
}

export const SavingsChallengeGoal: React.FC<SavingsChallengeGoalProps> = ({
  title = "Bici nueva de montaña",
  category = "Objetivo Personal",
  imageIllustration = "🚲",
  savedAmount = 100.30,
  targetAmount = 120.30,
  deadlineDate = "5 de Mayo",
  currency = "EUR",
  className,
}) => {
  const percentage = Math.min(Math.round((savedAmount / targetAmount) * 100), 100);
  const remaining = Math.max(targetAmount - savedAmount, 0);

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between max-w-sm w-full", className)}>
      
      {/* Ilustración / Avatar del Objetivo */}
      <div className="w-full h-40 rounded-squircle-lg bg-gradient-to-br from-[#c4b5fd]/40 to-[#ede9fe] flex flex-col items-center justify-center relative overflow-hidden mb-4 border border-violet-100/50">
        <span className="text-6xl drop-shadow-sm select-none">{imageIllustration}</span>
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#7b52c9] shadow-sm">
          {category}
        </div>
      </div>

      {/* Título y Mensaje de Motivación */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-[#2a2542]">{title}</h4>
          <span className="text-xs font-black text-[#7b52c9] bg-[#ede9fe] px-2.5 py-0.5 rounded-full">
            {percentage}%
          </span>
        </div>
        <p className="text-xs text-[#16a34a] font-semibold flex items-center gap-1 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> ¡Estás haciéndolo genial!
        </p>
        {deadlineDate && (
          <p className="text-[11px] text-[#9f9cb2] mt-0.5">Fecha límite: {deadlineDate}</p>
        )}
      </div>

      {/* Barra de Progreso Suave Bicolor */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden my-2">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-gradient-to-r from-[#06b6d4] to-[#10b981] rounded-full transition-all duration-500"
        />
      </div>

      {/* Métricas de lo Ahorrado y lo que Falta */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
        <div className="p-2.5 rounded-squircle-sm bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-[#9f9cb2] block">Has ahorrado</span>
          <span className="text-xs font-bold text-[#2a2542]">{formatCurrency(savedAmount, currency)}</span>
        </div>
        <div className="p-2.5 rounded-squircle-sm bg-slate-50 border border-slate-100 text-right">
          <span className="text-[10px] text-[#9f9cb2] block">Tienes que ahorrar</span>
          <span className="text-xs font-bold text-[#7b52c9]">{formatCurrency(remaining, currency)}</span>
        </div>
      </div>
    </div>
  );
};
