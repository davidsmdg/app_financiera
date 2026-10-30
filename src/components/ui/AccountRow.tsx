import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface AccountRowProps {
  title: string;
  subtitle: string;
  balance: number;
  currency?: string;
  profitBadge?: string; // Ej: "+48,20€"
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
}

export const AccountRow: React.FC<AccountRowProps> = ({
  title,
  subtitle,
  balance,
  currency = "EUR",
  profitBadge,
  icon,
  iconBgColor = "bg-[#ede9fe]",
  iconColor = "text-[#7b52c9]",
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 bg-white hover:bg-slate-50/70 rounded-squircle-lg border border-slate-100 shadow-card-soft transition-all duration-200 cursor-pointer select-none active:scale-[0.99]",
        className
      )}
    >
      {/* Icono Redondeado con fondo de color suave + Títulos */}
      <div className="flex items-center gap-3.5">
        <div className={cn("w-12 h-12 rounded-squircle-md flex items-center justify-center shrink-0 shadow-sm", iconBgColor, iconColor)}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#2a2542] leading-tight">{title}</h4>
          <p className="text-xs text-[#9f9cb2] mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Saldo y Badge de Rentabilidad Verde */}
      <div className="text-right flex items-center gap-2">
        <div>
          <span className="text-sm font-black text-[#2a2542] block">
            {formatCurrency(balance, currency)}
          </span>
          {profitBadge && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
              ↗ {profitBadge}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
      </div>
    </div>
  );
};
