import React, { useState } from 'react';
import { 
  X, 
  Home, 
  Store, 
  Building, 
  Briefcase, 
  Warehouse, 
  MapPin, 
  User,
  Plus, 
  Trash2,
  Check,
  Users,
  Pencil
} from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  type Space, 
  SPACE_ICONS_LIST, 
  SPACE_COLORS_LIST 
} from '../../data/spaces';

export interface ManageSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: Space[];
  onAddSpace: (name: string, icon: Space['icon'], color: string, occupants: number) => void;
  onUpdateSpace: (id: string, name: string, icon: Space['icon'], color: string, occupants: number) => void;
  onDeleteSpace: (id: string) => void;
}

export const renderSpaceIcon = (icon: Space['icon'], className = "w-4 h-4") => {
  switch (icon) {
    case 'user': return <User className={className} />;
    case 'home': return <Home className={className} />;
    case 'store': return <Store className={className} />;
    case 'building': return <Building className={className} />;
    case 'briefcase': return <Briefcase className={className} />;
    case 'warehouse': return <Warehouse className={className} />;
    default: return <MapPin className={className} />;
  }
};

export const ManageSpacesModal: React.FC<ManageSpacesModalProps> = ({
  isOpen,
  onClose,
  spaces,
  onAddSpace,
  onUpdateSpace,
  onDeleteSpace,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<Space['icon']>('home');
  const [selectedColor, setSelectedColor] = useState(SPACE_COLORS_LIST[0]);
  const [occupants, setOccupants] = useState<number>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setSelectedIcon('home');
    setSelectedColor(SPACE_COLORS_LIST[0]);
    setOccupants(1);
    setIsCreating(false);
    setEditingSpaceId(null);
  };

  const handleStartEdit = (space: Space) => {
    setName(space.name);
    setSelectedIcon(space.icon);
    setSelectedColor(space.color);
    setOccupants(space.occupants || 1);
    setEditingSpaceId(space.id);
    setIsCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSpaceId) {
      onUpdateSpace(editingSpaceId, name.trim(), selectedIcon, selectedColor, occupants);
    } else {
      onAddSpace(name.trim(), selectedIcon, selectedColor, occupants);
    }
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom select-none">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-[#2a2542]">Tus Lugares y Espacios</h3>
            <p className="text-[11px] text-[#9f9cb2]">Gestiona las casas, locales u oficinas donde tienes obligaciones</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Lista de lugares actuales */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block">
              Lugares Registrados ({spaces.length})
            </span>
            <div className="space-y-1.5">
              {spaces.map((sp) => (
                <div
                  key={sp.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: sp.color }}
                    >
                      {renderSpaceIcon(sp.icon, "w-4 h-4")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2a2542]">{sp.name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>{sp.occupants || 1} {sp.occupants === 1 ? 'persona' : 'personas'}</span>
                        {sp.is_default && (
                          <span className="text-[9px] font-extrabold text-[#7b52c9] uppercase tracking-wider ml-1">
                            • Predeterminado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(sp)}
                      className="w-8 h-8 rounded-full hover:bg-purple-100 text-slate-400 hover:text-[#7b52c9] flex items-center justify-center transition-all cursor-pointer"
                      title="Editar Lugar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {!sp.is_default && spaces.length > 1 && (
                      <button
                        onClick={() => onDeleteSpace(sp.id)}
                        className="w-8 h-8 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Eliminar Lugar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario para crear o editar un lugar */}
          {!isCreating && !editingSpaceId ? (
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="w-full py-3 px-4 border-2 border-dashed border-purple-200 hover:border-[#7b52c9] rounded-2xl text-xs font-bold text-[#7b52c9] bg-purple-50/50 hover:bg-purple-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nuevo Lugar / Espacio</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50/90 rounded-2xl border border-purple-200/80 space-y-3.5 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#2a2542]">
                  {editingSpaceId ? 'Editar Lugar / Espacio' : 'Nuevo Lugar'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-medium"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Nombre del lugar
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Local Chapinero, Finca Rionegro, Oficina 301..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#7b52c9] text-xs font-semibold text-[#2a2542] outline-none"
                />
              </div>

              {/* Cantidad de personas que habitan o usan el lugar */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  ¿Cuántas personas viven o trabajan aquí?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={`occupant-${num}`}
                      type="button"
                      onClick={() => setOccupants(num)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        occupants === num
                          ? 'bg-[#7b52c9] text-white border-[#7b52c9] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {num === 5 ? '5+' : num}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  Nos permite calcular si el consumo de luz y servicios públicos es normal o elevado.
                </p>
              </div>

              {/* Selector de icono */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Tipo de espacio / Icono
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SPACE_ICONS_LIST.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setSelectedIcon(ic.id as Space['icon'])}
                      className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedIcon === ic.id 
                          ? 'border-[#7b52c9] bg-purple-100/50 text-[#7b52c9] font-bold shadow-2xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {renderSpaceIcon(ic.id as Space['icon'], "w-3.5 h-3.5 shrink-0")}
                      <span className="truncate text-[10px]">{ic.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Color */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Color distintivo
                </label>
                <div className="flex items-center gap-2.5">
                  {SPACE_COLORS_LIST.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      style={{ backgroundColor: col }}
                    >
                      {selectedColor === col && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  className="shadow-btn-primary rounded-xl font-bold py-2.5"
                >
                  {editingSpaceId ? 'Actualizar Lugar' : 'Guardar Lugar'}
                </Button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
