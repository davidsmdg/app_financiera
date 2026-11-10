import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock 
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];
type Income = Database['public']['Tables']['incomes']['Row'];

export interface FinancialCalendarViewProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  incomes: Income[];
  currency?: string;
  onSelectObligation?: (obligation: Obligation) => void;
}

export const FinancialCalendarView: React.FC<FinancialCalendarViewProps> = ({
  obligations,
  payments,
  incomes,
  currency = "COP",
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Total de días en el mes actual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Mapear pagos de este mes para saber si están saldados
  const paidMap = new Map(
    payments
      .filter(p => p.month === currentMonth + 1 && p.year === currentYear)
      .map(p => [p.obligation_id, p])
  );

  // Obtener ingresos de un día específico
  const getIncomesForDay = (day: number) => {
    return incomes.filter(inc => {
      if (!inc.is_active) return false;
      if (inc.income_type === 'occasional' && inc.income_date) {
        const [y, m, d] = inc.income_date.split('-').map(Number);
        return y === currentYear && m === currentMonth + 1 && d === day;
      }
      if (inc.payment_day === day) return true;
      if (inc.frequency === 'biweekly' && (day === 15 || day === 30)) return true;
      return false;
    });
  };

  // Obtener obligaciones/gastos de un día específico
  const getObligationsForDay = (day: number) => {
    return obligations.filter(o => o.is_active && o.due_day === day);
  };

  // Eventos para el día seleccionado
  const selectedDayIncomes = getIncomesForDay(selectedDay);
  const selectedDayObligations = getObligationsForDay(selectedDay);

  const selectedDayTotalIncome = selectedDayIncomes.reduce((acc, i) => acc + Number(i.amount), 0);
  const selectedDayTotalExpense = selectedDayObligations.reduce((acc, o) => acc + Number(o.amount), 0);
  const selectedDayNetBalance = selectedDayTotalIncome - selectedDayTotalExpense;

  // Proyección acumulada hasta el día seleccionado en el mes
  let cumulativeIncomeUntilDay = 0;
  let cumulativeExpenseUntilDay = 0;

  for (let d = 1; d <= selectedDay; d++) {
    cumulativeIncomeUntilDay += getIncomesForDay(d).reduce((acc, i) => acc + Number(i.amount), 0);
    cumulativeExpenseUntilDay += getObligationsForDay(d).reduce((acc, o) => acc + Number(o.amount), 0);
  }
  const expectedMoneyOnDay = cumulativeIncomeUntilDay - cumulativeExpenseUntilDay;

  return (
    <div className="space-y-4 max-w-lg mx-auto select-none pb-8 animate-fade-in">
      
      {/* Cabecera y Navegación de Mes */}
      <div className="bg-white p-4 rounded-squircle-xl shadow-card-soft border border-slate-100 flex items-center justify-between">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(y => y - 1);
            } else {
              setCurrentMonth(m => m - 1);
            }
          }}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-[#2a2542]">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <p className="text-[11px] text-[#9f9cb2]">Calendario de Ingresos y Vencimientos</p>
        </div>

        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(y => y + 1);
            } else {
              setCurrentMonth(m => m + 1);
            }
          }}
          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid del Calendario Mensual */}
      <div className="bg-white p-4 rounded-squircle-xl shadow-card-soft border border-slate-100 space-y-2">
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 text-center">
          {daysOfWeek.map((dow, idx) => (
            <span key={dow} className={`text-[10px] font-black uppercase tracking-wider py-1 ${
              idx === 0 ? 'text-rose-500' : 'text-slate-400'
            }`}>
              {dow}
            </span>
          ))}
        </div>

        {/* Casillas de los días */}
        <div className="grid grid-cols-7 gap-1">
          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 rounded-xl" />
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const dayIncomes = getIncomesForDay(dayNumber);
            const dayObligations = getObligationsForDay(dayNumber);

            const hasIncome = dayIncomes.length > 0;
            const hasExpense = dayObligations.length > 0;
            const isSelected = selectedDay === dayNumber;
            const isToday = today.getDate() === dayNumber && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

            return (
              <div
                key={`day-${dayNumber}`}
                onClick={() => setSelectedDay(dayNumber)}
                className={`h-12 p-1 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#7b52c9] text-white shadow-md shadow-purple-200'
                    : isToday
                    ? 'bg-purple-50 text-[#7b52c9] font-black border border-purple-200'
                    : 'bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className={`text-xs font-bold leading-none mt-0.5 ${
                  isSelected ? 'text-white' : ''
                }`}>
                  {dayNumber}
                </span>

                {/* Puntos de color para eventos */}
                <div className="flex items-center gap-1 mb-1">
                  {hasIncome && (
                    <span 
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300 ring-1 ring-white' : 'bg-emerald-500'}`} 
                      title={`${dayIncomes.length} ingreso(s)`}
                    />
                  )}
                  {hasExpense && (
                    <span 
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-rose-300 ring-1 ring-white' : 'bg-rose-500'}`} 
                      title={`${dayObligations.length} gasto(s)`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda visual */}
        <div className="flex items-center justify-center gap-5 pt-2 border-t border-slate-100 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Ingreso Entrante</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Gasto / Salida</span>
          </div>
        </div>

      </div>

      {/* TARJETA DESTACADA: ¿CUÁNTA PLATA DEBERÍAS TENER PARA ESTE DÍA? */}
      <div className="p-4 rounded-squircle-xl bg-gradient-to-br from-[#7b52c9] via-[#8c65d9] to-[#9d78e8] text-white shadow-card-float space-y-2">
        <div className="flex items-center justify-between text-white/90">
          <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Corte para el {selectedDay} de {monthNames[currentMonth]}
          </span>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
            Día {selectedDay} de {daysInMonth}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[11px] text-white/80 block leading-tight">Plata proyectada para este día:</span>
            <span className="text-2xl font-black tracking-tight text-white">
              {formatCurrency(expectedMoneyOnDay, currency)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/80 block">Movimiento del día</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
              selectedDayNetBalance >= 0 ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
            }`}>
              {selectedDayNetBalance >= 0 ? `+${formatCurrency(selectedDayNetBalance, currency)}` : formatCurrency(selectedDayNetBalance, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* DETALLE DE MOVIMIENTOS DEL DÍA SELECCIONADO */}
      <div className="bg-white p-4 rounded-squircle-xl shadow-card-soft border border-slate-100 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#2a2542] flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#7b52c9]" />
          Eventos programados para el {selectedDay} de {monthNames[currentMonth]}
        </h3>

        {selectedDayIncomes.length === 0 && selectedDayObligations.length === 0 ? (
          <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No tienes pagos ni ingresos programados para el día {selectedDay}.
          </div>
        ) : (
          <div className="space-y-2">
            
            {/* Lista de Ingresos de este día */}
            {selectedDayIncomes.map((inc) => (
              <div 
                key={inc.id}
                className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                    ↓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">{inc.name}</h4>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Ingreso ({inc.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'})
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700">
                  +{formatCurrency(Number(inc.amount), currency)}
                </span>
              </div>
            ))}

            {/* Lista de Gastos / Obligaciones de este día */}
            {selectedDayObligations.map((ob) => {
              const isPaid = paidMap.has(ob.id);
              return (
                <div 
                  key={ob.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isPaid ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-xs">
                      ↑
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isPaid ? 'line-through text-slate-400' : 'text-rose-950'}`}>
                        {ob.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {ob.category} • {isPaid ? 'Pagado este mes' : 'Pendiente por pagar'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-black ${isPaid ? 'text-slate-400' : 'text-rose-700'}`}>
                    -{formatCurrency(Number(ob.amount), currency)}
                  </span>
                </div>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
};
