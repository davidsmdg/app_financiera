/**
 * Sistema de Personalidades Financieras
 * Modela el comportamiento y distribución del dinero libre
 */

export interface BudgetCategoryAllocation {
  id: string;
  name: string;
  percentage: number; // Porcentaje del dinero libre (0 a 100)
  icon: string;
  color: string;
  description: string;
}

export interface FinancialPersonality {
  id: 'ninja_saver' | 'balanced' | 'investor' | 'experience_seeker';
  name: string;
  title: string;
  badge: string;
  emoji: string;
  tagline: string;
  description: string;
  themeColor: string;
  accentBg: string;
  targetSavingsPercentage: number;
  categories: BudgetCategoryAllocation[];
}

export const FINANCIAL_PERSONALITIES: Record<string, FinancialPersonality> = {
  ninja_saver: {
    id: 'ninja_saver',
    name: 'Ahorrador Ninja',
    title: 'El Ahorrador Ninja',
    badge: 'Máximo Ahorro',
    emoji: '🛡️',
    tagline: 'Ahorro primero, luego existo',
    description: 'Priorizas blindar tu futuro, optimizar mercado y compras indispensables.',
    themeColor: '#059669', // Emerald
    accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    targetSavingsPercentage: 0,
    categories: [
      { id: 'food_groceries', name: 'Alimentos & Supermercado', percentage: 50, icon: 'Utensils', color: '#0284c7', description: 'Cocina en casa y compras inteligentes' },
      { id: 'leisure', name: 'Gustos & Salidas Moderadas', percentage: 30, icon: 'Coffee', color: '#d97706', description: 'Un café o salida planificada sin excesos' },
      { id: 'shopping', name: 'Ropa & Compras Estrictas', percentage: 20, icon: 'ShoppingBag', color: '#7c3aed', description: 'Solo reposición de artículos necesarios' },
    ]
  },
  balanced: {
    id: 'balanced',
    name: 'Equilibrado',
    title: 'El Equilibrado',
    badge: 'Vida Balanceada',
    emoji: '⚖️',
    tagline: 'Vivo bien hoy y cuido mi presente',
    description: 'Distribución inteligente del dinero para el día a día: alimentación, planes sociales y cuidado personal.',
    themeColor: '#7b52c9', // Purple
    accentBg: 'bg-purple-50 text-[#7b52c9] border-purple-200',
    targetSavingsPercentage: 0,
    categories: [
      { id: 'food_groceries', name: 'Comida, Restaurantes & Cafés', percentage: 40, icon: 'Utensils', color: '#0284c7', description: 'Mercado de calidad y restaurantes ocasionales' },
      { id: 'leisure', name: 'Salidas, Cine & Ocio', percentage: 35, icon: 'Sparkles', color: '#ea580c', description: 'Planes con amigos, conciertos y fines de semana' },
      { id: 'shopping', name: 'Ropa & Cuidado Personal', percentage: 25, icon: 'ShoppingBag', color: '#db2777', description: 'Prendas, autocuidado y pequeños caprichos' },
    ]
  },
  investor: {
    id: 'investor',
    name: 'Inversionista',
    title: 'El Inversionista / Crecimiento',
    badge: 'Crecimiento de Capital',
    emoji: '🚀',
    tagline: 'Cada peso invertido en mi educación y bienestar',
    description: 'Enfocado en educación, herramientas prácticas y nutrición eficiente sin derroche.',
    themeColor: '#2563eb', // Blue
    accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
    targetSavingsPercentage: 0,
    categories: [
      { id: 'education', name: 'Educación & Crecimiento', percentage: 50, icon: 'BookOpen', color: '#0891b2', description: 'Cursos, mentorías y herramientas para crecer' },
      { id: 'food_groceries', name: 'Alimentos Esenciales', percentage: 30, icon: 'Utensils', color: '#059669', description: 'Nutrición eficiente sin derroche' },
      { id: 'leisure', name: 'Ocio & Networking', percentage: 20, icon: 'Smile', color: '#d97706', description: 'Desconexión puntual y networking' },
    ]
  },
  experience_seeker: {
    id: 'experience_seeker',
    name: 'Disfrutón Consciente',
    title: 'El Disfrutón / Experiencias',
    badge: 'Vivir Experiencias',
    emoji: '✨',
    tagline: 'La vida es una sola, pero con presupuesto claro',
    description: 'Priorizas viajar, salir a comer y acumular recuerdos sin tocar la plata de tus deudas.',
    themeColor: '#f59e0b', // Amber/Orange
    accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
    targetSavingsPercentage: 0,
    categories: [
      { id: 'travel', name: 'Viajes & Experiencias', percentage: 45, icon: 'Plane', color: '#f59e0b', description: 'Escapadas de fin de semana, viajes y aventuras' },
      { id: 'dining', name: 'Restaurantes, Bares & Gastro', percentage: 35, icon: 'UtensilsCrossed', color: '#e11d48', description: 'Probar nuevos lugares y buena mesa' },
      { id: 'shopping', name: 'Ropa & Estilo de Vida', percentage: 20, icon: 'Sparkles', color: '#9333ea', description: 'Ropa, conciertos y eventos' },
    ]
  }
};

/**
 * Calcula el presupuesto permitido en cada categoría a partir del dinero libre disponible
 */
export function calculateBudgetByPersonality(
  freeMoney: number,
  personalityId: keyof typeof FINANCIAL_PERSONALITIES = 'balanced'
) {
  const personality = FINANCIAL_PERSONALITIES[personalityId] || FINANCIAL_PERSONALITIES.balanced;
  const validFreeMoney = Math.max(freeMoney, 0);

  return personality.categories.map(cat => ({
    ...cat,
    allocatedAmount: Math.round((validFreeMoney * cat.percentage) / 100),
  }));
}
