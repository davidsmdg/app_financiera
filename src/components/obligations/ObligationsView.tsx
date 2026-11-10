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
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ObligationStatsModal } from './ObligationStatsModal';
import { calculateEnelDiagnostics } from '../../lib/energyDiagnostics';
import type { Space } from '../../data/spaces';
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
  spaces?: Space[];
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({
  obligations,
  payments,
  onBack,
  onAddObligation,
  onTogglePay,
  onDeleteObligation,
  currency = "COP",
  spaces = [],
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statsObligation, setStatsObligation] = useState<Obligation | null>(null);

  const today = new Date();
  const currentActualMonth = today.getMonth() + 1;
  const currentActualYear = today.getFullYear();
  const currentDay = today.getDate();

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
        <div className="bg-white p-3.5 sm:p-4 rounded-squircle-xl shadow-card-float border border-slate-100 flex items-center justify-between">
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
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-extrabold text-[#2a2542]">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </h2>
              {selectedMonth === currentActualMonth && selectedYear === currentActualYear && (
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#7b52c9]/10 text-[#7b52c9]">
                  Mes Actual
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#9f9cb2]">Control mensual de compromisos fijos</p>
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
            
            // Una obligación solo está vencida en el mes seleccionado si:
            // 1. El mes/año seleccionado es anterior al mes actual real.
            // 2. O estamos en el mes actual real, pero la obligación pertenecía a este mes (o ya transcurrió su due_day)
            // Y fundamentalmente: si la obligación se creó para una fecha futura (ej. 4 de Noviembre) mientras estamos en Octubre, ¡no debe salir vencida en Octubre!
            const isSelectedMonthCurrent = (selectedYear === currentActualYear && selectedMonth === currentActualMonth);
            const isSelectedMonthPast = (selectedYear < currentActualYear || (selectedYear === currentActualYear && selectedMonth < currentActualMonth));
            
            // Si el día de vencimiento no ha llegado en el ciclo actual o si es de un mes posterior, no está vencida.
            const isOverdue = !isPaid && (
              isSelectedMonthPast ||
              (isSelectedMonthCurrent && currentDay > ob.due_day && false) // En el mes actual no marcamos vencida a menos que sea explícitamente del ciclo anterior
            );

            // Calcular fecha del próximo pago real
            const nextDueMonth = currentDay > ob.due_day ? (currentActualMonth === 12 ? 1 : currentActualMonth + 1) : currentActualMonth;
            const nextDueMonthName = monthNames[nextDueMonth - 1];

            return (
              <div
                key={ob.id}
                className={cn(
                  "p-3.5 sm:p-4 rounded-squircle-lg bg-white border shadow-card-soft transition-all",
                  isPaid ? "border-emerald-100/80 bg-emerald-50/20" : isOverdue ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
                )}
              >
                {/* Estructura Mobile-Friendly y Desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Fila superior / Izquierda: Checkbox + Título + Categoría + Próximo Pago */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onTogglePay(ob.id, isPaid, Number(ob.amount))}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5",
                        isPaid
                          ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200"
                          : "border-2 border-slate-300 hover:border-[#7b52c9] text-transparent"
                      )}
                      title={isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className={cn("text-sm font-bold break-words", isPaid ? "line-through text-slate-400" : "text-[#2a2542]")}>
                          {ob.title}
                        </h4>
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3 h-3" /> Vencida
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9f9cb2] mt-1">
                        <span className="shrink-0">{ob.category}</span>
                        <span className="shrink-0">•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-[#7b52c9]" /> 
                          Próximo pago: {ob.due_day} de {nextDueMonthName}
                        </span>

                        {/* Si es ENEL, badge de tier de consumo deducido */}
                        {ob.title.toLowerCase().includes('enel') && (() => {
                          let occ = 1;
                          const match = ob.title.match(/\[(.*?)\]/);
                          if (match) {
                            const sp = spaces.find(s => s.name.toLowerCase() === match[1].toLowerCase());
                            if (sp?.occupants) occ = sp.occupants;
                          } else if (spaces.length > 0) {
                            occ = spaces[0].occupants || 1;
                          }
                          const diag = calculateEnelDiagnostics(Number(ob.amount), occ);

                          return (
                            <div className="w-full sm:w-auto mt-1 sm:mt-0">
                              <span 
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${diag.badgeColor} cursor-pointer shadow-2xs hover:scale-102 transition-all`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatsObligation(ob);
                                }}
                                title="Haz clic para ver el desglose de energía y consumo"
                              >
                                <span>{diag.statusEmoji}</span>
                                <span>~{diag.estimatedKwh} kWh ({diag.tierLabel})</span>
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Fila inferior (en móvil) o Derecha (en desktop): Monto + Estado + Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className={cn(
                        "text-base sm:text-lg font-black block leading-none",
                        isPaid ? "text-slate-400" : "text-[#2a2542]"
                      )}>
                        {formatCurrency(Number(ob.amount), currency)}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider block mt-1",
                        isPaid ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-[#f59e0b]"
                      )}>
                        {isPaid ? "Pagado" : isOverdue ? "Vencido" : "Por Pagar"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setStatsObligation(ob)}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#7b52c9]/10 text-slate-500 hover:text-[#7b52c9] flex items-center justify-center transition-all cursor-pointer"
                        title="Ver Estadísticas e Histórico"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteObligation(ob.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Eliminar Obligación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal de Estadísticas y Análisis de Costos */}
      <ObligationStatsModal
        obligation={statsObligation}
        payments={payments}
        onClose={() => setStatsObligation(null)}
        currency={currency}
        spaces={spaces}
      />

    </div>
  );
};
