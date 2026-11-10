import React from 'react';
import { 
  X, 
  Check 
} from 'lucide-react';
import { 
  FINANCIAL_PERSONALITIES 
} from '../../data/personalities';

export interface SelectPersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonalityId: string;
  onSelectPersonality: (id: string) => void;
}

export const SelectPersonalityModal: React.FC<SelectPersonalityModalProps> = ({
  isOpen,
  onClose,
  selectedPersonalityId,
  onSelectPersonality,
}) => {
  if (!isOpen) return null;

  const personalitiesList = Object.values(FINANCIAL_PERSONALITIES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom select-none">
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#7b52c9] bg-[#7b52c9]/10 px-2 py-0.5 rounded-full">
                Tu Estilo Financiero
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#2a2542] mt-0.5">
              Elige tu Personalidad de Gastos
            </h3>
            <p className="text-[11px] text-[#9f9cb2]">
              Define cómo la app distribuirá tu dinero libre este mes
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de las 4 Personalidades */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          {personalitiesList.map((p) => {
            const isSelected = selectedPersonalityId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPersonality(p.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative shadow-2xs ${
                  isSelected
                    ? 'border-[#7b52c9] bg-purple-50/40 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white rounded-2xl border border-slate-100 shadow-2xs shrink-0">
                      {p.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#2a2542]">{p.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.accentBg}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 italic mt-0.5">
                        "{p.tagline}"
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#7b52c9] text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#5e5977] mt-3 leading-relaxed">
                  {p.description}
                </p>

                {/* Etiquetas de Distribución */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 mr-1">Distribución:</span>
                  {p.categories.map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name.split(' ')[0]}: <strong>{c.percentage}%</strong></span>
                    </span>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
