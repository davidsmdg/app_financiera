import React, { useState } from 'react';
import { 
  PieChart as PieChartIcon, 
  CreditCard, 
  Receipt, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { simulatePrepayment } from '../../lib/loanCalculator';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];

export interface DebtsOverviewSectionProps {
  obligations: Obligation[];
  currency?: string;
  onOpenObligations: () => void;
}

export const DebtsOverviewSection: React.FC<DebtsOverviewSectionProps> = ({
  obligations,
  currency = "COP",
  onOpenObligations,
}) => {
  // 1. Separar obligaciones corrientes de deudas a plazo
  const debts = obligations.filter(o => o.obligation_type === 'debt' || o.category === 'Crédito & Tarjetas');
  const recurringServices = obligations.filter(o => o.obligation_type !== 'debt' && o.category !== 'Crédito & Tarjetas');

  // Total deuda a largo plazo (capital pendiente)
  const totalDebtBalance = debts.reduce((acc, d) => {
    const bal = d.current_balance !== null && d.current_balance !== undefined 
      ? Number(d.current_balance) 
      : (d.total_debt_amount ? Number(d.total_debt_amount) : Number(d.amount) * 6);
    return acc + bal;
  }, 0);

  // Total cuotas del mes de los créditos
  const monthlyDebtPayments = debts.reduce((acc, d) => acc + Number(d.amount), 0);

  // Total gastos mensuales recurrentes (servicios, arriendos, etc.)
  const monthlyRecurringPayments = recurringServices.reduce((acc, r) => acc + Number(r.amount), 0);

  // Total que sale este mes en compromisos
  const totalMonthlyCommitments = monthlyDebtPayments + monthlyRecurringPayments;

  // Cálculo de porcentajes para la gráfica de dona
  const grandTotalRepresented = totalDebtBalance + monthlyRecurringPayments;
  const debtPct = grandTotalRepresented > 0 ? Math.round((totalDebtBalance / grandTotalRepresented) * 100) : 0;
  const recurringPct = 100 - debtPct;

  // Estado del simulador de abono rápido
  const [selectedDebtId, setSelectedDebtId] = useState<string>(debts[0]?.id || '');
  const [extraPaymentAmount, setExtraPaymentAmount] = useState<number>(50000);

  const selectedDebt = debts.find(d => d.id === selectedDebtId) || debts[0];

  // Cálculo de simulación en tiempo real
  const simResult = selectedDebt ? simulatePrepayment(
    Number(selectedDebt.current_balance || selectedDebt.total_debt_amount || 473585),
    Number(selectedDebt.monthly_rate || 3.85),
    Number(selectedDebt.total_installments || 17) - Number(selectedDebt.paid_installments || 0),
    Number(selectedDebt.insurance_fee || 2000),
    extraPaymentAmount
  ) : null;

  return (
    <div className="bg-white rounded-squircle-xl p-5 border border-slate-100 shadow-card-soft space-y-5 select-none">
      
      {/* Cabecera de la Sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7b52c9] flex items-center justify-center shadow-xs">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2a2542] leading-tight">Tus Deudas y Compromisos</h3>
            <p className="text-[11px] text-[#9f9cb2]">Radiografía entre tus pasivos a plazo y tus gastos mes a mes</p>
          </div>
        </div>

        <button
          onClick={onOpenObligations}
          className="text-xs font-bold text-[#7b52c9] hover:text-[#683cc7] flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>Ver todas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Gráfica de Torta / Donut y Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
        
        {/* Gráfica SVG Donut Visual */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Círculo base (Servicios mes a mes - Naranja) */}
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="4"
              />
              {/* Segmento Créditos a largo plazo (Púrpura) */}
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke="#7b52c9"
                strokeWidth="4"
                strokeDasharray={`${debtPct} ${100 - debtPct}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Pasivo Total</span>
              <span className="text-sm font-black text-[#2a2542] block mt-0.5">
                {formatCurrency(totalDebtBalance, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold mt-2">
            <span className="flex items-center gap-1.5 text-[#7b52c9]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7b52c9]" />
              Créditos ({debtPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-[#f59e0b]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              Fijos Mes ({recurringPct}%)
            </span>
          </div>
        </div>

        {/* Resumen de Cifras */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Card Créditos a Largo Plazo */}
          <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-extrabold text-[#7b52c9] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Deuda a Plazo
              </span>
              <span className="text-[10px] bg-purple-50 text-[#7b52c9] px-2 py-0.5 rounded-full font-bold">
                {debts.length} {debts.length === 1 ? 'crédito' : 'créditos'}
              </span>
            </div>
            <div className="text-lg font-black text-[#2a2542]">
              {formatCurrency(totalDebtBalance, currency)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Cuota de este mes: <strong className="text-slate-700">{formatCurrency(monthlyDebtPayments, currency)}</strong>
            </p>
          </div>

          {/* Card Gastos Fijos Mes a Mes */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-extrabold text-[#f59e0b] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> Servicios y Fijos
              </span>
              <span className="text-[10px] bg-amber-50 text-[#f59e0b] px-2 py-0.5 rounded-full font-bold">
                {recurringServices.length} obligaciones
              </span>
            </div>
            <div className="text-lg font-black text-[#2a2542]">
              {formatCurrency(monthlyRecurringPayments, currency)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Total salida fija mensual: <strong className="text-slate-700">{formatCurrency(totalMonthlyCommitments, currency)}</strong>
            </p>
          </div>

        </div>

      </div>

      {/* SIMULADOR INTELIGENTE DE ABONO A CAPITAL */}
      {debts.length > 0 && selectedDebt && simResult && (
        <div className="p-4 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 rounded-2xl border border-purple-200/80 space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7b52c9] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2a2542]">
                  Simulador de Abono a Capital ({selectedDebt.title})
                </h4>
                <p className="text-[10px] text-slate-400">
                  Mira el impacto real de pagar de más en tu crédito
                </p>
              </div>
            </div>

            {/* Selector de crédito si tiene más de uno */}
            {debts.length > 1 && (
              <select
                value={selectedDebtId}
                onChange={(e) => setSelectedDebtId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-purple-200 rounded-xl px-2.5 py-1 outline-none"
              >
                {debts.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Opciones de abono rápido */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">¿Cuánto quieres abonar de más este mes?</span>
              <span className="font-black text-[#7b52c9] text-sm">
                +{formatCurrency(extraPaymentAmount, currency)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[30000, 50000, 100000, 200000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExtraPaymentAmount(val)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    extraPaymentAmount === val
                      ? 'bg-[#7b52c9] text-white border-[#7b52c9] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  +{formatCurrency(val, currency).replace('$','')}
                </button>
              ))}
            </div>
          </div>

          {/* Comparación: Bajar Plazo vs Bajar Cuota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Opción A: Bajar Plazo (Recomendada) */}
            <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Opción 1: Reducir Plazo (Ahorro)
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  Recomendada
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-snug">
                Te ahorras <strong className="text-emerald-700 font-black">{simResult.reduceTerm.savedInstallments} cuotas</strong> de deuda.
              </p>
              <div className="text-[10px] text-slate-400">
                Ahorro estimado en intereses: <strong className="text-emerald-600">~{formatCurrency(simResult.reduceTerm.savedInterestsEstimate, currency)}</strong>
              </div>
            </div>

            {/* Opción B: Bajar Cuota */}
            <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                Opción 2: Reducir Cuota Mensual
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-snug">
                Tu cuota baja a <strong className="text-blue-700 font-black">{formatCurrency(simResult.reduceInstallment.newInstallment, currency)}</strong>/mes.
              </p>
              <div className="text-[10px] text-slate-400">
                Alivio mensual en tu bolsillo: <strong className="text-blue-600">-{formatCurrency(simResult.reduceInstallment.installmentReduction, currency)}</strong>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
