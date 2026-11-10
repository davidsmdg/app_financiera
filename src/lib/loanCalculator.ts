/**
 * Utilidades para cálculo financiero de créditos, préstamos y amortización
 * Diseñado para el mercado colombiano (Nequi, Bancolombia, Davivienda, Nu, etc.)
 */

export interface LoanPreset {
  id: string;
  name: string;
  lenderName: string;
  subType: 'nequi_propulsor' | 'bancolombia_consumo' | 'tarjeta_credito' | 'custom_credit';
  defaultMonthlyRate: number; // Tasa Mes Vencido (ej: 3.85%)
  defaultAnnualRate: number;  // Tasa Efectiva Anual (ej: 57.38%)
  defaultInsuranceFee: number; // Seguro de vida deudor fijo por cuota (ej: 2000 COP)
  defaultInstallments: number; // Cuotas habituales (ej: 17 o 24)
  description: string;
}

export const PRESET_LOANS: LoanPreset[] = [
  {
    id: 'nequi_propulsor',
    name: 'Nequi - Crédito Propulsor / Salvavidas',
    lenderName: 'Nequi (Bancolombia)',
    subType: 'nequi_propulsor',
    defaultMonthlyRate: 3.85,
    defaultAnnualRate: 57.38,
    defaultInsuranceFee: 2000,
    defaultInstallments: 17,
    description: 'Crédito bajo monto con seguro deudor de $2.000 y tasa estándar del 3.85% E.M.'
  },
  {
    id: 'bancolombia_libre_inversion',
    name: 'Bancolombia - Libre Inversión',
    lenderName: 'Bancolombia',
    subType: 'bancolombia_consumo',
    defaultMonthlyRate: 2.15,
    defaultAnnualRate: 29.08,
    defaultInsuranceFee: 4500,
    defaultInstallments: 24,
    description: 'Crédito de consumo con tasa promedio del 2.15% E.M. y seguro deudor'
  },
  {
    id: 'tarjeta_credito_generica',
    name: 'Tarjeta de Crédito (Bancaria / Nu / Rappi)',
    lenderName: 'Tarjeta de Crédito',
    subType: 'tarjeta_credito',
    defaultMonthlyRate: 2.30,
    defaultAnnualRate: 31.39,
    defaultInsuranceFee: 0,
    defaultInstallments: 12,
    description: 'Diferidos a cuotas con tasa cercana a la usura (~2.30% E.M.)'
  }
];

/**
 * Calcula la cuota mensual fija usando la fórmula de amortización francesa:
 * Cuota = P * [ i / (1 - (1 + i)^(-n)) ] + Seguro
 * 
 * Donde:
 * P = Capital prestado (principal)
 * i = Tasa mensual decimal (ej: 0.0385)
 * n = Número de cuotas
 */
export function calculateMonthlyInstallment(
  principal: number,
  monthlyRatePct: number,
  installments: number,
  insuranceFee: number = 0
): {
  totalInstallment: number;
  principalPart: number;
  interestPart: number;
  insuranceFee: number;
} {
  if (principal <= 0 || installments <= 0) {
    return { totalInstallment: 0, principalPart: 0, interestPart: 0, insuranceFee: 0 };
  }

  const i = (monthlyRatePct || 0) / 100;
  let baseInstallment = 0;

  if (i === 0) {
    baseInstallment = principal / installments;
  } else {
    // Cuota fija mensual
    baseInstallment = principal * (i / (1 - Math.pow(1 + i, -installments)));
  }

  const interestFirstMonth = principal * i;
  const principalFirstMonth = baseInstallment - interestFirstMonth;

  return {
    totalInstallment: Math.round(baseInstallment + insuranceFee),
    principalPart: Math.round(principalFirstMonth),
    interestPart: Math.round(interestFirstMonth),
    insuranceFee: Math.round(insuranceFee)
  };
}

/**
 * Simulador de Abono Extraordinario a Capital:
 * Compara:
 * 1. Reducir Plazo (Meses) conservando la misma cuota -> Mayor ahorro en intereses
 * 2. Reducir Cuota Mensual conservando el mismo plazo -> Mayor alivio en el flujo de caja
 */
export function simulatePrepayment(
  currentBalance: number,
  monthlyRatePct: number,
  remainingInstallments: number,
  insuranceFee: number,
  extraPayment: number
): {
  newBalance: number;
  // Escenario 1: Reducir Plazo
  reduceTerm: {
    newRemainingInstallments: number;
    savedInstallments: number;
    savedInterestsEstimate: number;
  };
  // Escenario 2: Reducir Cuota
  reduceInstallment: {
    newInstallment: number;
    installmentReduction: number;
  };
} {
  const newBalance = Math.max(currentBalance - extraPayment, 0);
  const i = (monthlyRatePct || 0) / 100;

  // Cuota original
  const currentCalc = calculateMonthlyInstallment(currentBalance, monthlyRatePct, remainingInstallments, insuranceFee);
  const originalMonthlyPayment = currentCalc.totalInstallment;

  // 1. Escenario Reducir Plazo (manteniendo la misma cuota)
  let newTerm = remainingInstallments;
  if (newBalance > 0 && i > 0) {
    // n = -ln(1 - (P * i / basePayment)) / ln(1 + i)
    const basePayment = originalMonthlyPayment - insuranceFee;
    if (basePayment > newBalance * i) {
      newTerm = Math.ceil(-Math.log(1 - (newBalance * i / basePayment)) / Math.log(1 + i));
    }
  } else if (newBalance === 0) {
    newTerm = 0;
  }

  const savedInstallments = Math.max(remainingInstallments - newTerm, 0);
  const savedInterestsEstimate = Math.round(savedInstallments * (currentBalance * i * 0.7)); // Ahorro aproximado proyectado

  // 2. Escenario Reducir Cuota (manteniendo el plazo restante)
  const newInstallmentCalc = calculateMonthlyInstallment(newBalance, monthlyRatePct, remainingInstallments, insuranceFee);
  const installmentReduction = Math.max(originalMonthlyPayment - newInstallmentCalc.totalInstallment, 0);

  return {
    newBalance,
    reduceTerm: {
      newRemainingInstallments: newTerm,
      savedInstallments,
      savedInterestsEstimate: Math.max(savedInterestsEstimate, 0)
    },
    reduceInstallment: {
      newInstallment: newInstallmentCalc.totalInstallment,
      installmentReduction
    }
  };
}
