/**
 * Motor de Cálculo y Diagnóstico Automático para Enel Colombia
 * Extrae y deduce el consumo real en kWh y el estrato o subsidio
 * basándose únicamente en el monto total facturado y el número de habitantes del espacio.
 */

export interface EnelDiagnostics {
  totalAmount: number;
  occupants: number;
  estimatedEnergyAmount: number;
  estimatedAseoAmount: number;
  estimatedKwh: number;
  tier: 'subsidy' | 'normal' | 'moderate' | 'excessive';
  tierLabel: string;
  badgeColor: string;
  statusEmoji: string;
  explanation: string;
  hasSubsidy: boolean;
}

export function calculateEnelDiagnostics(totalAmount: number, occupants: number = 1): EnelDiagnostics {
  // En las facturas de Enel (Bogotá y Cundinamarca), la factura incluye:
  // 1. Energía Eléctrica (aprox 75% - 80% del total)
  // 2. Aseo (LIME, Promoambiental, etc.) (aprox 20% - 25% del total, promedio $25.000 - $32.000)
  
  let estimatedAseo = 28000;
  if (totalAmount < 40000) {
    estimatedAseo = Math.round(totalAmount * 0.25);
  }
  const estimatedEnergy = Math.max(totalAmount - estimatedAseo, 0);

  // Tarifa regulada de energía CREG / Enel Bogotá (Estrato 3 residencial):
  // Costo kWh pleno: ~$815 COP/kWh
  // Subsidio de subsistencia (hasta 130 kWh en Bogotá): descuento del 15% -> tarifa neta aprox $692 COP/kWh.
  // Por encima de 130 kWh, el excedente se cobra a tarifa plena ($815/kWh).
  
  // Deducimos el consumo en kWh a partir del valor de energía:
  let estimatedKwh = 0;
  const subsidyMaxKwh = 130;
  const subsidyTariff = 692.31; // COP por kWh subsidiado
  const fullTariff = 814.48;    // COP por kWh tarifa plena

  const maxSubsidyCost = subsidyMaxKwh * subsidyTariff; // ~$90.000 COP

  if (estimatedEnergy <= maxSubsidyCost) {
    estimatedKwh = Math.round(estimatedEnergy / subsidyTariff);
  } else {
    const extraMoney = estimatedEnergy - maxSubsidyCost;
    estimatedKwh = Math.round(subsidyMaxKwh + (extraMoney / fullTariff));
  }

  // Si da 0 o negativo por montos muy bajos
  if (estimatedKwh < 1) estimatedKwh = 1;

  // Umbral de consumo normal en Colombia según personas que habitan el espacio:
  // 1 persona: ~70 - 110 kWh/mes
  // 2 personas: ~110 - 150 kWh/mes
  // 3 personas: ~150 - 190 kWh/mes
  // 4+ personas: ~190 - 240 kWh/mes
  let normalThreshold = 110;
  if (occupants === 2) normalThreshold = 145;
  else if (occupants === 3) normalThreshold = 185;
  else if (occupants >= 4) normalThreshold = 230;

  const hasSubsidy = estimatedKwh <= 130;

  if (estimatedKwh <= normalThreshold) {
    return {
      totalAmount,
      occupants,
      estimatedEnergyAmount: estimatedEnergy,
      estimatedAseoAmount: estimatedAseo,
      estimatedKwh,
      tier: hasSubsidy ? 'subsidy' : 'normal',
      tierLabel: hasSubsidy ? 'Consumo Óptimo (Con Subsidio)' : 'Consumo Normal',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      statusEmoji: '🟢',
      explanation: `Tu consumo estimado es de ~${estimatedKwh} kWh para ${occupants} ${occupants === 1 ? 'persona' : 'personas'}. Se encuentra en el rango eficiente${hasSubsidy ? ' y conservas el subsidio de subsistencia (<130 kWh)' : ''}.`,
      hasSubsidy
    };
  } else if (estimatedKwh <= normalThreshold * 1.25) {
    return {
      totalAmount,
      occupants,
      estimatedEnergyAmount: estimatedEnergy,
      estimatedAseoAmount: estimatedAseo,
      estimatedKwh,
      tier: 'moderate',
      tierLabel: 'Consumo Moderadamente Alto',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      statusEmoji: '🟡',
      explanation: `Tu consumo estimado es de ~${estimatedKwh} kWh para ${occupants} ${occupants === 1 ? 'persona' : 'personas'}. Está ligeramente por encima del promedio habitual.`,
      hasSubsidy
    };
  } else {
    return {
      totalAmount,
      occupants,
      estimatedEnergyAmount: estimatedEnergy,
      estimatedAseoAmount: estimatedAseo,
      estimatedKwh,
      tier: 'excessive',
      tierLabel: 'Consumo Alto / Alerta',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      statusEmoji: '🔴',
      explanation: `Tu consumo estimado es de ~${estimatedKwh} kWh para ${occupants} ${occupants === 1 ? 'persona' : 'personas'}. Supera considerablemente el consumo recomendado. Revisa electrodomésticos de alto consumo como calentadores o posibles fugas.`,
      hasSubsidy
    };
  }
}
