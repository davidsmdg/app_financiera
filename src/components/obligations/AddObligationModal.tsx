import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, Bell, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AddObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: string;
    amount: number;
    due_day: number;
    frequency: 'monthly' | 'biweekly' | 'annual';
    reminder_days_before: number;
  }) => Promise<void>;
}

export const AddObligationModal: React.FC<AddObligationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'annual'>('monthly');
  const [reminderDays, setReminderDays] = useState('3');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDay) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        due_day: parseInt(dueDay, 10),
        frequency,
        reminder_days_before: parseInt(reminderDays, 10),
      });
      // Limpiar formulario y cerrar
      setTitle('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Servicios',
    'Vivienda / Arriendo',
    'Crédito & Tarjetas',
    'Suscripciones',
    'Seguros & Salud',
    'Educación',
    'Otros'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-white w-full max-w-md rounded-squircle-xl shadow-card-float border border-slate-100 p-6 relative overflow-hidden select-none">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-[#2a2542]">Nueva Obligación Fija</h3>
            <p className="text-xs text-[#9f9cb2]">Registra un servicio, cuota o pago recurrente</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Nombre / Concepto */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              Concepto / Nombre
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Factura de Energía, Arriendo, Tarjeta Visa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-squircle-md border border-slate-200/80 focus:border-[#7b52c9] text-xs font-semibold outline-none transition-all"
            />
          </div>

          {/* Categoría y Frecuencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 rounded-squircle-md border border-slate-200/80 text-xs font-semibold outline-none appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-3 bg-slate-50 rounded-squircle-md border border-slate-200/80 text-xs font-semibold outline-none appearance-none"
              >
                <option value="monthly">Mensual</option>
                <option value="biweekly">Quincenal</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>

          {/* Monto y Día de Vencimiento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Monto Estimado ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 rounded-squircle-md border border-slate-200/80 focus:border-[#7b52c9] text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Día de Pago (1 - 31)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 rounded-squircle-md border border-slate-200/80 focus:border-[#7b52c9] text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Días de anticipación para el aviso */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              Recordatorio anticipado
            </label>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#7b52c9] shrink-0" />
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 rounded-squircle-md border border-slate-200/80 text-xs font-semibold outline-none"
              >
                <option value="1">Avisar 1 día antes</option>
                <option value="3">Avisar 3 días antes (Recomendado)</option>
                <option value="5">Avisar 5 días antes</option>
                <option value="7">Avisar 1 semana antes</option>
              </select>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="shadow-btn-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </span>
              ) : (
                "GUARDAR OBLIGACIÓN"
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
