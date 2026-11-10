import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatThousands, parseThousands } from '../../lib/utils';
import { FINANCIAL_PERSONALITIES } from '../../data/personalities';

export interface AddOccasionalExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityId: string;
  defaultCategoryId?: string;
  onSubmit: (expense: {
    amount: number;
    description: string;
    personality_category: string;
    transaction_date: string;
    space_name?: string;
  }) => Promise<void>;
}

export const AddOccasionalExpenseModal: React.FC<AddOccasionalExpenseModalProps> = ({
  isOpen,
  onClose,
  personalityId,
  defaultCategoryId,
  onSubmit,
}) => {
  const personality = FINANCIAL_PERSONALITIES[personalityId] || FINANCIAL_PERSONALITIES.balanced;
  const categories = personality.categories;

  const [selectedCatId, setSelectedCatId] = useState<string>(
    defaultCategoryId || categories[0]?.id || 'food_groceries'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Sincronizar si cambia defaultCategoryId
  React.useEffect(() => {
    if (defaultCategoryId) setSelectedCatId(defaultCategoryId);
  }, [defaultCategoryId]);

  if (!isOpen) return null;

  const activeCategoryObj = categories.find(c => c.id === selectedCatId) || categories[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousands(amount);
    if (!parsedAmount) return;

    setLoading(true);
    try {
      // Si el usuario no puso nombre, se le asigna el nombre de la categoría por defecto (ej: "Gasto de Salidas, Cine & Ocio")
      const finalDescription = description.trim() 
        ? description.trim() 
        : `Gasto en ${activeCategoryObj.name.split(',')[0].split('&')[0].trim()}`;

      await onSubmit({
        amount: parsedAmount,
        description: finalDescription,
        personality_category: selectedCatId,
        transaction_date: expenseDate,
        space_name: 'Yo',
      });

      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom select-none">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Gasto No Presupuestado / Salida
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#2a2542] mt-0.5">
              Registrar Gasto del Mes
            </h3>
            <p className="text-[11px] text-[#9f9cb2]">
              Salidas, compras o imprevistos de tu día a día
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
          
          {/* Monto del gasto */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              Monto del Gasto ($ COP)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="Ej: 35.000"
                value={amount}
                onChange={(e) => setAmount(formatThousands(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-rose-50/30 rounded-xl border border-rose-200 focus:border-rose-500 text-base font-black text-rose-700 outline-none"
              />
            </div>
          </div>

          {/* Selector de Categoría según la Personalidad */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
              ¿En qué categoría entra este gasto?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs ring-1 ring-purple-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold truncate text-[#2a2542]">{cat.name.split(',')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{cat.percentage}% del presupuesto</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre / Descripción (Opcional - puede dejarse vacío) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block">
                Nombre o detalle (Opcional)
              </label>
              <span className="text-[9px] text-slate-400 italic">Puedes dejarlo sin nombre</span>
            </div>
            <input
              type="text"
              placeholder={`Ej: Almuerzo con amigos, Cine, etc. (Opcional)`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-purple-500 text-xs font-bold text-[#2a2542] outline-none"
            />
          </div>

          {/* Fecha del gasto y Espacio Asignado (Por defecto: Yo) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Fecha del Gasto
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Asociado a
              </label>
              <div className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-purple-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>👤 Yo (Personal)</span>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 font-bold shadow-md shadow-rose-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> REGISTRAR GASTO
                </span>
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
