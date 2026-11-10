import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { calculateEnelDiagnostics } from '../../lib/energyDiagnostics';
import { ObligationStatsModal } from './ObligationStatsModal';
import { DebtDetailModal } from './DebtDetailModal';
import type { Space } from '../../data/spaces';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface UnifiedDebtsViewProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  onBack: () => void;
  onAddObligation: () => void;
  onTogglePay: (obligationId: string, isCurrentlyPaid: boolean, amount: number) => Promise<void>;
  onUpdateObligation?: (obligationId: string, updates: Partial<Obligation>) => Promise<void>;
  onDeleteObligation: (obligationId: string) => Promise<void>;
  currency?: string;
  spaces?: Space[];
}

export const UnifiedDebtsView: React.FC<UnifiedDebtsViewProps> = ({
  obligations,
  payments,
  onBack,
  onAddObligation,
  onTogglePay,
  onUpdateObligation,
  onDeleteObligation,
  currency = "COP",
  spaces = [],
}) => {
  // Pestañas de filtrado: Todas, Créditos o Fijos
  const [filterSection, setFilterSection] = useState<'all' | 'debts' | 'recurring'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Modales de detalle
  const [statsObligation, setStatsObligation] = useState<Obligation | null>(null);
  const [selectedDebtForDetail, setSelectedDebtForDetail] = useState<Obligation | null>(null);

  // Fecha actual
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // Mapeo de pagos realizados este mes
  const paidMap = new Map(
    payments
      .filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid')
      .map(p => [p.obligation_id, p])
  );

  // 1. Separar créditos de fijos
  const debts = obligations.filter(o => o.obligation_type === 'debt' || o.category === 'Crédito & Tarjetas');
  const recurring = obligations.filter(o => o.obligation_type !== 'debt' && o.category !== 'Crédito & Tarjetas');

  // 2. Métricas del mes
  const totalMonthlyCommitment = obligations.reduce((acc, o) => acc + Number(o.amount), 0);
  const totalPaidThisMonth = obligations
    .filter(o => paidMap.has(o.id))
    .reduce((acc, o) => acc + Number(o.amount), 0);
  const totalPendingThisMonth = Math.max(totalMonthlyCommitment - totalPaidThisMonth, 0);

  // 3. Deuda acumulada a largo plazo (solo créditos amortizables sobre su saldo real actual)
  const totalLongTermDebt = debts.reduce((acc, d) => {
    const bal = d.current_balance !== null && d.current_balance !== undefined
      ? Number(d.current_balance)
      : (d.total_debt_amount ? Number(d.total_debt_amount) : Number(d.amount) * 12);
    return acc + bal;
  }, 0);

  // Filtrado de lista según tabs
  const filteredList = obligations.filter(o => {
    const isDebt = o.obligation_type === 'debt' || o.category === 'Crédito & Tarjetas';
    if (filterSection === 'debts' && !isDebt) return false;
    if (filterSection === 'recurring' && isDebt) return false;

    const isPaid = paidMap.has(o.id);
    if (statusFilter === 'pending' && isPaid) return false;
    if (statusFilter === 'paid' && !isPaid) return false;

    return true;
  });

  const monthProgressPct = totalMonthlyCommitment > 0 
    ? Math.min(Math.round((totalPaidThisMonth / totalMonthlyCommitment) * 100), 100) 
    : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full select-none pb-12 box-border">
      
      {/* 1. BARRA SUPERIOR CON REGRESO Y ACCIÓN NUEVA */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#5e5977] hover:text-[#2a2542] py-2 px-3 rounded-full bg-white border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddObligation}
          icon={<Plus className="w-4 h-4" />}
        >
          Nueva Deuda / Factura
        </Button>
      </div>

      {/* 2. HERO DUAL: COMPROMISOS DEL MES vs. DEUDA TOTAL A LARGO PLAZO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Card 1: Compromiso a Pagar Este Mes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Compromiso Este Mes
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {paidMap.size} de {obligations.length} saldadas
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#2a2542] tracking-tight block">
              {formatCurrency(totalMonthlyCommitment, currency)}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1">
              <span>Pagado: <strong className="text-emerald-700">{formatCurrency(totalPaidThisMonth, currency)}</strong></span>
              <span>•</span>
              <span>Falta: <strong className="text-rose-600">{formatCurrency(totalPendingThisMonth, currency)}</strong></span>
            </div>
          </div>

          {/* Barra de progreso de pagos del mes */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Progreso mensual</span>
              <span>{monthProgressPct}% completado</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${monthProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Deuda Total a Plazo (Capital) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border border-purple-200/80 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7b52c9] bg-purple-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Deuda Total a Plazo
            </span>
            <span className="text-[10px] font-bold text-purple-700">
              {debts.length} {debts.length === 1 ? 'crédito' : 'créditos'}
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#2a2542] tracking-tight block">
              {formatCurrency(totalLongTermDebt, currency)}
            </span>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Capital total pendiente en bancos y créditos de consumo.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-100/50 border border-purple-200/60 text-[10px] font-bold text-[#7b52c9] flex items-center justify-between">
            <span>Cuotas de créditos este mes:</span>
            <span className="font-black text-xs">
              {formatCurrency(debts.reduce((acc, d) => acc + Number(d.amount), 0), currency)}
            </span>
          </div>
        </div>

      </div>

      {/* 3. TABS Y FILTROS INTELIGENTES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Filtro por tipo: Todos / Créditos / Fijos */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setFilterSection('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSection === 'all'
                ? 'bg-white text-[#2a2542] shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Todas ({obligations.length})
          </button>
          <button
            onClick={() => setFilterSection('debts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSection === 'debts'
                ? 'bg-purple-600 text-white shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Créditos ({debts.length})
          </button>
          <button
            onClick={() => setFilterSection('recurring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSection === 'recurring'
                ? 'bg-white text-[#2a2542] shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Facturas & Fijos ({recurring.length})
          </button>
        </div>

        {/* Filtro por estado: Pendientes / Pagadas */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Por Pagar ({obligations.length - paidMap.size})
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pagadas ({paidMap.size})
          </button>
        </div>

      </div>

      {/* 4. LISTADO DE OBLIGACIONES Y CRÉDITOS */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-400">No hay deudas u obligaciones registradas con este filtro.</p>
            <Button variant="secondary" size="sm" onClick={onAddObligation}>
              + Añadir obligación
            </Button>
          </div>
        ) : (
          filteredList.map((ob) => {
            const isPaid = paidMap.has(ob.id);
            const isDebt = ob.obligation_type === 'debt' || ob.category === 'Crédito & Tarjetas';
            const isOverdue = !isPaid && ob.due_day < currentDay;

            // Formateo explícito de la fecha de vencimiento con mes
            const monthNames = [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            const currentMonthName = monthNames[currentMonth - 1];
            // Si ya está pagado o si el día ya pasó este mes, el próximo vencimiento corresponde al mes siguiente
            const nextDueMonthName = (isPaid || ob.due_day < currentDay) 
              ? monthNames[currentMonth % 12] 
              : currentMonthName;

            // En caso de crédito: tomar el saldo exacto registrado / editado por el usuario
            const curBalance = ob.current_balance !== null && ob.current_balance !== undefined
              ? Number(ob.current_balance)
              : (ob.total_debt_amount ? Number(ob.total_debt_amount) : Number(ob.amount) * 12);
            
            const paidInst = ob.paid_installments || (isPaid ? 2 : 0);
            const totalInst = ob.total_installments || 30;
            const progressInstPct = Math.min(Math.round((paidInst / totalInst) * 100), 100);

            return (
              <div
                key={ob.id}
                className={`p-4 rounded-2xl border transition-all select-none ${
                  isPaid 
                    ? 'bg-slate-50/80 border-slate-200/80 opacity-80' 
                    : isOverdue 
                    ? 'bg-rose-50/40 border-rose-200 shadow-card-soft' 
                    : isDebt
                    ? 'bg-white border-purple-200/70 shadow-card-soft hover:border-purple-300'
                    : 'bg-white border-slate-200/80 shadow-card-soft hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Lado Izquierdo: Icono + Título + Info contextual (Clic para abrir detalle) */}
                  <div 
                    onClick={() => {
                      if (isDebt) setSelectedDebtForDetail(ob);
                      else setStatsObligation(ob);
                    }}
                    className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer group"
                    title={isDebt ? "Haz clic para ver extracto, videos y simular abono" : "Haz clic para ver histórico de costos"}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                      isDebt ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isDebt ? <CreditCard className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
                          isDebt ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isDebt ? 'Crédito a Plazo' : ob.category}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vencida
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold mt-0.5 truncate group-hover:text-purple-700 transition-colors ${
                        isPaid ? 'line-through text-slate-400' : 'text-[#2a2542]'
                      }`}>
                        {ob.title}
                      </h4>

                      {/* Información contextual especializada */}
                      {isDebt ? (
                        <div className="mt-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>Saldo: <strong className="text-[#2a2542]">{formatCurrency(curBalance, currency)}</strong></span>
                            <span>•</span>
                            <span>Cuota {paidInst} de {totalInst}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-purple-700">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              {isPaid ? `Próximo: ${ob.due_day} de ${nextDueMonthName}` : `Límite: ${ob.due_day} de ${currentMonthName}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-purple-600 h-full rounded-full" 
                                style={{ width: `${progressInstPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-purple-600 group-hover:underline">
                              Ver extracto y videos →
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className={`flex items-center gap-1 font-bold ${isOverdue ? 'text-rose-600' : isPaid ? 'text-emerald-700' : 'text-slate-700'}`}>
                            <Calendar className="w-3 h-3 text-[#7b52c9]" />
                            {isPaid 
                              ? `Pagada · Próxima: ${ob.due_day} de ${nextDueMonthName}` 
                              : isOverdue 
                              ? `Venció el ${ob.due_day} de ${currentMonthName}` 
                              : `Vence el ${ob.due_day} de ${currentMonthName}`}
                          </span>

                          {/* Diagnóstico si es Enel / Energía */}
                          {ob.title.toLowerCase().includes('enel') && (() => {
                            let occ = 1;
                            const match = ob.title.match(/\[(.*?)\]/);
                            if (match) {
                              const sp = spaces.find(s => s.name.toLowerCase() === match[1].toLowerCase());
                              if (sp?.occupants) occ = sp.occupants;
                            }
                            const diag = calculateEnelDiagnostics(Number(ob.amount), occ);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${diag.badgeColor}`}>
                                {diag.statusEmoji} ~{diag.estimatedKwh} kWh
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lado Derecho: Monto de la cuota/factura + Botón ¿Pagado? + Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-base font-black block leading-none ${
                        isPaid ? 'line-through text-slate-400' : 'text-[#2a2542]'
                      }`}>
                        {formatCurrency(Number(ob.amount), currency)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mt-1 ${
                        isPaid ? 'text-emerald-600' : isOverdue ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {isPaid ? 'Pagado este mes' : isOverdue ? 'Vencido' : 'Por pagar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Botón de alternar pago */}
                      <button
                        onClick={() => onTogglePay(ob.id, isPaid, Number(ob.amount))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-[#7b52c9] text-white hover:bg-[#683cc7]'
                        }`}
                        title={isPaid ? "Marcado como pagado este mes" : "Marcar como pagado"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isPaid ? "Pagado" : "¿Pagado?"}</span>
                      </button>

                      {/* Botón de Estadísticas para servicios */}
                      {!isDebt && (
                        <button
                          onClick={() => setStatsObligation(ob)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-700 flex items-center justify-center transition-all cursor-pointer"
                          title="Ver histórico de pagos"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botón de eliminar */}
                      <button
                        onClick={() => onDeleteObligation(ob.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Eliminar de la lista"
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

      {/* MODAL DE HISTORIAL PARA SERVICIOS (ENEL, CLARO, ETC.) */}
      <ObligationStatsModal
        obligation={statsObligation}
        payments={payments}
        onClose={() => setStatsObligation(null)}
        currency={currency}
        spaces={spaces}
      />

      {/* MODAL DE DETALLE Y EXTRACTO PARA CRÉDITOS (LULO, NEQUI, BANCOLOMBIA) */}
      {selectedDebtForDetail && (
        <DebtDetailModal
          debt={selectedDebtForDetail}
          payments={payments}
          onUpdateDebt={onUpdateObligation}
          onClose={() => setSelectedDebtForDetail(null)}
          currency={currency}
        />
      )}

    </div>
  );
};
