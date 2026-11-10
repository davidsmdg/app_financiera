import React from 'react';
import { 
  X, 
  Home, 
  Calendar as CalendarIcon, 
  CreditCard, 
  SlidersHorizontal, 
  LogOut, 
  UserCheck, 
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { type AppTab } from './BottomNavBar';

export interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  userEmail: string;
  onLogout: () => void;
  obligationsCount: number;
  debtsCount?: number;
  onManageSpaces: () => void;
  onOpenPersonality: () => void;
  personalityName: string;
  personalityEmoji: string;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  userEmail,
  onLogout,
  obligationsCount,
  onManageSpaces,
  onOpenPersonality,
  personalityName,
  personalityEmoji,
}) => {
  if (!isOpen) return null;

  const handleTabClick = (tab: AppTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex select-none animate-fade-in safe-top safe-bottom">
      {/* Backdrop con desenfoque suave */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral deslizante (Drawer) */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-right">
        
        {/* Cabecera del Drawer */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-purple-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#683cc7] to-[#8c65d9] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#2a2542] leading-tight">FinanceFlow</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold truncate max-w-[150px]">
                <UserCheck className="w-3 h-3 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Navegación / Pestañas */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3 py-1">
            Menú Principal
          </span>

          {/* Opción 1: Inicio */}
          <button
            onClick={() => handleTabClick('home')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-purple-100/70 text-[#7b52c9] font-black shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentTab === 'home' ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span>Inicio / Flujo de Dinero</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Opción 2: Calendario Financiero */}
          <button
            onClick={() => handleTabClick('calendar')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'calendar'
                ? 'bg-purple-100/70 text-[#7b52c9] font-black shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentTab === 'calendar' ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <span>Calendario Financiero</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Opción 3: Mis Deudas (Unificado: Facturas + Créditos) */}
          <button
            onClick={() => handleTabClick('debts')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'debts'
                ? 'bg-purple-100/70 text-[#7b52c9] font-black shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentTab === 'debts' ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Mis Deudas</span>
            </div>
            {obligationsCount > 0 && (
              <span className="bg-[#7b52c9] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {obligationsCount}
              </span>
            )}
          </button>

          {/* Opción 4: Personalidad / Estilo */}
          <button
            onClick={() => handleTabClick('personality')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'personality'
                ? 'bg-purple-100/70 text-[#7b52c9] font-black shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentTab === 'personality' ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span>Salud Financiera</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* SEPARADOR: AJUSTES Y ESPACIOS */}
          <div className="pt-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3 py-1">
              Configuración & Espacios
            </span>

            {/* Administrar Lugares y Espacios */}
            <button
              onClick={() => {
                onManageSpaces();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#7b52c9] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Lugares y Espacios</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>

            {/* Cambiar Personalidad Financiera */}
            <button
              onClick={() => {
                onOpenPersonality();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-base flex items-center justify-center">
                  {personalityEmoji}
                </div>
                <div className="text-left">
                  <span>Modo: {personalityName}</span>
                  <span className="text-[10px] text-slate-400 block">Cambiar perfil</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>

        </div>

        {/* Footer del Drawer: Cerrar Sesión */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
};
