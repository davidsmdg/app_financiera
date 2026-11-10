import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Plus } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface ObligationsDashboardWidgetProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  onOpenDetails: () => void;
  onAddObligation: () => void;
  onQuickPay: (obligationId: string, amount: number) => void;
  currency?: string;
  className?: string;
}

export const ObligationsDashboardWidget: React.FC<ObligationsDashboardWidgetProps> = ({
  obligations,
  payments,
  onOpenDetails,
  onAddObligation,
  onQuickPay,
  currency = "COP",
  className,
}) => {
  const currentDay = new Date().getDate();

  // Calcular totales
  const totalAmount = obligations.reduce((acc, o) => acc + Number(o.amount), 0);
  const paidObligationIds = new Set(payments.map(p => p.obligation_id));
  
  const paidAmount = obligations
    .filter(o => paidObligationIds.has(o.id))
    .reduce((acc, o) => acc + Number(o.amount), 0);

  const pendingAmount = Math.max(totalAmount - paidAmount, 0);
  const percentagePaid = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Próxima obligación a vencer (pendiente y con due_day >= currentDay)
  const upcomingPending = obligations
    .filter(o => !paidObligationIds.has(o.id))
    .sort((a, b) => {
      // Orden circular respecto al día de hoy
      const diffA = a.due_day >= currentDay ? a.due_day - currentDay : a.due_day + 31 - currentDay;
      const diffB = b.due_day >= currentDay ? b.due_day - currentDay : b.due_day + 31 - currentDay;
      return diffA - diffB;
    });

  const nextDue = upcomingPending[0];
  const daysUntilNext = nextDue ? (nextDue.due_day >= currentDay ? nextDue.due_day - currentDay : nextDue.due_day + 31 - currentDay) : null;

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between select-none", className)}>
      
      {/* Header del Widget con botón de ver todo */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7b52c9]" />
            <h3 className="text-sm font-extrabold text-[#2a2542] tracking-tight">Obligaciones del Mes</h3>
          </div>
          <p className="text-xs text-[#9f9cb2] mt-0.5">
            {obligations.length} compromisos registrados
          </p>
        </div>

        <div>
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1 text-xs font-bold text-[#7b52c9] hover:text-[#6a42b8] transition-colors cursor-pointer py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100/80"
          >
            <span>Ver detalles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monto Total y Progreso Visual */}
      <div className="my-2">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl sm:text-3xl font-black text-[#2a2542] tracking-tight">
            {formatCurrency(totalAmount, currency)}
          </span>
          <span className="text-xs font-bold text-[#7b52c9] bg-[#ede9fe] px-2.5 py-0.5 rounded-full">
            {percentagePaid}% cubierto
          </span>
        </div>

        {/* Barra de progreso de cumplimiento bicolor */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden my-2.5 flex">
          <div
            style={{ width: `${percentagePaid}%` }}
            className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] transition-all duration-500 rounded-full"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold pt-1">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pagado: <strong>{formatCurrency(paidAmount, currency)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#f59e0b]">
            <Clock className="w-3.5 h-3.5" />
            <span>Resta: <strong>{formatCurrency(pendingAmount, currency)}</strong></span>
          </div>
        </div>
      </div>

      {/* Alerta de Vencimiento Inminente (Ticker de Urgencia) */}
      {nextDue ? (
        <div className={cn(
          "mt-4 p-3.5 rounded-squircle-md border flex items-center justify-between transition-all",
          daysUntilNext !== null && daysUntilNext <= 3
            ? "bg-rose-50/80 border-rose-100 text-rose-700"
            : "bg-[#f4effb]/70 border-violet-100/70 text-[#2a2542]"
        )}>
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              daysUntilNext !== null && daysUntilNext <= 3
                ? "bg-rose-500 text-white"
                : "bg-[#7b52c9] text-white"
            )}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {nextDue.title} (Día {nextDue.due_day})
              </p>
              <p className="text-[10px] opacity-80 font-medium">
                {daysUntilNext === 0 
                  ? "¡Vence HOY!" 
                  : daysUntilNext === 1 
                  ? "Vence mañana" 
                  : `Vence en ${daysUntilNext} días`} • {formatCurrency(Number(nextDue.amount), currency)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onQuickPay(nextDue.id, Number(nextDue.amount))}
            className="px-3 py-1.5 rounded-full bg-white font-bold text-xs shadow-sm hover:shadow transition-all shrink-0 border border-slate-200/80 active:scale-95 cursor-pointer"
          >
            Pagar
          </button>
        </div>
      ) : (
        <div className="mt-4 p-3 rounded-squircle-md bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Genial! Todas las obligaciones de este mes están cubiertas.</span>
        </div>
      )}

      {/* Botón Principal para Añadir Obligación (Ancho completo, abajo del cuadro) */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onAddObligation}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-btn-primary rounded-2xl py-3 font-extrabold text-xs"
        >
          Añadir Obligación
        </Button>
      </div>

    </div>
  );
};
