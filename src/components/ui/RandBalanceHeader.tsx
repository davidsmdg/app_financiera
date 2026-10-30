import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface RandBalanceHeaderProps {
  accountName?: string;
  accountTypeLabel?: string;
  balance: number;
  currency?: string;
  isPro?: boolean;
  avatarText?: string;
  onOpenSelector?: () => void;
  className?: string;
}

export const RandBalanceHeader: React.FC<RandBalanceHeaderProps> = ({
  accountName = "Cuenta Principal",
  accountTypeLabel = "Saldo disponible",
  balance = 10713.41,
  currency = "EUR",
  isPro = true,
  avatarText = "P",
  onOpenSelector,
  className,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between", className)}>
      
      {/* Fila Superior: Avatar con status dot, icono regalo y Badge 'You're Pro' */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 relative">
          <div className="w-10 h-10 rounded-full bg-[#5b4bf6] text-white font-bold text-sm flex items-center justify-center shadow-sm">
            {avatarText}
          </div>
          {/* Indicador circular online/activo estilo Rand */}
          <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -top-0.5 left-7" />
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Pro estilo Rand con check */}
          {isPro && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4effb] text-[#7b52c9] text-xs font-bold border border-violet-100 shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>You're Pro</span>
            </div>
          )}
        </div>
      </div>

      {/* Nombre de la Cuenta con Tooltip info y Selector */}
      <div className="flex items-center gap-1.5 text-xs text-[#9f9cb2] uppercase tracking-wider font-bold mb-1">
        <span>{accountName}</span>
      </div>

      {/* Monto de Saldo con botón Ocultar/Mostrar (Eye) y Dropdown arrow */}
      <div className="flex items-center justify-between my-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl font-black text-[#1e1b4b] tracking-tight">
            {showBalance ? formatCurrency(balance, currency) : "••••••••"}
          </span>

          {/* Botón de ocultar/mostrar saldo */}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#9f9cb2] hover:text-[#2a2542] transition-all cursor-pointer"
            title="Ocultar o mostrar saldo"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Dropdown selector de cuenta */}
        {onOpenSelector && (
          <button
            onClick={onOpenSelector}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#5e5977] transition-all cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-[#9f9cb2] font-medium">{accountTypeLabel}</p>
    </div>
  );
};
