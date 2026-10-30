import React from 'react';
import { Wifi, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

export interface VirtualCardProps {
  bankName?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  balance: number;
  currency?: string;
  cardType?: 'mastercard' | 'visa';
  variant?: 'violet' | 'dark' | 'gradient';
  className?: string;
  onClick?: () => void;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({
  bankName = "FinanceFlow Premium",
  cardNumber = "•••• •••• •••• 8492",
  cardHolder = "Jennifer Morales",
  expiry = "08/29",
  balance,
  currency = "USD",
  cardType = "mastercard",
  variant = 'violet',
  className,
  onClick,
}) => {
  const variantStyles = {
    violet: "bg-gradient-to-tr from-[#683cc7] via-[#7b52c9] to-[#9366eb] text-white shadow-card-float",
    dark: "bg-gradient-to-tr from-[#14121e] to-[#2b2542] text-white shadow-card-float",
    gradient: "bg-gradient-to-r from-[#7045d4] via-[#5b4bf6] to-[#06b6d4] text-white shadow-card-float",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full max-w-sm h-52 rounded-squircle-xl p-6 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        variantStyles[variant],
        className
      )}
    >
      {/* Círculos orgánicos sutiles de fondo (Referentes) */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-black/10 blur-md pointer-events-none" />

      {/* Fila Superior: Banco y Chip / Contactless */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-white/80 block">
            {bankName}
          </span>
          <p className="text-xs text-white/70">Tarjeta Virtual</p>
        </div>
        <div className="flex items-center gap-2 text-white/90">
          <Wifi className="w-5 h-5 rotate-90" />
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
      </div>

      {/* Chip EMV Dorado estilizado */}
      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/30 flex items-center justify-around px-1 relative z-10 shadow-sm">
        <div className="w-px h-full bg-amber-600/30" />
        <div className="w-px h-full bg-amber-600/30" />
      </div>

      {/* Fila Media: Saldo y Número */}
      <div className="relative z-10">
        <span className="text-[10px] tracking-wider uppercase text-white/70 font-semibold block">
          Saldo Disponible
        </span>
        <div className="text-2xl font-black tracking-tight mb-1">
          {formatCurrency(balance, currency)}
        </div>
        <p className="text-xs font-mono tracking-widest text-white/90">
          {cardNumber}
        </p>
      </div>

      {/* Fila Inferior: Titular, Vencimiento y Logo */}
      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/15">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-white/60 block">Titular</span>
          <span className="text-xs font-semibold tracking-wide">{cardHolder}</span>
        </div>
        
        <div>
          <span className="text-[9px] uppercase tracking-wider text-white/60 block">Expira</span>
          <span className="text-xs font-semibold">{expiry}</span>
        </div>

        {/* Logo Tarjeta */}
        <div className="flex items-center">
          {cardType === 'mastercard' ? (
            <div className="flex -space-x-2.5">
              <span className="w-6 h-6 rounded-full bg-red-500/90 shadow-sm" />
              <span className="w-6 h-6 rounded-full bg-amber-400/90 shadow-sm" />
            </div>
          ) : (
            <span className="text-sm font-black italic tracking-wider">VISA</span>
          )}
        </div>
      </div>
    </div>
  );
};
