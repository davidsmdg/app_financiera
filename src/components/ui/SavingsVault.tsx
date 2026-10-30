import React from 'react';
import { PiggyBank, Sparkles } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface SavingsVaultProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  currency?: string;
  className?: string;
  onDeposit?: () => void;
}

export const SavingsVault: React.FC<SavingsVaultProps> = ({
  goalName = "Fondo de Emergencia",
  currentAmount = 7500,
  targetAmount = 10000,
  currency = "USD",
  className,
  onDeposit,
}) => {
  const percentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  // Generamos una matriz de "monedas/bloques de ahorro" para el interior de la ventana
  const totalSlots = 12;
  const filledSlots = Math.round((percentage / 100) * totalSlots);

  return (
    <div className={cn("bg-white p-5 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col items-center justify-between w-full max-w-sm", className)}>
      
      {/* Título de la meta */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ede9fe] text-[#7b52c9] flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2a2542]">{goalName}</h4>
            <span className="text-[10px] text-[#9f9cb2]">Alcancía Inteligente</span>
          </div>
        </div>
        <span className="text-xs font-black text-[#7b52c9] bg-[#ede9fe] px-2.5 py-1 rounded-full">
          {percentage}%
        </span>
      </div>

      {/* Ventana Arqueada (Referente 1 adaptado a Bóveda) */}
      <div className="w-full max-w-[210px] bg-slate-50/80 border border-slate-100 rounded-t-[100px] rounded-b-2xl p-4 flex flex-col items-center pt-7 relative overflow-hidden shadow-inner">
        
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-slate-100 text-[10px] font-bold text-[#5e5977] mb-3">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Meta: {formatCurrency(targetAmount, currency)}</span>
        </div>

        {/* Matriz de Monedas de Ahorro que se van completando */}
        <div className="grid grid-cols-4 gap-2 my-2">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const isFilled = idx < filledSlots;
            return (
              <div
                key={idx}
                className={cn(
                  "w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-300",
                  isFilled
                    ? "bg-[#7b52c9] text-white shadow-sm scale-105"
                    : "bg-white text-slate-300 border border-slate-200"
                )}
              >
                $
              </div>
            );
          })}
        </div>

        {/* Monto Central Ahorrado */}
        <div className="w-12 h-12 rounded-full bg-[#7b52c9] text-white font-extrabold text-xs flex items-center justify-center shadow-card-soft mt-2 ring-4 ring-white">
          {percentage}%
        </div>
      </div>

      {/* Desglose Numérico */}
      <div className="w-full pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#9f9cb2] block">Ahorrado actual</span>
          <span className="font-bold text-[#2a2542]">{formatCurrency(currentAmount, currency)}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#9f9cb2] block">Falta por ahorrar</span>
          <span className="font-bold text-[#7b52c9]">
            {formatCurrency(targetAmount - currentAmount, currency)}
          </span>
        </div>
      </div>

      {onDeposit && (
        <button
          onClick={onDeposit}
          className="w-full mt-3 py-2.5 rounded-full bg-[#f4effb] text-[#7b52c9] hover:bg-[#ede9fe] text-xs font-bold transition-all cursor-pointer"
        >
          + Agregar Monedas / Depósito
        </button>
      )}
    </div>
  );
};
