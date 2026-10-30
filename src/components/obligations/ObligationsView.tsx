import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface ObligationsViewProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  onBack: () => void;
  onAddObligation: () => void;
  onTogglePay: (obligationId: string, isPaid: boolean, amount: number) => void;
  onDeleteObligation: (obligationId: string) => void;
  currency?: string;
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({
  obligations,
  payments,
  onBack,
  onAddObligation,
  onTogglePay,
  onDeleteObligation,
  currency = "USD",
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const currentDay = new Date().getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Identificar obligaciones pagadas en este mes/año
  const paidMap = new Map(
    payments
      .filter(p => p.month === selectedMonth && p.year === selectedYear)
      .map(p => [p.obligation_id, p])
  );

  const totalMonthly = obligations.reduce((acc, o) => acc + Number(o.amount), 0);
  const totalPaid = obligations
    .filter(o => paidMap.has(o.id))
    .reduce((acc, o) => acc + Number(o.amount), 0);
  const totalPending = Math.max(totalMonthly - totalPaid, 0);

  // Filtrar lista
  const filteredObligations = obligations.filter(o => {
    const isPaid = paidMap.has(o.id);
    if (filterTab === 'pending') return !isPaid;
    if (filterTab === 'paid') return isPaid;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full select-none pb-12">
      
      {/* Barra de navegación superior con botón Volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#5e5977] hover:text-[#2a2542] py-2 px-3 rounded-full bg-white border border-slate-100 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddObligation}
          icon={<Plus className="w-4 h-4" />}
        >
          Nueva Obligación
        </Button>
      </div>

      {/* Selector de Mes y Año Horizontal */}
      <div className="bg-white p-4 rounded-squircle-xl shadow-card-float border border-slate-100 flex items-center justify-between">
        <button
          onClick={() => {
            if (selectedMonth === 1) {
              setSelectedMonth(12);
              setSelectedYear(y => y - 1);
            } else {
              setSelectedMonth(m => m - 1);
            }
          }}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-[#2a2542]">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
          <p className="text-xs text-[#9f9cb2]">Control mensual de compromisos fijos</p>
        </div>

        <button
          onClick={() => {
            if (selectedMonth === 12) {
              setSelectedMonth(1);
              setSelectedYear(y => y + 1);
            } else {
              setSelectedMonth(m => m + 1);
            }
          }}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tarjetas KPI de Resumen Financiero del Mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-squircle-lg border border-slate-100 shadow-card-soft">
          <span className="text-[10px] uppercase font-bold text-[#9f9cb2] block mb-1">
            Total Comprometido
          </span>
          <div className="text-2xl font-black text-[#2a2542]">
            {formatCurrency(totalMonthly, currency)}
          </div>
          <span className="text-xs text-[#9f9cb2] mt-1 block">
            {obligations.length} pagos recurrentes
          </span>
        </div>

        <div className="bg-white p-5 rounded-squircle-lg border border-slate-100 shadow-card-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600">
              Pagado Este Mes
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(totalPaid, currency)}
          </div>
          <span className="text-xs text-emerald-600/80 mt-1 block">
            {paidMap.size} de {obligations.length} pagados
          </span>
        </div>

        <div className="bg-white p-5 rounded-squircle-lg border border-slate-100 shadow-card-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-[#f59e0b]">
              Pendiente por Salir
            </span>
            <Clock className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f59e0b]">
            {formatCurrency(totalPending, currency)}
          </div>
          <span className="text-xs text-[#f59e0b]/80 mt-1 block">
            {obligations.length - paidMap.size} pendientes
          </span>
        </div>

      </div>

      {/* Pestañas de Filtro */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterTab('all')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            filterTab === 'all'
              ? "bg-[#7b52c9] text-white shadow-card-soft"
              : "bg-white text-[#5e5977] border border-slate-100 hover:bg-slate-50"
          )}
        >
          Todas ({obligations.length})
        </button>

        <button
          onClick={() => setFilterTab('pending')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            filterTab === 'pending'
              ? "bg-[#f59e0b] text-white shadow-card-soft"
              : "bg-white text-[#5e5977] border border-slate-100 hover:bg-slate-50"
          )}
        >
          Por Pagar ({obligations.length - paidMap.size})
        </button>

        <button
          onClick={() => setFilterTab('paid')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            filterTab === 'paid'
              ? "bg-emerald-600 text-white shadow-card-soft"
              : "bg-white text-[#5e5977] border border-slate-100 hover:bg-slate-50"
          )}
        >
          Pagadas ({paidMap.size})
        </button>
      </div>

      {/* Lista de Obligaciones Detalladas */}
      <div className="space-y-3">
        {filteredObligations.length === 0 ? (
          <div className="bg-white p-8 rounded-squircle-xl border border-slate-100 text-center">
            <p className="text-xs text-[#9f9cb2] mb-3">No hay obligaciones en esta categoría.</p>
            <Button variant="secondary" size="sm" onClick={onAddObligation}>
              + Añadir la primera obligación
            </Button>
          </div>
        ) : (
          filteredObligations.map((ob) => {
            const isPaid = paidMap.has(ob.id);
            const isOverdue = !isPaid && currentDay > ob.due_day;

            return (
              <div
                key={ob.id}
                className={cn(
                  "p-4 rounded-squircle-lg bg-white border shadow-card-soft flex items-center justify-between gap-4 transition-all",
                  isPaid ? "border-emerald-100/80 bg-emerald-50/20" : isOverdue ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
                )}
              >
                {/* Checkbox de pago interactivo + Datos de la obligación */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => onTogglePay(ob.id, isPaid, Number(ob.amount))}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0",
                      isPaid
                        ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200"
                        : "border-2 border-slate-300 hover:border-[#7b52c9] text-transparent"
                    )}
                    title={isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("text-sm font-bold truncate", isPaid ? "line-through text-slate-400" : "text-[#2a2542]")}>
                        {ob.title}
                      </h4>
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Vencida
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#9f9cb2] mt-0.5">
                      <span>{ob.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Día {ob.due_day} de cada mes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monto y Botón Eliminar */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className={cn(
                      "text-base font-extrabold block",
                      isPaid ? "text-slate-400" : "text-[#2a2542]"
                    )}>
                      {formatCurrency(Number(ob.amount), currency)}
                    </span>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider block",
                      isPaid ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-[#f59e0b]"
                    )}>
                      {isPaid ? "Pagado" : isOverdue ? "Vencido" : "Pendiente"}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteObligation(ob.id)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                    title="Eliminar Obligación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
