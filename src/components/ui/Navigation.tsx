import React from 'react';
import { Home, PieChart, PlusCircle, ArrowLeftRight, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavTab = 'home' | 'stats' | 'add' | 'transactions' | 'profile';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onActionClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onActionClick,
}) => {
  return (
    <>
      {/* --- DESKTOP / TABLET SIDEBAR (VISIBLE ON MD+) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-slate-100 p-6 h-screen sticky top-0 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-squircle-md bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-glow">
            F
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-main">FinanceFlow</h1>
            <p className="text-xs text-secondary">Design System</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => onTabChange('home')}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-squircle-md text-sm font-medium transition-all text-left",
              currentTab === 'home'
                ? "bg-[#eeecfd] text-[#5b4bf6] font-semibold"
                : "text-secondary hover:bg-slate-50 hover:text-main"
            )}
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => onTabChange('stats')}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-squircle-md text-sm font-medium transition-all text-left",
              currentTab === 'stats'
                ? "bg-[#eeecfd] text-[#5b4bf6] font-semibold"
                : "text-secondary hover:bg-slate-50 hover:text-main"
            )}
          >
            <PieChart className="w-5 h-5" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-squircle-md text-sm font-medium transition-all text-left",
              currentTab === 'transactions'
                ? "bg-[#eeecfd] text-[#5b4bf6] font-semibold"
                : "text-secondary hover:bg-slate-50 hover:text-main"
            )}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span>Movimientos</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-squircle-md text-sm font-medium transition-all text-left",
              currentTab === 'profile'
                ? "bg-[#eeecfd] text-[#5b4bf6] font-semibold"
                : "text-secondary hover:bg-slate-50 hover:text-main"
            )}
          >
            <User className="w-5 h-5" />
            <span>Ajustes & Tokens</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button
            onClick={onActionClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-white py-3.5 px-4 rounded-squircle-md font-semibold text-sm shadow-glow transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION BAR (FIXED ON PHONE & TABLET COMPACT) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-1 pointer-events-none safe-bottom">
        <nav className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-white/60 shadow-soft-lg rounded-squircle-xl px-4 py-2.5 flex items-center justify-around">
          <button
            onClick={() => onTabChange('home')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-full transition-all cursor-pointer",
              currentTab === 'home' ? "text-[#5b4bf6] font-semibold scale-105" : "text-slate-400"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            onClick={() => onTabChange('stats')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-full transition-all cursor-pointer",
              currentTab === 'stats' ? "text-[#5b4bf6] font-semibold scale-105" : "text-slate-400"
            )}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px]">Métricas</span>
          </button>

          {/* Botón Flotante Central de Acción */}
          <button
            onClick={onActionClick}
            aria-label="Agregar"
            className="w-12 h-12 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow active:scale-90 transition-transform -translate-y-3 cursor-pointer"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-full transition-all cursor-pointer",
              currentTab === 'transactions' ? "text-[#5b4bf6] font-semibold scale-105" : "text-slate-400"
            )}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="text-[10px]">Historial</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-full transition-all cursor-pointer",
              currentTab === 'profile' ? "text-[#5b4bf6] font-semibold scale-105" : "text-slate-400"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </nav>
      </div>
    </>
  );
};
