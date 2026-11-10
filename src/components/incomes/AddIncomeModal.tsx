import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Clock, 
  Gift, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatThousands, parseThousands } from '../../lib/utils';
import type { Database } from '../../types/supabase';

type Income = Database['public']['Tables']['incomes']['Row'];

export interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    amount: number;
    income_type: 'recurring' | 'occasional';
    frequency: 'monthly' | 'biweekly' | 'weekly' | 'one_time';
    payment_day?: number;
    income_date?: string;
    category?: string;
  }) => Promise<void>;
  editingIncome?: Income | null;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingIncome = null,
}) => {
  const [incomeType, setIncomeType] = useState<'recurring' | 'occasional'>(
    editingIncome?.income_type || 'recurring'
  );
  const [name, setName] = useState(editingIncome?.name || '');
  const [amount, setAmount] = useState(editingIncome ? formatThousands(editingIncome.amount) : '');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'weekly' | 'one_time'>(
    editingIncome?.frequency || 'monthly'
  );
  const [paymentDay, setPaymentDay] = useState<number>(editingIncome?.payment_day || 30);
  const [incomeDate, setIncomeDate] = useState<string>(
    editingIncome?.income_date || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<string>(editingIncome?.category || 'Salario');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousands(amount);
    if (!name.trim() || !parsedAmount) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        amount: parsedAmount,
        income_type: incomeType,
        frequency: incomeType === 'occasional' ? 'one_time' : frequency,
        payment_day: incomeType === 'recurring' ? paymentDay : undefined,
        income_date: incomeType === 'occasional' ? incomeDate : undefined,
        category,
      });
      setName('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Presets rápidos de ingresos populares
  const applyPreset = (presetName: string, presetCat: string, presetFreq: 'monthly' | 'biweekly') => {
    setName(presetName);
    setCategory(presetCat);
    setFrequency(presetFreq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden select-none">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-base font-extrabold text-[#2a2542]">
              {editingIncome ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}
            </h3>
            <p className="text-[11px] text-[#9f9cb2]">
              Sueldos fijos, honorarios o ingresos ocasionales
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Selector de Tipo: Fijo Recurrente vs Ocasional */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIncomeType('recurring');
                if (frequency === 'one_time') setFrequency('monthly');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                incomeType === 'recurring'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sueldo / Fijo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIncomeType('occasional');
                setFrequency('one_time');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                incomeType === 'occasional'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Ocasional / Extra</span>
            </button>
          </div>

          {/* Atajos Rápidos */}
          {incomeType === 'recurring' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Sugerencias:</span>
              <button
                type="button"
                onClick={() => applyPreset('Salario / Sueldo', 'Salario', 'monthly')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-200 transition-all shrink-0 cursor-pointer"
              >
                💼 Salario Mensual
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Quincena Empresa', 'Salario', 'biweekly')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-200 transition-all shrink-0 cursor-pointer"
              >
                📅 Quincena
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Honorarios Consultoría', 'Honorarios', 'monthly')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-200 transition-all shrink-0 cursor-pointer"
              >
                📝 Honorarios
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Sugerencias:</span>
              <button
                type="button"
                onClick={() => { setName('Prima de Servicios'); setCategory('Prima'); }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-full font-bold border border-purple-200 transition-all shrink-0 cursor-pointer"
              >
                🎁 Prima
              </button>
              <button
                type="button"
                onClick={() => { setName('Bono de Desempeño'); setCategory('Bono'); }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-full font-bold border border-purple-200 transition-all shrink-0 cursor-pointer"
              >
                ⭐ Bono
              </button>
              <button
                type="button"
                onClick={() => { setName('Venta de Artículo'); setCategory('Venta'); }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-full font-bold border border-purple-200 transition-all shrink-0 cursor-pointer"
              >
                📦 Venta Ocasional
              </button>
            </div>
          )}

          {/* Nombre Personalizado */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              Nombre del Ingreso
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Sueldo Principal, Quincena, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs font-bold text-[#2a2542] outline-none"
            />
          </div>

          {/* Monto del Ingreso */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              Monto ($ COP)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="Ej: 2.500.000"
                value={amount}
                onChange={(e) => setAmount(formatThousands(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm font-black text-emerald-700 outline-none"
              />
            </div>
          </div>

          {/* Frecuencia y Fechas */}
          {incomeType === 'recurring' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Frecuencia de Pago
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="biweekly">Quincenal (cada 15 días)</option>
                    <option value="weekly">Semanal</option>
                  </select>
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Día del Pago (1 - 31)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Fecha Estimada de Ingreso
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-purple-500 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-bold shadow-md shadow-emerald-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> GUARDAR INGRESO
                </span>
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
