import React from 'react';
import { 
  Home, 
  CreditCard, 
  Calendar as CalendarIcon, 
  SlidersHorizontal 
} from 'lucide-react';

export type AppTab = 'home' | 'calendar' | 'debts' | 'personality';

export interface BottomNavBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  obligationsCount: number;
  debtsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  obligationsCount,
  debtsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-2 safe-bottom shadow-lg select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Tab 1: Home / Núcleo */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#7b52c9] font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        {/* Tab 2: Calendario Financiero */}
        <button
          type="button"
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'calendar'
              ? 'text-[#7b52c9] font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Calendario</span>
        </button>

        {/* Tab 3: Mis Deudas (Unificado) */}
        <button
          type="button"
          onClick={() => onSelectTab('debts')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            currentTab === 'debts'
              ? 'text-[#7b52c9] font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <div className="relative">
            <CreditCard className="w-5 h-5" />
            {(obligationsCount + debtsCount) > 0 && (
              <span className="absolute -top-1 -right-2 bg-purple-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {obligationsCount + debtsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Mis Deudas</span>
        </button>

        {/* Tab 5: Personalidad / Estilo */}
        <button
          type="button"
          onClick={() => onSelectTab('personality')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'personality'
              ? 'text-[#7b52c9] font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Estilo</span>
        </button>

      </div>
    </nav>
  );
};
