import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { calculateEnelDiagnostics } from '../../lib/energyDiagnostics';
import type { Space } from '../../data/spaces';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface ObligationStatsModalProps {
  obligation: Obligation | null;
  payments: ObligationPayment[];
  onClose: () => void;
  currency?: string;
  spaces?: Space[];
}

export const ObligationStatsModal: React.FC<ObligationStatsModalProps> = ({
  obligation,
  payments,
  onClose,
  currency = "COP",
  spaces = [],
}) => {
  if (!obligation) return null;

  // Filtrar pagos exclusivos de esta obligación y ordenarlos cronológicamente (más antiguo a más nuevo)
  const obligationPayments = payments
    .filter(p => p.obligation_id === obligation.id && p.status === 'paid')
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Si no hay pagos registrados aún, creamos una referencia base con el monto actual de la obligación
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Obtener último monto pagado o configurado
  const latestPayment = obligationPayments.length > 0 
    ? obligationPayments[obligationPayments.length - 1] 
    : null;

  const currentAmount = latestPayment 
    ? Number(latestPayment.amount_paid) 
    : Number(obligation.amount);

  // Obtener pago del mes anterior
  const getAmountMonthsAgo = (monthsAgo: number) => {
    const targetDate = new Date(currentYear, currentMonth - 1 - monthsAgo, 1);
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();

    const found = obligationPayments.find(p => p.month === targetMonth && p.year === targetYear);
    return found ? Number(found.amount_paid) : null;
  };

  const prevMonthAmount = getAmountMonthsAgo(1);
  const sixMonthsAgoAmount = getAmountMonthsAgo(6);
  const oneYearAgoAmount = getAmountMonthsAgo(12);

  // Calcular variaciones porcentuales puras: ((actual - anterior) / anterior) * 100
  const calcChange = (pastAmount: number | null) => {
    if (pastAmount === null || pastAmount === 0) return null;
    const pct = ((currentAmount - pastAmount) / pastAmount) * 100;
    return Math.round(pct * 10) / 10; // 1 decimal
  };

  const diff1Month = calcChange(prevMonthAmount);
  const diff6Months = calcChange(sixMonthsAgoAmount);
  const diff1Year = calcChange(oneYearAgoAmount);

  // Evaluar diagnóstico financiero con Caritas y Mensaje según variación real
  const evaluateHealth = (pct: number | null) => {
    if (pct === null) {
      return {
        emoji: "😊",
        status: "normal",
        title: "Tarifa Estable / En Registro",
        message: "No se registran aumentos drásticos recientes en tus pagos.",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    }

    if (pct <= 0) {
      return {
        emoji: "🤩",
        status: "favorable",
        title: "¡Excelente para tu bolsillo!",
        message: `El costo ha bajado un ${Math.abs(pct)}%. Tienes un alivio en tus finanzas este periodo.`,
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    } else if (pct <= 5) {
      return {
        emoji: "🙂",
        status: "normal",
        title: "Aumento Normal / Esperado",
        message: `Subió un ${pct}%, lo cual se encuentra dentro del rango de variación habitual o inflación.`,
        color: "text-blue-700 bg-blue-50 border-blue-200"
      };
    } else if (pct <= 15) {
      return {
        emoji: "🧐",
        status: "cuidado",
        title: "Ojo: Ten Cuidado",
        message: `Subió un ${pct}%. Empieza a notar un incremento por encima de lo usual. Monitorea tu consumo.`,
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    } else {
      return {
        emoji: "🚨",
        status: "alerta",
        title: "¡Alerta! Subida Inusual",
        message: `Subió un ${pct}%. Este incremento no es normal; revisa cobros no autorizados, reconexiones o fugas de consumo.`,
        color: "text-rose-700 bg-rose-50 border-rose-200"
      };
    }
  };

  // Usamos la variación más reciente disponible (1 mes, o 6 meses, o 1 año)
  const mainDiff = diff1Month !== null ? diff1Month : (diff6Months !== null ? diff6Months : diff1Year);
  const healthAnalysis = evaluateHealth(mainDiff);

  // Máximo para escala visual de barras
  const maxBarAmount = Math.max(
    currentAmount,
    ...obligationPayments.map(p => Number(p.amount_paid)),
    1
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden select-none">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#7b52c9] bg-[#7b52c9]/10 px-2 py-0.5 rounded-full">
                {obligation.category}
              </span>
              <span className="text-xs text-slate-400">• Vence día {obligation.due_day}</span>
            </div>
            <h3 className="text-base font-extrabold text-[#2a2542] mt-0.5">{obligation.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          
          {/* Si es ENEL / Energía: Diagnóstico automático de Consumo (kWh) y subsidio deducido del valor */}
          {obligation.title.toLowerCase().includes('enel') && (() => {
            // Encontrar ocupantes del espacio asociado si existe en el título [Espacio]
            let occ = 1;
            const match = obligation.title.match(/\[(.*?)\]/);
            if (match) {
              const sp = spaces.find(s => s.name.toLowerCase() === match[1].toLowerCase());
              if (sp?.occupants) occ = sp.occupants;
            } else if (spaces.length > 0) {
              occ = spaces[0].occupants || 1;
            }

            const diag = calculateEnelDiagnostics(currentAmount, occ);

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    ⚡ Análisis Automático de Factura (Enel)
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                    {occ} {occ === 1 ? 'persona' : 'personas'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white/90 p-3 rounded-xl border border-blue-100 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Consumo Deducido</span>
                    <span className="text-sm font-black text-blue-700">~{diag.estimatedKwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Energía Neta</span>
                    <span className="text-xs font-extrabold text-slate-700">{formatCurrency(diag.estimatedEnergyAmount, currency)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Aseo (LIME)</span>
                    <span className="text-xs font-extrabold text-slate-700">{formatCurrency(diag.estimatedAseoAmount, currency)}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-semibold ${diag.badgeColor}`}>
                  <span className="text-xl shrink-0">{diag.statusEmoji}</span>
                  <div>
                    <div className="font-black uppercase tracking-wider text-[11px] mb-0.5">{diag.tierLabel}</div>
                    <div className="leading-relaxed">{diag.explanation}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Card de Diagnóstico con Caritas */}
          <div className={`p-4 rounded-2xl border ${healthAnalysis.color} flex items-start gap-3.5 shadow-xs`}>
            <div className="text-3xl shrink-0 p-1 bg-white/70 rounded-xl shadow-2xs">
              {healthAnalysis.emoji}
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">{healthAnalysis.title}</h4>
              <p className="text-xs mt-1 leading-relaxed font-medium">
                {healthAnalysis.message}
              </p>
            </div>
          </div>

          {/* Comparativo de Variación en 1 Mes, 6 Meses y 1 Año */}
          <div>
            <span className="text-[10px] font-bold text-[#9f9cb2] uppercase tracking-wider block mb-2">
              Variación Histórica del Costo
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Último mes */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Último Mes</span>
                {diff1Month !== null ? (
                  <div className="flex items-center justify-center gap-1">
                    {diff1Month > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : diff1Month < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-sm font-black ${
                      diff1Month > 0 ? 'text-rose-600' : diff1Month < 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {diff1Month > 0 ? `+${diff1Month}%` : `${diff1Month}%`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Sin datos</span>
                )}
                <span className="text-[9px] text-slate-400 block mt-1">vs mes anterior</span>
              </div>

              {/* Últimos 6 meses */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Últimos 6 Meses</span>
                {diff6Months !== null ? (
                  <div className="flex items-center justify-center gap-1">
                    {diff6Months > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : diff6Months < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-sm font-black ${
                      diff6Months > 0 ? 'text-rose-600' : diff6Months < 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {diff6Months > 0 ? `+${diff6Months}%` : `${diff6Months}%`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Sin datos</span>
                )}
                <span className="text-[9px] text-slate-400 block mt-1">vs hace 6 meses</span>
              </div>

              {/* Último año */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Último Año</span>
                {diff1Year !== null ? (
                  <div className="flex items-center justify-center gap-1">
                    {diff1Year > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : diff1Year < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-sm font-black ${
                      diff1Year > 0 ? 'text-rose-600' : diff1Year < 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {diff1Year > 0 ? `+${diff1Year}%` : `${diff1Year}%`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Sin datos</span>
                )}
                <span className="text-[9px] text-slate-400 block mt-1">vs hace 1 año</span>
              </div>

            </div>
          </div>

          {/* Gráfico Visual de Historial Mes a Mes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#9f9cb2] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7b52c9]" /> Historial de Pagos Mes a Mes
              </span>
              <span className="text-xs font-black text-[#2a2542]">
                Actual: {formatCurrency(currentAmount, currency)}
              </span>
            </div>

            {obligationPayments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                Aún no tienes pagos registrados con checkbox en este servicio. Cada mes que marques tu pago se irá graficando automáticamente aquí.
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {obligationPayments.slice(-6).map((pay) => {
                  const payAmount = Number(pay.amount_paid);
                  const barPercent = Math.min(Math.round((payAmount / maxBarAmount) * 100), 100);

                  return (
                    <div key={pay.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-600">
                          {monthNames[pay.month - 1]} {pay.year}
                        </span>
                        <span className="font-extrabold text-[#2a2542]">
                          {formatCurrency(payAmount, currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#7b52c9] to-[#9b6ef5] h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
