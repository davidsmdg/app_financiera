import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Database } from '../../types/supabase';

type Income = Database['public']['Tables']['incomes']['Row'];
type Obligation = Database['public']['Tables']['obligations']['Row'];

export interface FinancialHealthWidgetProps {
  incomes: Income[];
  obligations: Obligation[];
  currency?: string;
  onAddIncome: () => void;
  onOpenDetails?: () => void;
}

export const FinancialHealthWidget: React.FC<FinancialHealthWidgetProps> = ({
  incomes,
  obligations,
  currency = "COP",
  onAddIncome,
}) => {
  // 1. Proyectar ingresos mensuales totales
  const totalMonthlyIncome = incomes
    .filter(inc => inc.is_active)
    .reduce((acc, inc) => {
      const amt = Number(inc.amount);
      if (inc.income_type === 'occasional') {
        // Ingreso ocasional de este mes
        return acc + amt;
      }
      if (inc.frequency === 'biweekly') return acc + (amt * 2);
      if (inc.frequency === 'weekly') return acc + (amt * 4);
      return acc + amt;
    }, 0);

  // 2. Total compromisos del mes (servicios fijos + cuotas de crédito)
  const totalMonthlyCommitments = obligations
    .filter(o => o.is_active)
    .reduce((acc, o) => acc + Number(o.amount), 0);

  // 3. Dinero libre real para gastar
  const freeMoney = totalMonthlyIncome - totalMonthlyCommitments;

  // 4. Porcentaje de carga de deuda y compromisos
  const commitmentRatio = totalMonthlyIncome > 0 
    ? Math.round((totalMonthlyCommitments / totalMonthlyIncome) * 100)
    : 0;

  // 5. Diagnóstico de semáforo financiero
  const getHealthStatus = () => {
    if (totalMonthlyIncome === 0) {
      return {
        level: 'empty',
        color: 'text-slate-500 bg-slate-100 border-slate-200',
        badge: 'Sin ingresos registrados',
        message: 'Registra tus ingresos para calcular tu dinero libre y capacidad real de gasto.',
        icon: Info
      };
    }
    if (commitmentRatio <= 35) {
      return {
        level: 'good',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: '🟢 Excelente Salud Financiera',
        message: `Tus compromisos ocupan el ${commitmentRatio}% de tus ingresos. Tienes margen para ahorrar o invertir.`,
        icon: ShieldCheck
      };
    } else if (commitmentRatio <= 50) {
      return {
        level: 'warning',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: '🟡 Nivel Moderado / Al Límite',
        message: `Tus compromisos ocupan el ${commitmentRatio}% de tus ingresos. Procura no adquirir más deudas a cuotas.`,
        icon: AlertTriangle
      };
    } else {
      return {
        level: 'danger',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badge: '🔴 Alerta de Sobreendeudamiento',
        message: `Tus compromisos superan el ${commitmentRatio}% de tus ingresos. Es prioritario reducir gastos o consolidar deudas.`,
        icon: AlertTriangle
      };
    }
  };

  const health = getHealthStatus();

  return (
    <div className="bg-white rounded-squircle-xl p-4 sm:p-5 border border-slate-100 shadow-card-soft space-y-4 select-none">
      
      {/* Cabecera del Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2a2542] leading-tight">Flujo de Caja e Ingresos</h3>
            <p className="text-[11px] text-[#9f9cb2]">¿Cuánto entra y cuánto te queda libre este mes?</p>
          </div>
        </div>

        <button
          onClick={onAddIncome}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-all border border-emerald-200 active:scale-95 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Ingreso</span>
        </button>
      </div>

      {/* Grid de 3 Métricas: Ingresos, Compromisos y Dinero Libre */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Total Ingresos */}
        <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
            Ingresos Estimados
          </span>
          <div className="text-xl font-black text-emerald-700">
            {formatCurrency(totalMonthlyIncome, currency)}
          </div>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
            {incomes.length} {incomes.length === 1 ? 'fuente' : 'fuentes registradas'}
          </span>
        </div>

        {/* Total Compromisos */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Gastos & Deudas Mes
          </span>
          <div className="text-xl font-black text-[#2a2542]">
            {formatCurrency(totalMonthlyCommitments, currency)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {obligations.length} pagos del mes
          </span>
        </div>

        {/* Dinero Libre para Gastar */}
        <div className={`p-3.5 rounded-2xl border shadow-2xs ${
          freeMoney >= 0 ? 'bg-indigo-50/60 border-indigo-100 text-indigo-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider block mb-0.5">
            Dinero Libre para Gastar
          </span>
          <div className="text-xl font-black">
            {formatCurrency(freeMoney, currency)}
          </div>
          <span className="text-[10px] mt-0.5 block font-semibold opacity-80">
            {freeMoney >= 0 ? 'Disponible sin endeudarte' : 'Déficit este mes'}
          </span>
        </div>

      </div>

      {/* Semáforo de Diagnóstico y Barra de Capacidad */}
      {totalMonthlyIncome > 0 && (
        <div className="space-y-2">
          
          {/* Barra de progreso de gastos vs ingresos */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-600">Capacidad Comprometida:</span>
              <span className={commitmentRatio > 50 ? 'text-rose-600' : 'text-slate-700'}>
                {commitmentRatio}% del total
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${
                  commitmentRatio <= 35 ? 'bg-emerald-500' : commitmentRatio <= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(commitmentRatio, 100)}%` }}
              />
            </div>
          </div>

          {/* Banner de Diagnóstico */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${health.color}`}>
            <span className="text-base shrink-0">
              <health.icon className="w-4 h-4" />
            </span>
            <div className="leading-snug">
              <strong>{health.badge}:</strong> {health.message}
            </div>
          </div>

        </div>
      )}

      {/* Si aún no tiene ingresos, banner amigable para invitarlo a agregar */}
      {incomes.length === 0 && (
        <div 
          onClick={onAddIncome}
          className="p-3 bg-emerald-50/60 hover:bg-emerald-50 border border-dashed border-emerald-300 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-900 font-semibold">
              Agrega tu sueldo o quincena para saber exactamente cuánto dinero tienes libre al mes.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
        </div>
      )}

    </div>
  );
};
