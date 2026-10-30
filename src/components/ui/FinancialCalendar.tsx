import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export interface CalendarEvent {
  date: number; // día del mes (1-31)
  type: 'payment' | 'income' | 'savings';
  amount: number;
  title: string;
}

export interface FinancialCalendarProps {
  monthName?: string;
  year?: number;
  events: CalendarEvent[];
  currency?: string;
  className?: string;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  monthName = "Octubre",
  year = 2026,
  events,
  currency = "USD",
  className,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(29);

  // Lista de días de la semana
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Eventos del día seleccionado
  const dayEvents = events.filter(e => e.date === selectedDay);

  return (
    <div className={cn("bg-white p-6 rounded-squircle-xl shadow-card-float border border-slate-100 flex flex-col justify-between", className)}>
      
      {/* Header del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#2a2542]">{monthName} {year}</h4>
          <p className="text-xs text-[#9f9cb2]">Calendario de Cobros y Vencimientos</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#9f9cb2] mb-2">
        {weekDays.map((d, i) => (
          <span key={i} className="py-1">{d}</span>
        ))}
      </div>

      {/* Matriz de Días (Ejemplo semana del 25 al 31 y días del mes) */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
          const hasEvent = events.some(e => e.date === day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "h-9 rounded-squircle-md flex flex-col items-center justify-center font-semibold transition-all relative cursor-pointer",
                isSelected
                  ? "bg-[#7b52c9] text-white shadow-card-soft font-bold scale-105"
                  : hasEvent
                  ? "bg-[#f4effb] text-[#7b52c9] hover:bg-[#ede9fe]"
                  : "text-[#5e5977] hover:bg-slate-50"
              )}
            >
              <span>{day}</span>
              {hasEvent && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full absolute bottom-1",
                    isSelected ? "bg-white" : "bg-[#7b52c9]"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle del Día Seleccionado */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-[#2a2542] block mb-2">
          Movimientos para el día {selectedDay} de {monthName}:
        </span>

        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-squircle-sm bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  {ev.type === 'payment' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="font-semibold text-[#2a2542]">{ev.title}</span>
                </div>
                <span className={cn(
                  "font-bold",
                  ev.type === 'payment' ? "text-rose-500" : "text-emerald-500"
                )}>
                  {ev.type === 'payment' ? '-' : '+'} {formatCurrency(ev.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9f9cb2] italic py-1">No hay pagos ni cobros programados para esta fecha.</p>
        )}
      </div>

    </div>
  );
};
