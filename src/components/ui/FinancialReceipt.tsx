import React from 'react';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface FinancialReceiptProps {
  receiptId?: string;
  serviceName: string;
  category: string;
  date: string;
  amount: number;
  currency?: string;
  status?: 'paid' | 'pending' | 'scheduled';
  paymentMethod?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FinancialReceipt: React.FC<FinancialReceiptProps> = ({
  receiptId = "REC-82910",
  serviceName,
  category,
  date,
  amount,
  currency = "USD",
  status = 'paid',
  paymentMethod = "Tarjeta Débito •• 8492",
  icon,
  className,
}) => {
  return (
    <div className={cn("ticket-container overflow-visible relative border border-slate-100/60 w-full max-w-sm", className)}>
      
      {/* Sección Superior: Servicio y Estado */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-squircle-md bg-[#ede9fe] text-[#7b52c9] flex items-center justify-center shrink-0 shadow-sm">
              {icon || <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2a2542]">{serviceName}</h4>
              <p className="text-xs text-[#9f9cb2]">{category} • {receiptId}</p>
            </div>
          </div>

          {/* Badge de Estado */}
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1",
            status === 'paid' && "bg-[#dcfce7] text-[#15803d]",
            status === 'pending' && "bg-[#fef3c7] text-[#b45309]",
            status === 'scheduled' && "bg-[#ede9fe] text-[#7b52c9]"
          )}>
            {status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
            {status === 'pending' && <Clock className="w-3 h-3" />}
            {status === 'paid' ? 'Pagado' : status === 'pending' ? 'Pendiente' : 'Programado'}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs text-[#9f9cb2] font-medium">Monto Total</span>
          <span className="text-2xl font-black text-[#2a2542]">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      {/* Línea Troquelada con hendiduras laterales exactas al Referente 1 */}
      <div className="relative py-1">
        <div className="ticket-notch-left" />
        <div className="ticket-divider mx-4" />
        <div className="ticket-notch-right" />
      </div>

      {/* Sección Inferior: Detalles de Auditoría y Método de Pago */}
      <div className="p-5 pt-3 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#9f9cb2] block">Fecha de Pago</span>
          <span className="font-semibold text-[#5e5977]">{date}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#9f9cb2] block">Medio de Pago</span>
          <span className="font-semibold text-[#7b52c9]">{paymentMethod}</span>
        </div>
      </div>
    </div>
  );
};
