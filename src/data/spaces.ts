export interface Space {
  id: string;
  user_id?: string;
  name: string;
  icon: 'home' | 'store' | 'building' | 'briefcase' | 'warehouse' | 'map-pin' | 'user';
  color: string;
  occupants?: number; // Personas que habitan o laboran en este lugar
  is_default?: boolean;
}

export const PERSONAL_SPACE_YO: Space = {
  id: 'space_yo',
  name: 'Yo (Personal)',
  icon: 'user',
  color: '#7b52c9',
  occupants: 1,
  is_default: true,
};

export const DEFAULT_SPACES: Space[] = [PERSONAL_SPACE_YO];

export const SPACE_ICONS_LIST = [
  { id: 'user', label: 'Yo / Personal' },
  { id: 'home', label: 'Casa / Hogar' },
  { id: 'store', label: 'Local / Comercio' },
  { id: 'building', label: 'Apartamento / Edificio' },
  { id: 'briefcase', label: 'Oficina / Consultorio' },
  { id: 'warehouse', label: 'Bodega / Taller' },
  { id: 'map-pin', label: 'Otro Lugar' },
] as const;

export const SPACE_COLORS_LIST = [
  '#7b52c9', // Morado
  '#0ea5e9', // Azul
  '#10b981', // Verde esmeralda
  '#f59e0b', // Ámbar
  '#ec4899', // Rosa
  '#6366f1', // Índigo
];
