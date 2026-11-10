import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Calendar, 
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatThousands, parseThousands } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface InvoiceCheckPromptProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  onUpdateInvoice: (obligationId: string, newAmount: number, newDueDay: number) => Promise<void>;
  currency?: string;
}

export const InvoiceCheckPrompt: React.FC<InvoiceCheckPromptProps> = ({
  obligations,
  payments,
  onUpdateInvoice,
  currency = 'COP',
}) => {
  const [activeDismissedIds, setActiveDismissedIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('dismissed_invoice_prompts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [dueDayInput, setDueDayInput] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Pagos del mes actual
  const currentMonthPaidSet = new Set(
    payments
      .filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'paid')
      .map(p => p.obligation_id)
  );

  /**
   * Identificar obligaciones de servicios públicos o variables que necesiten preguntar:
   * 1. No está pagada este mes
   * 2. No ha sido descartada en esta sesión
   * 3. Está dentro del rango de días antes del vencimiento (entre 12 días antes y hasta 2 días después de la fecha esperada)
   */
  const candidateObligations = obligations.filter(ob => {
    if (currentMonthPaidSet.has(ob.id)) return false;
    if (activeDismissedIds.includes(ob.id)) return false;

    // Solo preguntar para servicios, telefonía, vivienda o consumos variables
    const isVariableCategory = [
      'Servicios', 
      'Servicios Públicos', 
      'Servicios Móviles', 
      'Facturas', 
      'Vivienda / Arriendo',
      'Otros'
    ].includes(ob.category);

    if (!isVariableCategory) return false;

    // Ventana de tiempo: desde 10 días antes de la fecha esperada de vencimiento
    const daysUntilDue = ob.due_day - currentDay;
    return daysUntilDue >= -2 && daysUntilDue <= 10;
  });

  if (candidateObligations.length === 0 && !selectedObligation) {
    return null;
  }

  const handleDismiss = (id: string) => {
    const updated = [...activeDismissedIds, id];
    setActiveDismissedIds(updated);
    try {
      sessionStorage.setItem('dismissed_invoice_prompts', JSON.stringify(updated));
    } catch {}
  };

  const handleOpenUpdate = (ob: Obligation) => {
    setSelectedObligation(ob);
    setAmountInput(formatThousands(ob.amount));
    setDueDayInput(String(ob.due_day));
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObligation) return;

    const parsed = parseThousands(amountInput);
    if (!parsed || !dueDayInput) return;

    setSaving(true);
    try {
      await onUpdateInvoice(
        selectedObligation.id,
        parsed,
        parseInt(dueDayInput, 10)
      );
      handleDismiss(selectedObligation.id);
      setSelectedObligation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Banner / Pregunta Flotante en Dashboard */}
      {candidateObligations.length > 0 && !selectedObligation && (
        <div className="space-y-2.5 animate-slide-up">
          {candidateObligations.slice(0, 2).map((ob) => {
            // Buscar cuánto pagó el mes pasado para referencia
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const lastPayment = payments.find(
              p => p.obligation_id === ob.id && p.month === lastMonth && p.year === lastYear
            );

            return (
              <div
                key={`prompt-${ob.id}`}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50/40 border border-purple-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7b52c9] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#7b52c9] bg-[#7b52c9]/10 px-2 py-0.5 rounded-full">
                        Factura de {ob.category}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Fecha aproximada: día {ob.due_day}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#2a2542] mt-1">
                      ¿Ya te llegó la factura de <span className="text-[#7b52c9]">{ob.title}</span>?
                    </h4>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {lastPayment 
                        ? `El mes anterior pagaste ${formatCurrency(Number(lastPayment.amount_paid), currency)}. Actualiza el nuevo valor exacto para recordártelo.`
                        : `Ingresa el valor exacto de este mes y la fecha límite para tener el recordatorio listo.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleDismiss(ob.id)}
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer"
                  >
                    Aún no
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenUpdate(ob)}
                    className="shadow-btn-primary rounded-xl text-xs font-bold py-2 px-3.5"
                  >
                    Sí, registrar valor
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para ingresar el valor de la nueva factura */}
      {selectedObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom select-none">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-100 p-5 sm:p-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7b52c9]/10 text-[#7b52c9] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2a2542]">
                    Nueva Factura de {selectedObligation.title}
                  </h3>
                  <p className="text-[11px] text-[#9f9cb2]">Actualiza el valor y fecha de corte de este mes</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedObligation(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveInvoice} className="space-y-4 pt-4">
              
              {/* Monto con formato de puntos de miles */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Total a Pagar en Factura ($ COP)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoFocus
                    placeholder="Ej: 118.560"
                    value={amountInput}
                    onChange={(e) => setAmountInput(formatThousands(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#7b52c9] text-base font-black text-[#2a2542] outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Escribe los números y los puntos de miles se pondrán solos.
                </p>
              </div>

              {/* Día límite de pago */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Fecha Límite de Pago (Día del mes)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDayInput}
                    onChange={(e) => setDueDayInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-[#7b52c9] text-xs font-bold text-[#2a2542] outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Día exacto en que vence para programar tu recordatorio.
                </p>
              </div>

              {/* Botón Guardar */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={saving}
                  className="shadow-btn-primary rounded-xl font-bold py-3"
                >
                  {saving ? "Actualizando..." : "GUARDAR Y PROGRAMAR RECORDATORIO"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
};
