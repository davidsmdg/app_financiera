import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ContactItem {
  id: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
}

export interface QuickTransferContactsProps {
  contacts: ContactItem[];
  selectedContactId?: string;
  onSelectContact?: (id: string) => void;
  onAddContact?: () => void;
  className?: string;
}

export const QuickTransferContacts: React.FC<QuickTransferContactsProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  onAddContact,
  className,
}) => {
  return (
    <div className={cn("bg-white p-5 rounded-squircle-xl shadow-card-float border border-slate-100", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[#2a2542]">Enviar Dinero Rápido</h4>
        <span className="text-xs font-semibold text-[#7b52c9] cursor-pointer hover:underline">Ver agenda</span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        
        {/* Botón Agregar Nuevo Contacto */}
        <div
          onClick={onAddContact}
          className="flex flex-col items-center gap-2 cursor-pointer shrink-0 select-none group"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#7b52c9]/40 hover:border-[#7b52c9] flex items-center justify-center text-[#7b52c9] transition-all group-hover:scale-105 bg-[#ede9fe]/30">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold text-[#7b52c9] text-center w-16 truncate">
            Nuevo
          </span>
        </div>

        {/* Lista de Contactos Circulares */}
        {contacts.map((c) => {
          const isSelected = selectedContactId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => onSelectContact && onSelectContact(c.id)}
              className="flex flex-col items-center gap-2 cursor-pointer shrink-0 select-none group"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full overflow-hidden transition-all duration-200 shadow-sm relative group-hover:scale-105",
                  isSelected
                    ? "ring-4 ring-[#7b52c9] ring-offset-2 scale-105"
                    : "ring-1 ring-slate-100"
                )}
              >
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f4effb] text-[#7b52c9] font-bold text-sm flex items-center justify-center">
                    {c.initials || c.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-[#5e5977] group-hover:text-[#2a2542] text-center w-16 truncate">
                {c.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
