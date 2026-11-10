import React from 'react';
import { Plus, Settings2 } from 'lucide-react';
import { type Space } from '../../data/spaces';
import { renderSpaceIcon } from './ManageSpacesModal';

export interface SpacesFilterBarProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (id: string | null) => void;
  onManageSpaces: () => void;
  obligationsCountMap: Record<string, number>;
}

export const SpacesFilterBar: React.FC<SpacesFilterBarProps> = ({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onManageSpaces,
  obligationsCountMap,
}) => {
  const totalAll = Object.values(obligationsCountMap).reduce((acc, c) => acc + c, 0);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      
      {/* Pestaña 'Todos' */}
      <button
        onClick={() => onSelectSpace(null)}
        className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
          selectedSpaceId === null
            ? 'bg-[#7b52c9] text-white shadow-md shadow-purple-200'
            : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/70'
        }`}
      >
        <span>Todos</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
          selectedSpaceId === null ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {totalAll}
        </span>
      </button>

      {/* Pestañas de cada lugar */}
      {spaces.map((sp) => {
        const count = obligationsCountMap[sp.name] || 0;
        const isSelected = selectedSpaceId === sp.id;

        return (
          <button
            key={sp.id}
            onClick={() => onSelectSpace(sp.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#7b52c9] text-white shadow-md shadow-purple-200'
                : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/70'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                isSelected ? 'bg-white/25 text-white' : 'text-white'
              }`}
              style={{ backgroundColor: isSelected ? undefined : sp.color }}
            >
              {renderSpaceIcon(sp.icon, "w-2.5 h-2.5")}
            </div>
            <span className="truncate max-w-[130px]">{sp.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </button>
        );
      })}

      {/* Pestaña de acción para agregar / gestionar */}
      <button
        onClick={onManageSpaces}
        className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#7b52c9] bg-white border border-dashed border-purple-300 hover:border-[#7b52c9] hover:bg-purple-50/50 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
        title="Crear o gestionar lugares"
      >
        {spaces.length === 0 ? (
          <>
            <Plus className="w-3.5 h-3.5 text-[#7b52c9]" />
            <span>+ Crear Espacio (Casa, Local...)</span>
          </>
        ) : (
          <>
            <Settings2 className="w-3.5 h-3.5 text-[#7b52c9]" />
            <span>+ Espacio</span>
          </>
        )}
      </button>

    </div>
  );
};
