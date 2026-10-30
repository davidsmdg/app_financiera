import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface CashFlowBadgeProps {
  type: 'income' | 'expense';
  amount: number;
  currency?: string;
  label?: string;
  className?: string;
}

export const CashFlowBadge: React.FC<CashFlowBadgeProps> = ({
  type,
  amount,
  currency = "USD",
  label,
  className,
}) => {
  const isIncome = type === 'income';

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all select-none",
        isIncome
          ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
          : "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]",
        className
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0",
          isIncome ? "bg-[#16a34a]" : "bg-[#dc2626]"
        )}
      >
        {isIncome ? (
          <ArrowDownLeft className="w-3.5 h-3.5" />
        ) : (
          <ArrowUpRight className="w-3.5 h-3.5" />
        )}
      </div>

      <span>
        {isIncome ? '+ ' : '- '}
        {formatCurrency(Math.abs(amount), currency)}
      </span>

      {label && <span className="text-[10px] opacity-75 font-normal">({label})</span>}
    </div>
  );
};
