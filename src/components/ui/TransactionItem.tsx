import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Car, Briefcase, Zap } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  iconType?: 'shopping' | 'coffee' | 'transport' | 'work' | 'bill';
}

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onClick }) => {
  const getIcon = () => {
    switch (transaction.iconType) {
      case 'shopping': return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
      case 'coffee': return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'transport': return <Car className="w-5 h-5 text-cyan-500" />;
      case 'work': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      default: return <Zap className="w-5 h-5 text-purple-500" />;
    }
  };

  const isIncome = transaction.type === 'income';

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3.5 bg-surface hover:bg-slate-50/80 rounded-squircle-lg transition-all duration-150 cursor-pointer border border-slate-100/60 shadow-soft"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-squircle-md bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-main line-clamp-1">{transaction.title}</h4>
          <p className="text-xs text-muted">{transaction.category} • {transaction.date}</p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-sm font-bold flex items-center justify-end gap-0.5 ${
          isIncome ? 'text-emerald-500' : 'text-main'
        }`}>
          {isIncome ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
          {isIncome ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 inline" />
          ) : (
            <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400 inline" />
          )}
        </p>
      </div>
    </div>
  );
};
