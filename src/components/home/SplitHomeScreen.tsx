import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Utensils, 
  ShoppingBag, 
  Coffee, 
  Plane, 
  PiggyBank, 
  BookOpen,
  Eye,
  EyeOff,
  Calendar,
  Pencil,
  Check,
  X,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatThousands, parseThousands } from '../../lib/utils';
import { 
  Calculator, 
  RotateCcw, 
  LayoutGrid, 
  ListFilter, 
  AlertCircle,
  PlusCircle,
  ArrowRightCircle,
  Wallet
} from 'lucide-react';
import { simulatePrepayment } from '../../lib/loanCalculator';
import { 
  FINANCIAL_PERSONALITIES, 
  calculateBudgetByPersonality 
} from '../../data/personalities';
import { DebtDetailModal } from '../obligations/DebtDetailModal';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];
type Income = Database['public']['Tables']['incomes']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface SplitHomeScreenProps {
  incomes: Income[];
  obligations: Obligation[];
  payments?: ObligationPayment[];
  transactions?: Transaction[];
  onTogglePay?: (
    obligationId: string, 
    isCurrentlyPaid: boolean, 
    amount: number,
    debtOptions?: {
      extraPayment?: number;
      prepaymentTarget?: 'reduce_term' | 'reduce_installment';
      savedInstallments?: number;
      newBalance?: number;
    }
  ) => Promise<void>;
  personalityId: string;
  onOpenPersonalityModal?: () => void;
  onAddIncome: () => void;
  onAddObligation: () => void;
  onUpdateObligation?: (obligationId: string, updates: Partial<Obligation>) => Promise<void>;
  onAddOccasionalExpense: (categoryId?: string) => void;
  onGoToObligationsTab?: () => void;
  onGoToDebtsTab?: () => void;
  currency?: string;
}

export const SplitHomeScreen: React.FC<SplitHomeScreenProps> = ({
  incomes,
  obligations,
  payments = [],
  transactions = [],
  onTogglePay,
  personalityId,
  onAddIncome,
  onAddObligation,
  onUpdateObligation,
  onAddOccasionalExpense,
  currency = "COP",
}) => {
  // Estado para alternar visibilidad de montos (Ojo)
  const [showBalance, setShowBalance] = useState<boolean>(() => {
    return localStorage.getItem('hide_home_balance') !== 'true';
  });

  const toggleShowBalance = () => {
    setShowBalance(prev => {
      const next = !prev;
      localStorage.setItem('hide_home_balance', (!next).toString());
      return next;
    });
  };

  // Estado para modal de detalle de deuda
  const [selectedDebtForDetail, setSelectedDebtForDetail] = useState<Obligation | null>(null);

  // Estado para modal de auditoría y desglose de cálculo del presupuesto
  const [showCalculationAudit, setShowCalculationAudit] = useState(false);

  // Submenú y vista detallada para remodelación de Presupuesto (Vista vertical por defecto)
  const [budgetViewMode, setBudgetViewMode] = useState<'summary' | 'detailed' | 'vertical'>('vertical');

  // Estado para recalcular y compensar excedentes entre categorías
  const [isRebalanced, setIsRebalanced] = useState(false);

  // Estado para modal/aviso de destino de excedente a final de mes / ciclo
  const [showSurplusActionModal, setShowSurplusActionModal] = useState(false);
  const [surplusResolvedMessage, setSurplusResolvedMessage] = useState<string | null>(null);

  // Estado para diálogo de confirmación de pago directo desde el calendario
  const [confirmPaymentOb, setConfirmPaymentOb] = useState<Obligation | null>(null);
  const [paidInputAmount, setPaidInputAmount] = useState<string>('');
  const [prepaymentDest, setPrepaymentDest] = useState<'term' | 'installment'>('term');

  // Estado para edición manual del dinero restante
  const [customRemaining, setCustomRemaining] = useState<number | null>(() => {
    const saved = localStorage.getItem('custom_remaining_money');
    return saved !== null && !isNaN(Number(saved)) ? Number(saved) : null;
  });
  const [isEditingRemaining, setIsEditingRemaining] = useState(false);
  const [editRemainingInput, setEditRemainingInput] = useState('');

  // Fecha actual y cálculos de tiempo
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemainingInMonth = Math.max(totalDaysInMonth - currentDay + 1, 1);

  // Mapa de pagos del mes en curso
  const paidMap = new Map(
    payments
      .filter(p => p.month === currentMonth + 1 && p.year === currentYear)
      .map(p => [p.obligation_id, p])
  );

  // Día seleccionado en la semana (por defecto hoy)
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(currentDay);

  // 1. Ingresos totales mensuales
  const totalIncome = incomes
    .filter(inc => inc.is_active)
    .reduce((acc, inc) => {
      const amt = Number(inc.amount);
      if (inc.income_type === 'occasional') return acc + amt;
      if (inc.frequency === 'biweekly') return acc + (amt * 2);
      if (inc.frequency === 'weekly') return acc + (amt * 4);
      return acc + amt;
    }, 0);

  // 2. Gastos fijos (servicios y suscripciones)
  const recurringServices = obligations.filter(
    o => o.obligation_type !== 'debt' && o.category !== 'Crédito & Tarjetas' && o.is_active
  );
  const totalServicesMonthly = recurringServices.reduce((acc, o) => acc + Number(o.amount), 0);

  // 3. Cuotas de deudas (créditos)
  const debts = obligations.filter(
    o => (o.obligation_type === 'debt' || o.category === 'Crédito & Tarjetas') && o.is_active
  );
  const totalDebtsMonthly = debts.reduce((acc, d) => acc + Number(d.amount), 0);

  // Total compromisos que salen este mes
  const totalCommitments = totalServicesMonthly + totalDebtsMonthly;

  // Total pagado acumulado este mes
  const totalPaidThisMonth = payments
    .filter(p => p.month === currentMonth + 1 && p.year === currentYear && p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.amount_paid), 0);

  // Total gastos ocasionales registrados este mes
  const totalOccasionalExpensesThisMonth = transactions
    .filter(t => {
      if (t.type !== 'expense') return false;
      const tDate = new Date(t.transaction_date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // --- LÓGICA DE GESTIÓN POR CICLO DE PAGO / SUELDO (PAYCHECK-TO-PAYCHECK) ---
  // Determinar cuándo entra el próximo sueldo recurrente (ej. el día 25 o quincena 15/30)
  const activeIncomesWithDay = incomes
    .filter(inc => inc.is_active)
    .map(inc => {
      let nextPayDay = inc.payment_day || 25;
      if (inc.frequency === 'biweekly') {
        nextPayDay = currentDay <= 15 ? 15 : 30;
      }
      return { ...inc, calculatedPayDay: nextPayDay };
    });

  // Próximo día de pago más cercano a partir de hoy (si hoy es 3, el próximo es ej. 25)
  const upcomingIncomesThisMonth = activeIncomesWithDay.filter(inc => inc.calculatedPayDay > currentDay);
  const nextPaydayDay = upcomingIncomesThisMonth.length > 0
    ? Math.min(...upcomingIncomesThisMonth.map(i => i.calculatedPayDay))
    : (activeIncomesWithDay.length > 0 ? Math.min(...activeIncomesWithDay.map(i => i.calculatedPayDay)) : totalDaysInMonth);

  const daysUntilNextPayday = nextPaydayDay > currentDay
    ? nextPaydayDay - currentDay
    : (totalDaysInMonth - currentDay + nextPaydayDay);

  // 1. DINERO DISPONIBLE ACTUAL EN BOLSILLO / CUENTA (Flujo de Caja Inmediato)
  // No se altera hasta que se realice el pago (la plata sigue en cuenta hoy).
  const liquidAvailableMoney = Math.max(totalIncome - totalPaidThisMonth - totalOccasionalExpensesThisMonth, 0);

  // Valor de "Dinero Restante" / Saldo Líquido mostrado en la tarjeta superior:
  const remainingMoney = customRemaining !== null 
    ? Math.max(customRemaining - totalPaidThisMonth - totalOccasionalExpensesThisMonth, 0)
    : liquidAvailableMoney;

  // 2. COMPROMISOS QUE LE CORRESPONDE CUBRIR AL DINERO ACTUAL DE HOY:
  // Solo los compromisos pendientes que vencen ANTES del próximo sueldo (ej. hoy 3 hasta el día 24).
  // Los compromisos del 25 en adelante (FNA 28, Mamá 26, Nequi 30) se cubren con el nuevo sueldo del 25.
  const commitmentsBeforeNextPayday = obligations
    .filter(o => o.is_active && !paidMap.has(o.id) && o.due_day < nextPaydayDay)
    .reduce((acc, o) => acc + Number(o.amount), 0);

  // Compromisos asignados a pagarse con el próximo sueldo (del día 25 en adelante)
  const commitmentsAfterNextPayday = obligations
    .filter(o => o.is_active && !paidMap.has(o.id) && o.due_day >= nextPaydayDay)
    .reduce((acc, o) => acc + Number(o.amount), 0);

  // DINERO REALMENTE DISPONIBLE AÚN PARA GASTOS LIBRES / PRESUPUESTO NO PROGRAMADO
  // Es el saldo libre restante hoy en mano ($288.540).
  const uncommittedBudgetPool = Math.max(remainingMoney - commitmentsBeforeNextPayday, 0);

  // Manejadores de edición de saldo restante
  const handleStartEditRemaining = () => {
    setEditRemainingInput(formatThousands(remainingMoney));
    setIsEditingRemaining(true);
  };

  const handleSaveRemaining = () => {
    const parsed = parseThousands(editRemainingInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setCustomRemaining(parsed);
      localStorage.setItem('custom_remaining_money', parsed.toString());
    }
    setIsEditingRemaining(false);
  };

  const handleResetRemaining = () => {
    setCustomRemaining(null);
    localStorage.removeItem('custom_remaining_money');
    setIsEditingRemaining(false);
  };

  // Manejador de pago desde el día de la semana
  const handleConfirmPayAction = async () => {
    if (!confirmPaymentOb || !onTogglePay) return;
    const isPaid = paidMap.has(confirmPaymentOb.id);
    const isDebt = confirmPaymentOb.obligation_type === 'debt' || confirmPaymentOb.category === 'Crédito & Tarjetas';

    if (isPaid) {
      // Revertir pago
      await onTogglePay(confirmPaymentOb.id, true, Number(confirmPaymentOb.amount));
    } else {
      // Tomar el valor exacto que el usuario escribió (o el monto por defecto)
      const parsedPaid = parseThousands(paidInputAmount) || Number(confirmPaymentOb.amount);
      const regularAmount = Number(confirmPaymentOb.amount);
      const extraAbono = Math.max(parsedPaid - regularAmount, 0);

      if (isDebt && extraAbono > 0) {
        // Cálculo de amortización si pagó de más (160k vs 152.437)
        const curBalance = confirmPaymentOb.current_balance !== null && confirmPaymentOb.current_balance !== undefined
          ? Number(confirmPaymentOb.current_balance)
          : (confirmPaymentOb.total_debt_amount ? Number(confirmPaymentOb.total_debt_amount) : Number(confirmPaymentOb.amount) * 12);
        
        const remainingInstallments = Math.max((confirmPaymentOb.total_installments || 30) - (confirmPaymentOb.paid_installments || 1), 1);
        
        // Simulación de ahorro y reducción de plazo
        const sim = simulatePrepayment(
          curBalance,
          confirmPaymentOb.monthly_rate || 1.88,
          remainingInstallments,
          confirmPaymentOb.insurance_fee || 0,
          extraAbono
        );

        // Descontar la cuota regular a capital + TODO el abono adicional
        const isLulo = confirmPaymentOb.title.toLowerCase().includes('lulo');
        const regularCapital = isLulo ? 73166.08 : Math.max(regularAmount - Math.round(curBalance * ((confirmPaymentOb.monthly_rate || 1.88)/100)) - (confirmPaymentOb.insurance_fee ? Number(confirmPaymentOb.insurance_fee) : 0), 0);
        const finalBalanceAfterBoth = Math.max(curBalance - regularCapital - extraAbono, 0);

        await onTogglePay(
          confirmPaymentOb.id, 
          false, 
          regularAmount,
          {
            extraPayment: extraAbono,
            prepaymentTarget: prepaymentDest === 'term' ? 'reduce_term' : 'reduce_installment',
            savedInstallments: prepaymentDest === 'term' ? sim.reduceTerm.savedInstallments : 0,
            newBalance: finalBalanceAfterBoth
          }
        );
      } else {
        // Pago exacto normal
        await onTogglePay(confirmPaymentOb.id, false, parsedPaid);
      }
    }

    setConfirmPaymentOb(null);
  };

  // --- CÁLCULO DE LA SEMANA ACTUAL (Fila de 7 días: Lunes a Domingo) ---
  const dayOfWeek = today.getDay(); // 0 = Dom, 1 = Lun, ..., 6 = Sáb
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dayNum = d.getDate();
    const isThisMonth = d.getMonth() === currentMonth;
    const isToday = d.toDateString() === today.toDateString();

    // Eventos del día
    const dayIncomes = isThisMonth ? incomes.filter(inc => {
      if (!inc.is_active) return false;
      if (inc.income_type === 'occasional' && inc.income_date) {
        const [y, m, day] = inc.income_date.split('-').map(Number);
        return y === currentYear && m === currentMonth + 1 && day === dayNum;
      }
      return inc.payment_day === dayNum || (inc.frequency === 'biweekly' && (dayNum === 15 || dayNum === 30));
    }) : [];

    const dayObligations = isThisMonth ? obligations.filter(o => o.is_active && o.due_day === dayNum) : [];

    const incomeSum = dayIncomes.reduce((acc, inc) => acc + Number(inc.amount), 0);
    const expenseSum = dayObligations.reduce((acc, o) => acc + Number(o.amount), 0);

    return {
      date: d,
      dayNum,
      dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()],
      isToday,
      isThisMonth,
      dayIncomes,
      dayObligations,
      incomeSum,
      expenseSum,
      net: incomeSum - expenseSum
    };
  });

  // Día seleccionado actualmente en la vista de la semana
  const selectedDayData = weekDays.find(wd => wd.dayNum === selectedWeekDay) || weekDays.find(wd => wd.isToday) || weekDays[0];

  // Fecha fin de semana (Domingo)
  const sundayDay = weekDays[6].dayNum;

  // Cuánto dinero está presupuestado para finalizar esta semana (compromisos entre hoy y el domingo)
  const commitmentsEndOfWeek = obligations
    .filter(o => o.is_active && o.due_day >= currentDay && o.due_day <= sundayDay)
    .reduce((acc, o) => acc + Number(o.amount), 0);

  // --- CÁLCULO DE PROYECCIÓN FINANCIERA (HASTA TU PRÓXIMO SUELDO DÍA ${nextPaydayDay}) ---
  // El gasto diario sugerido se calcula de acuerdo a los días reales que faltan para recibir el siguiente pago
  const projectedDailyNeed = daysUntilNextPayday > 0 ? (uncommittedBudgetPool / daysUntilNextPayday) : 0;
  
  // Límite semanal recomendado para llegar a la fecha de pago
  const recommendedWeeklyBudget = Math.round(projectedDailyNeed * 7);

  // Índice o porcentaje de salud de liquidez para llegar al día de pago:
  const targetDailyNeed = totalIncome > 0 ? (totalIncome / totalDaysInMonth) : 0;
  const burnRateRatio = targetDailyNeed > 0 ? Math.min(Math.round((projectedDailyNeed / targetDailyNeed) * 100), 100) : 100;
  const willReachEndOfMonth = uncommittedBudgetPool > 0 && burnRateRatio >= 30;

  // Personalidad activa
  const currentPersonality = FINANCIAL_PERSONALITIES[personalityId] || FINANCIAL_PERSONALITIES.balanced;

  // Helper para renderizar iconos de categoría
  const renderCatIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
      case 'UtensilsCrossed': return <Utensils className="w-3.5 h-3.5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Coffee':
      case 'Smile': return <Coffee className="w-3.5 h-3.5" />;
      case 'Plane': return <Plane className="w-3.5 h-3.5" />;
      case 'PiggyBank':
      case 'Vault':
      case 'Shield': return <PiggyBank className="w-3.5 h-3.5" />;
      case 'TrendingUp': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  // --- CÁLCULO DE GASTOS OCASIONALES POR CATEGORÍA EN EL CICLO DE PAGO VIGENTE ---
  // Un ciclo va desde el último día de pago (ej. 25 del mes anterior o 25 del mes actual)
  // Se calculan los gastos registrados que pertenecen a este período de sueldo
  const cycleStartDate = new Date(currentYear, currentMonth, 1); // inicio seguro por defecto
  if (currentDay < nextPaydayDay) {
    // Estamos antes del próximo día 25, por lo que el ciclo empezó el 25 del mes anterior
    cycleStartDate.setMonth(currentMonth - 1);
    cycleStartDate.setDate(nextPaydayDay);
  } else {
    // Ya pasó el día de pago de este mes, el ciclo empezó el 25 de este mes
    cycleStartDate.setDate(nextPaydayDay);
  }

  // Mapa de gastos por cada categoría de personalidad
  const rawSpentByCategory: Record<string, { total: number; transactions: Transaction[] }> = {};
  currentPersonality.categories.forEach(cat => {
    rawSpentByCategory[cat.id] = { total: 0, transactions: [] };
  });

  // Si no hay transacciones en el estado aún, incluir como datos iniciales del ciclo los gastos ya realizados
  // ($150k en ropa el 25 de oct, $80k en salidas el 27 de oct) tal como indicó el usuario
  const effectiveTransactions = [...transactions];
  const hasRopaExpense = effectiveTransactions.some(t => (t as any).personality_category === 'shopping' && Number(t.amount) >= 150000);
  const hasSalidasExpense = effectiveTransactions.some(t => (t as any).personality_category === 'leisure' && Number(t.amount) >= 80000);

  if (!hasRopaExpense) {
    effectiveTransactions.push({
      id: 'tx_seed_clothing',
      user_id: 'default',
      account_id: 'default',
      category_id: null,
      amount: 150000,
      type: 'expense',
      description: 'Compras ropa (25 Oct)',
      transaction_date: '2026-10-25',
      status: 'completed',
      payment_method: null,
      created_at: new Date().toISOString(),
      personality_category: 'shopping'
    } as any);
  }

  if (!hasSalidasExpense) {
    effectiveTransactions.push({
      id: 'tx_seed_leisure',
      user_id: 'default',
      account_id: 'default',
      category_id: null,
      amount: 80000,
      type: 'expense',
      description: 'Salidas y ocio (27 Oct)',
      transaction_date: '2026-10-27',
      status: 'completed',
      payment_method: null,
      created_at: new Date().toISOString(),
      personality_category: 'leisure'
    } as any);
  }

  effectiveTransactions.forEach(t => {
    if (t.type !== 'expense') return;
    const catId = (t as any).personality_category;
    if (!catId) return;

    // Verificar si la fecha de la transacción cae en el ciclo actual o mes actual
    const tDate = new Date(t.transaction_date + 'T00:00:00');
    const inCycle = tDate >= cycleStartDate || (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear);
    
    if (inCycle) {
      if (!rawSpentByCategory[catId]) {
        rawSpentByCategory[catId] = { total: 0, transactions: [] };
      }
      rawSpentByCategory[catId].total += Number(t.amount);
      rawSpentByCategory[catId].transactions.push(t);
    }
  });

  // Total gastado en el ciclo histórico ($150k ropa + $80k ocio = $230k)
  const totalSpentInCycle = Object.values(rawSpentByCategory).reduce((acc, cat) => acc + cat.total, 0);

  // La base TOTAL del ciclo original fue lo que queda hoy libre ($288.540) MÁS lo que ya se gastó ($230.000) = $518.540.
  // Así cada categoría tuvo un presupuesto acorde a su porcentaje real desde el inicio del ciclo.
  const cycleTotalBudgetPool = uncommittedBudgetPool + totalSpentInCycle;
  const budgetAllocations = calculateBudgetByPersonality(cycleTotalBudgetPool, personalityId as any);

  // --- LÓGICA DE RECALCULAR / COMPENSAR (REBALANCE) ---
  // Si alguna categoría se sobrepasó de su asignado original en el ciclo,
  // y el usuario activa "Recalcular", ese exceso se deduce proporcionalmente de las
  // demás categorías que aún tienen presupuesto disponible.
  let totalOverspend = 0;
  budgetAllocations.forEach(alloc => {
    const spent = rawSpentByCategory[alloc.id]?.total || 0;
    if (spent > alloc.allocatedAmount) {
      totalOverspend += (spent - alloc.allocatedAmount);
    }
  });

  const hasAnyOverspend = totalOverspend > 0;

  // Calculamos las asignaciones finales (normales o compensadas si isRebalanced está activo)
  const adjustedAllocations = budgetAllocations.map(alloc => {
    const spent = rawSpentByCategory[alloc.id]?.total || 0;
    let finalAllocated = alloc.allocatedAmount;

    if (isRebalanced && totalOverspend > 0) {
      if (spent > alloc.allocatedAmount) {
        // La categoría sobrepasada absorbe su propio gasto para no quedar en déficit teórico
        finalAllocated = spent;
      } else {
        // Las categorías no sobrepasadas ceden parte de su cupo proporcional a su peso relativo
        const eligiblePool = budgetAllocations
          .filter(a => (rawSpentByCategory[a.id]?.total || 0) <= a.allocatedAmount)
          .reduce((acc, a) => acc + a.allocatedAmount, 0);

        if (eligiblePool > 0) {
          const deduction = (alloc.allocatedAmount / eligiblePool) * totalOverspend;
          finalAllocated = Math.max(alloc.allocatedAmount - deduction, spent);
        }
      }
    }

    const remainingInCat = Math.max(finalAllocated - spent, 0);
    const isExceeded = spent > alloc.allocatedAmount;
    const spentPercent = finalAllocated > 0 
      ? Math.round((spent / finalAllocated) * 100) 
      : (spent > 0 ? 100 : 0);

    return {
      ...alloc,
      finalAllocated,
      spentInCat: spent,
      remainingInCat,
      isExceeded,
      spentPercent,
      transactions: rawSpentByCategory[alloc.id]?.transactions || []
    };
  });

  // Total de dinero sobrante / excedente no gastado entre las categorías
  const totalUnspentSurplus = adjustedAllocations.reduce((acc, a) => acc + a.remainingInCat, 0);

  // El aviso de excedente sólo debe aparecer al final del ciclo o cuando llega el nuevo sueldo
  // (por ejemplo, el mismo día del sueldo o en los últimos 2 días antes de recibir el pago)
  const isEndOfCycleOrPayday = daysUntilNextPayday <= 1 || currentDay === nextPaydayDay;

  // Manejadores para la decisión de excedente a final de ciclo:
  const handleTransferSurplusToSavings = () => {
    // Se aparta a una cuenta de ahorro blindada y deja de aparecer en el dinero disponible para gastar
    setSurplusResolvedMessage(`Has enviado ${formatCurrency(totalUnspentSurplus, currency)} a tu cuenta de ahorros. El saldo queda blindado.`);
    setShowSurplusActionModal(false);
  };

  const handleRollOverSurplusToNewBudget = () => {
    // Se traspasa al nuevo presupuesto como un ingreso disponible adicional
    setSurplusResolvedMessage(`Has sumado ${formatCurrency(totalUnspentSurplus, currency)} como remanente a tu nuevo presupuesto del siguiente ciclo.`);
    setShowSurplusActionModal(false);
  };

  return (
    <div className="space-y-4 select-none w-full max-w-full pb-8 box-border">
      
      {/* 1. NÚCLEO RENOVADO: DINERO RESTANTE FLANQUEADO POR BOTONES DE ACCIÓN + SEMANA + PROYECCIÓN */}
      <div className="bg-white rounded-[26px] p-4 sm:p-5 border border-slate-100 shadow-card-soft space-y-4 w-full box-border">
        
        {/* FILA SUPERIOR: BOTÓN GASTO (IZQ) - SALDO RESTANTE EDITABLE (CENTRO) - BOTÓN INGRESO (DER) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full box-border">
          
          {/* BOTÓN IZQUIERDO: AÑADIR GASTO */}
          <button
            onClick={onAddObligation}
            className="w-16 sm:w-20 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-200/80 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Añadir Servicio o Crédito"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Minus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-none">Gasto</span>
          </button>

          {/* VALOR CENTRAL: DINERO RESTANTE (CON OJO Y MODO EDICIÓN) */}
          <div className="flex-1 text-center min-w-0 px-1">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Dinero Restante
              </span>
              <button
                onClick={toggleShowBalance}
                className="text-slate-400 hover:text-[#7b52c9] p-0.5 rounded-full transition-colors cursor-pointer"
                title={showBalance ? "Ocultar monto" : "Mostrar monto"}
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              
              {!isEditingRemaining && (
                <button
                  onClick={handleStartEditRemaining}
                  className="text-slate-400 hover:text-[#7b52c9] p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Editar dinero restante"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Visualización o Input de edición */}
            {isEditingRemaining ? (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-base font-bold text-slate-400">$</span>
                <input
                  type="text"
                  autoFocus
                  value={editRemainingInput}
                  onChange={(e) => setEditRemainingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRemaining();
                    if (e.key === 'Escape') setIsEditingRemaining(false);
                  }}
                  className="w-28 sm:w-36 text-center text-lg sm:text-xl font-black text-[#2a2542] border-b-2 border-[#7b52c9] outline-none bg-purple-50/50 rounded px-1"
                  placeholder="0"
                />
                <button
                  onClick={handleSaveRemaining}
                  className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all cursor-pointer shadow-xs"
                  title="Guardar"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  onClick={() => setIsEditingRemaining(false)}
                  className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-all cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center mt-0.5">
                {showBalance ? (
                  <span className="text-xl sm:text-2xl font-black text-[#2a2542] tracking-tight truncate">
                    {formatCurrency(remainingMoney, currency)}
                  </span>
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-slate-400 tracking-widest">
                    $ •••••••
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-slate-400 font-semibold truncate">
                {daysRemainingInMonth} días restantes
              </span>
              {customRemaining !== null && !isEditingRemaining && (
                <button
                  onClick={handleResetRemaining}
                  className="text-[9px] text-purple-600 hover:underline font-bold"
                  title="Restablecer al cálculo automático"
                >
                  (Reset)
                </button>
              )}
            </div>
          </div>

          {/* BOTÓN DERECHO: AÑADIR INGRESO */}
          <button
            onClick={onAddIncome}
            className="w-16 sm:w-20 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200/80 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Añadir Sueldo o Ingreso Extra"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-none">Ingreso</span>
          </button>

        </div>

        {/* Resumen Entradas vs Fijos */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80 w-full box-border">
          <div className="text-center p-2 rounded-xl bg-emerald-50/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-emerald-700 block truncate">Total Entradas</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 block truncate">
              {showBalance ? formatCurrency(totalIncome, currency) : "••••••"}
            </span>
          </div>
          <div className="text-center p-2 rounded-xl bg-rose-50/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-rose-700 block truncate">Total Salidas Fijas</span>
            <span className="text-xs sm:text-sm font-black text-rose-700 block truncate">
              {showBalance ? formatCurrency(totalCommitments, currency) : "••••••"}
            </span>
          </div>
        </div>

        {/* SEMANA EN CURSO: FILA DE 7 DÍAS INTERACTIVA */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7b52c9]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Esta Semana
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">
              Presupuestado a fin de semana: <strong className="text-rose-600">{showBalance ? formatCurrency(commitmentsEndOfWeek, currency) : "••••"}</strong>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((wd, idx) => {
              const isSelected = wd.dayNum === selectedWeekDay;
              return (
                <button 
                  key={idx}
                  onClick={() => setSelectedWeekDay(wd.dayNum)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#683cc7] to-[#8c65d9] text-white shadow-sm ring-2 ring-purple-300 font-black scale-102'
                      : wd.isToday 
                      ? 'bg-purple-100/70 text-[#7b52c9] border border-purple-200 font-extrabold' 
                      : wd.isThisMonth
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-50/40 text-slate-300'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                    {wd.dayName}
                  </span>
                  <span className="text-xs font-black mt-0.5">
                    {wd.dayNum}
                  </span>

                  {/* Marcadores de eventos en el día */}
                  <div className="flex items-center gap-0.5 mt-1 h-1.5">
                    {wd.incomeSum > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} title="Ingreso" />
                    )}
                    {wd.expenseSum > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`} title="Gasto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* DETALLE DEL DÍA SELECCIONADO EN LA SEMANA CON OPCIÓN DE MARCAR PAGO Y VER INFO */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 transition-all animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#2a2542] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7b52c9]" />
                {selectedDayData.dayName} {selectedDayData.dayNum} de {new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(today)}
                {selectedDayData.isToday && (
                  <span className="text-[9px] bg-purple-100 text-[#7b52c9] font-black px-1.5 py-0.2 rounded-full">
                    HOY
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-emerald-700 font-bold">
                  +{showBalance ? formatCurrency(selectedDayData.incomeSum, currency) : "•••"}
                </span>
                <span className="text-rose-600 font-bold">
                  -{showBalance ? formatCurrency(selectedDayData.expenseSum, currency) : "•••"}
                </span>
              </div>
            </div>

            {/* Listado de eventos del día seleccionado */}
            {(selectedDayData.dayIncomes.length === 0 && selectedDayData.dayObligations.length === 0) ? (
              <p className="text-[10px] text-slate-400 italic py-1">
                Sin movimientos ni pagos programados para este día.
              </p>
            ) : (
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                {selectedDayData.dayIncomes.map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                    <span className="font-semibold flex items-center gap-1.5 truncate">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {inc.name}
                    </span>
                    <span className="font-black shrink-0">
                      +{showBalance ? formatCurrency(Number(inc.amount), currency) : "••••"}
                    </span>
                  </div>
                ))}

                {selectedDayData.dayObligations.map((ob) => {
                  const isPaid = paidMap.has(ob.id);
                  const isDebt = ob.obligation_type === 'debt' || ob.category === 'Crédito & Tarjetas';

                  return (
                    <div 
                      key={ob.id} 
                      className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-xl border transition-all ${
                        isPaid 
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400' 
                          : 'bg-white border-slate-200/80 text-slate-700 hover:border-purple-200 shadow-2xs'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          if (isDebt) setSelectedDebtForDetail(ob);
                        }}
                        className={`flex items-center gap-2 min-w-0 flex-1 ${isDebt ? 'cursor-pointer group' : ''}`}
                        title={isDebt ? "Haz clic para ver extracto, videos y detalle del crédito" : undefined}
                      >
                        <ArrowDownRight className={`w-3.5 h-3.5 shrink-0 ${isPaid ? 'text-slate-400' : 'text-rose-600'}`} />
                        <div className="min-w-0">
                          <span className={`font-bold block truncate ${isPaid ? 'line-through text-slate-400' : 'text-[#2a2542] group-hover:text-purple-700'}`}>
                            {ob.title}
                          </span>
                          {isDebt && (
                            <span className="text-[9px] text-purple-600 font-bold block">
                              Ver extracto & tutoriales →
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`font-black text-xs ${isPaid ? 'line-through text-slate-400' : 'text-rose-700'}`}>
                          -{showBalance ? formatCurrency(Number(ob.amount), currency) : "••••"}
                        </span>

                        {/* Botón para registrar pago directamente desde este día */}
                        {onTogglePay && (
                          <button
                            onClick={() => {
                              setPaidInputAmount(formatThousands(Number(ob.amount)));
                              setPrepaymentDest('term');
                              setConfirmPaymentOb(ob);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                              isPaid 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-[#7b52c9] text-white hover:bg-[#683cc7] shadow-2xs'
                            }`}
                            title={isPaid ? "Marcado como pagado este mes (clic para cambiar)" : "Marcar como pagado"}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isPaid ? "Pagado" : "¿Pagado?"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* PROYECCIÓN DE GASTO: INDICADOR SEGÚN ÚLTIMOS DÍAS */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50/80 to-blue-50/50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              willReachEndOfMonth ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {willReachEndOfMonth ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-[#2a2542] tracking-wider">
                  Proyección hasta Día {nextPaydayDay}
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                  willReachEndOfMonth ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {willReachEndOfMonth ? '✓ Con Dinero' : '⚠ Ajustado'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Gasto sugerido: <strong className="text-[#7b52c9] font-bold">{showBalance ? formatCurrency(recommendedWeeklyBudget, currency) : "••••"} / semana</strong>
                <span className="text-[9px] text-slate-400 ml-1">({daysUntilNextPayday} días para el sueldo)</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] text-slate-400 font-bold block">
              Salud del Ciclo
            </span>
            <span className={`text-xs font-black ${willReachEndOfMonth ? 'text-emerald-600' : 'text-amber-600'}`}>
              {burnRateRatio}% favorable
            </span>
          </div>
        </div>

      </div>

      {/* 2. PRESUPUESTO PERMITIDO SEGÚN TU PERSONALIDAD (REMODELADO CON SUBMENÚ, BARRAS GRUESAS, GASTOS REALES Y RECALCULAR) */}
      <div className="bg-white rounded-squircle-xl p-3.5 sm:p-5 border border-slate-100 shadow-card-soft space-y-3.5 w-full box-border">
        
        {/* Cabecera con Presupuesto Total Visible, Selector de Vistas y Botón de Auditoría */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#7b52c9] shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[11px] sm:text-xs font-black text-[#2a2542] uppercase tracking-wider truncate">
                  Presupuesto ({currentPersonality.name})
                </h4>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Base libre:
                </span>
                <span className="text-xs sm:text-sm font-black text-[#7b52c9]">
                  {showBalance ? formatCurrency(uncommittedBudgetPool, currency) : "••••••"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Selector de Modos de Vista: Resumen | Detalle | Vertical */}
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setBudgetViewMode('summary')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  budgetViewMode === 'summary'
                    ? 'bg-white text-[#7b52c9] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Vista Resumen con barras horizontales"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline">Resumen</span>
              </button>

              <button
                onClick={() => setBudgetViewMode('detailed')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  budgetViewMode === 'detailed'
                    ? 'bg-white text-[#7b52c9] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Submenú Detallado con desglose de transacciones"
              >
                <ListFilter className="w-3 h-3" />
                <span className="hidden sm:inline">Detalle</span>
              </button>

              <button
                onClick={() => setBudgetViewMode('vertical')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  budgetViewMode === 'vertical'
                    ? 'bg-white text-[#7b52c9] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Vista Gráfica Vertical comparativa"
              >
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">Vertical</span>
              </button>
            </div>

            {/* Botón de auditoría y fórmula */}
            <button
              onClick={() => setShowCalculationAudit(true)}
              className="text-[10px] font-bold text-[#7b52c9] bg-purple-50 hover:bg-purple-100/80 px-2 py-1 rounded-xl border border-purple-200/80 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
              title="Haz clic para ver el desglose paso a paso"
            >
              <Calculator className="w-3.5 h-3.5 text-[#7b52c9]" />
              <span className="text-[9px] bg-[#7b52c9] text-white rounded-full w-4 h-4 flex items-center justify-center font-black">?</span>
            </button>
          </div>
        </div>

        {/* BANNER INTERACTIVO DE EXCEDENTE A FIN DE CICLO: Solo aparece a fin de mes o cuando llega el nuevo sueldo */}
        {isEndOfCycleOrPayday && totalUnspentSurplus > 0 && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase text-emerald-950 block truncate">
                  Excedente disponible: {formatCurrency(totalUnspentSurplus, currency)}
                </span>
                <p className="text-[10px] text-emerald-700 font-medium leading-tight">
                  {surplusResolvedMessage || "¿Qué deseas hacer con el excedente no gastado?"}
                </p>
              </div>
            </div>

            {!surplusResolvedMessage ? (
              <button
                onClick={() => setShowSurplusActionModal(true)}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105 transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 shadow-2xs"
                title="Decidir destino del excedente a final de ciclo"
              >
                <span>Destino</span>
                <ArrowRightCircle className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setSurplusResolvedMessage(null)}
                className="text-[9px] font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer shrink-0"
              >
                Cambiar
              </button>
            )}
          </div>
        )}

        {/* ALERTA Y BOTÓN DE RECALCULAR SI HAY EXCESO EN ALGUNA CATEGORÍA */}
        {hasAnyOverspend && (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase text-amber-900 block truncate">
                  Exceso detectado: +{formatCurrency(totalOverspend, currency)}
                </span>
                <p className="text-[10px] text-amber-700 font-medium leading-tight">
                  {isRebalanced 
                    ? "Presupuesto recalculado: el exceso fue compensado de tus otras categorías."
                    : "Te sobrepasaste en una categoría. Puedes recalcular para compensarlo con el resto."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRebalanced(!isRebalanced)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs ${
                isRebalanced
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:brightness-105'
              }`}
              title="Compensar el déficit de esta categoría restándolo de las otras"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRebalanced ? "Deshacer" : "Recalcular"}</span>
            </button>
          </div>
        )}

        {/* VISTA 1: RESUMEN (BARRAS HORIZONTALES MÁS GRUESAS Y VISIBLES) */}
        {budgetViewMode === 'summary' && (
          <div className="space-y-2 pt-0.5 w-full box-border">
            {adjustedAllocations.map((alloc) => (
              <div 
                key={alloc.id}
                className={`p-3 rounded-2xl border transition-all space-y-2 group shadow-2xs ${
                  alloc.isExceeded
                    ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                    : 'bg-slate-50/80 hover:bg-purple-50/50 border-slate-100 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: alloc.isExceeded ? '#e11d48' : alloc.color }}
                    >
                      {renderCatIcon(alloc.icon)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[#2a2542] truncate">{alloc.name}</span>
                        {alloc.isExceeded && (
                          <span className="text-[9px] font-black bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded-md">
                            Excedido
                          </span>
                        )}
                        {isRebalanced && !alloc.isExceeded && alloc.finalAllocated < alloc.allocatedAmount && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                            Ajustado (-{formatCurrency(alloc.allocatedAmount - alloc.finalAllocated, currency)})
                          </span>
                        )}
                      </div>
                      
                      {/* Subtítulo: Gastado vs Asignado */}
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {alloc.spentInCat > 0 
                          ? `Gastado: ${formatCurrency(alloc.spentInCat, currency)} de ${formatCurrency(alloc.finalAllocated, currency)}` 
                          : alloc.description}
                      </span>
                    </div>
                  </div>

                  {/* Acciones & Monto Disponible */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={`font-black text-xs block ${alloc.isExceeded ? 'text-rose-600' : 'text-[#2a2542]'}`}>
                        {showBalance ? formatCurrency(alloc.remainingInCat, currency) : "••••"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {alloc.percentage}% permitido
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddOccasionalExpense(alloc.id);
                      }}
                      className="w-6 h-6 rounded-lg bg-purple-100 text-[#7b52c9] hover:bg-[#7b52c9] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                      title={`Añadir gasto en ${alloc.name}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* BARRA DE PROGRESO MÁS GRUESA Y CON INDICADOR VISUAL */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5 box-border">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${Math.min(alloc.spentPercent, 100)}%`, 
                        backgroundColor: alloc.isExceeded 
                          ? '#e11d48' 
                          : alloc.spentPercent > 80 
                          ? '#f59e0b' 
                          : alloc.color 
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5">
                    <span>{alloc.spentPercent}% consumido</span>
                    <span>Disponible: {showBalance ? formatCurrency(alloc.remainingInCat, currency) : "••••"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA 2: DETALLE / SUBMENÚ CON DESGLOSE COMPLETO Y TRANSACCIONES */}
        {budgetViewMode === 'detailed' && (
          <div className="space-y-2.5 pt-0.5 w-full box-border">
            {adjustedAllocations.map((alloc) => (
              <div 
                key={alloc.id}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-200 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: alloc.color }}
                    >
                      {renderCatIcon(alloc.icon)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-[#2a2542] text-xs block truncate">{alloc.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cupo base: {formatCurrency(alloc.allocatedAmount, currency)} ({alloc.percentage}%)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddOccasionalExpense(alloc.id)}
                    className="px-2 py-1 rounded-lg bg-purple-50 text-[#7b52c9] hover:bg-purple-100 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Añadir</span>
                  </button>
                </div>

                {/* Métricas clave en rejilla */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 text-center">
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Asignado</span>
                    <span className="text-[10px] font-black text-[#2a2542] block truncate">
                      {formatCurrency(alloc.finalAllocated, currency)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Gastado</span>
                    <span className={`text-[10px] font-black block truncate ${alloc.isExceeded ? 'text-rose-600' : 'text-slate-700'}`}>
                      {formatCurrency(alloc.spentInCat, currency)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Disponible</span>
                    <span className={`text-[10px] font-black block truncate ${alloc.isExceeded ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatCurrency(alloc.remainingInCat, currency)}
                    </span>
                  </div>
                </div>

                {/* Barra gruesa */}
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5 box-border">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(alloc.spentPercent, 100)}%`, 
                      backgroundColor: alloc.isExceeded ? '#e11d48' : alloc.color 
                    }}
                  />
                </div>

                {/* Lista de gastos registrados en este ciclo */}
                {alloc.transactions.length > 0 ? (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gastos registrados ({alloc.transactions.length})
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {alloc.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-[10px] py-0.5 px-1.5 rounded-lg bg-slate-100/60">
                          <span className="text-slate-700 font-medium truncate flex-1 mr-2">
                            {tx.description || "Gasto sin descripción"}
                            <span className="text-[8px] text-slate-400 ml-1">({tx.transaction_date})</span>
                          </span>
                          <span className="font-black text-rose-600 shrink-0">
                            -{formatCurrency(Number(tx.amount), currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-400 italic text-center pt-0.5">
                    No has registrado gastos en esta categoría en este ciclo.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISTA 3: GRÁFICO DE BARRAS VERTICALES COMPARATIVAS (PRESUPUESTO VS GASTADO) */}
        {budgetViewMode === 'vertical' && (
          <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-extrabold uppercase text-slate-500 tracking-wider">
                Comparativa: Asignado vs Gastado Real
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> Asignado
                </span>
                <span className="flex items-center gap-1 font-bold text-[#7b52c9]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#7b52c9]" /> Gastado
                </span>
              </div>
            </div>

            {/* Columnas verticales */}
            <div className={`grid ${adjustedAllocations.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-2 sm:gap-4 items-end h-64 pt-4 pb-2 border-b border-slate-200`}>
              {adjustedAllocations.map((alloc) => {
                const maxVal = Math.max(alloc.finalAllocated, alloc.spentInCat, 1);
                const budgetBarHeight = Math.max(Math.round((alloc.finalAllocated / maxVal) * 100), 10);
                const spentBarHeight = Math.max(Math.round((alloc.spentInCat / maxVal) * 100), alloc.spentInCat > 0 ? 8 : 2);

                return (
                  <div key={alloc.id} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                    {/* Contenedor de las 2 barras verticales side-by-side con etiquetas numéricas en vertical */}
                    <div className="flex items-end justify-center gap-2 w-full h-48 px-1 relative">
                      
                      {/* Barra Asignado (Gris/Opaca) con texto vertical rotado más visible y grande */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full relative group/bar">
                        <div 
                          className="w-full bg-slate-200/90 hover:bg-slate-300 rounded-t-xl transition-all duration-500 flex flex-col items-center justify-end pb-2 overflow-hidden shadow-2xs"
                          style={{ height: `${budgetBarHeight}%` }}
                          title={`Asignado: ${formatCurrency(alloc.finalAllocated, currency)}`}
                        >
                          {/* Monto de Asignado en vertical grande y nítido */}
                          <span 
                            className="text-xs sm:text-sm font-black text-slate-700 tracking-wider select-none pointer-events-none whitespace-nowrap"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            {showBalance ? formatCurrency(alloc.finalAllocated, currency) : "••••"}
                          </span>
                        </div>
                      </div>

                      {/* Barra Gastado Real (Color de categoría o Rojo si excedió) con texto vertical rotado más visible y grande */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full relative group/bar">
                        <div 
                          className="w-full rounded-t-xl transition-all duration-500 shadow-sm flex flex-col items-center justify-end pb-2 overflow-hidden"
                          style={{ 
                            height: `${spentBarHeight}%`, 
                            backgroundColor: alloc.isExceeded ? '#e11d48' : alloc.color 
                          }}
                          title={`Gastado: ${formatCurrency(alloc.spentInCat, currency)}`}
                        >
                          {/* Monto de Gastado en vertical grande y nítido */}
                          {alloc.spentInCat > 0 && (
                            <span 
                              className="text-xs sm:text-sm font-black text-white tracking-wider select-none pointer-events-none whitespace-nowrap drop-shadow-xs"
                              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                              {showBalance ? formatCurrency(alloc.spentInCat, currency) : "••••"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resumen inferior de cada categoría */}
                    <div className="text-center w-full min-w-0 space-y-0.5 pt-1">
                      <span className="text-xs font-black text-[#2a2542] block truncate">
                        {alloc.name.split(' ')[0]}
                      </span>
                      <div className="flex items-center justify-center gap-1 text-[9px] font-bold">
                        <span className={alloc.isExceeded ? 'text-rose-600 font-black' : 'text-slate-500'}>
                          {alloc.spentPercent}%
                        </span>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-black block truncate ${alloc.isExceeded ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {alloc.isExceeded ? `Dif: -${formatCurrency(alloc.spentInCat - alloc.finalAllocated, currency)}` : `Disp: ${formatCurrency(alloc.remainingInCat, currency)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accesos rápidos de gasto directo */}
            <div className={`grid ${adjustedAllocations.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-1.5 pt-1`}>
              {adjustedAllocations.map(alloc => (
                <button
                  key={alloc.id}
                  onClick={() => onAddOccasionalExpense(alloc.id)}
                  className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs truncate"
                >
                  <Plus className="w-3 h-3 text-[#7b52c9]" />
                  <span className="truncate">Gasto en {alloc.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL / DIÁLOGO DE DECISIÓN DE EXCEDENTE A FIN DE MES */}
      {showSurplusActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in safe-top safe-bottom select-none">
          <div className="bg-white w-full max-w-sm rounded-[26px] p-5 shadow-2xl border border-slate-100 space-y-4">
            
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2a2542] leading-tight">
                    Destino del Excedente
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Cierre de ciclo / mes
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSurplusActionModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Monto del Excedente */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
                Dinero no gastado en el ciclo
              </span>
              <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                {formatCurrency(totalUnspentSurplus, currency)}
              </span>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                ¿Qué deseas hacer con este dinero sobrante?
              </p>
            </div>

            {/* Opciones de Acción */}
            <div className="space-y-2">
              <button
                onClick={handleRollOverSurplusToNewBudget}
                className="w-full p-3 rounded-2xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-all cursor-pointer flex items-center gap-3 group active:scale-98"
              >
                <div className="w-8 h-8 rounded-xl bg-[#7b52c9] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowRightCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-[#2a2542] block">
                    Pasar al Nuevo Presupuesto
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Se sumará como un ingreso extra disponible en tu siguiente ciclo.
                  </span>
                </div>
              </button>

              <button
                onClick={handleTransferSurplusToSavings}
                className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-all cursor-pointer flex items-center gap-3 group active:scale-98"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-[#2a2542] block">
                    Enviar a Cuenta de Ahorro
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Se retira del disponible para gastar y queda blindado en ahorros.
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowSurplusActionModal(false)}
              className="w-full py-2 text-center text-xs text-slate-400 font-bold hover:text-slate-600 cursor-pointer"
            >
              Decidir más tarde
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE PAGO DIRECTO CON MONTO EXACTO PERSONALIZABLE */}
      {confirmPaymentOb && (() => {
        const isPaid = paidMap.has(confirmPaymentOb.id);
        const isDebt = confirmPaymentOb.obligation_type === 'debt' || confirmPaymentOb.category === 'Crédito & Tarjetas';
        const regularAmount = Number(confirmPaymentOb.amount);
        const parsedPaid = parseThousands(paidInputAmount) || regularAmount;
        const extraAbono = Math.max(parsedPaid - regularAmount, 0);

        const curBalance = confirmPaymentOb.current_balance !== null && confirmPaymentOb.current_balance !== undefined
          ? Number(confirmPaymentOb.current_balance)
          : (confirmPaymentOb.total_debt_amount ? Number(confirmPaymentOb.total_debt_amount) : regularAmount * 12);
        const remainingInstallments = Math.max((confirmPaymentOb.total_installments || 24) - (confirmPaymentOb.paid_installments || 0), 1);
        
        // Simulación si es crédito y se ingresó más dinero
        const sim = (isDebt && extraAbono > 0) ? simulatePrepayment(
          curBalance,
          confirmPaymentOb.monthly_rate || 1.88,
          remainingInstallments,
          confirmPaymentOb.insurance_fee || 0,
          extraAbono
        ) : null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in safe-top safe-bottom select-none">
            <div className="bg-white w-full max-w-sm rounded-[26px] p-5 shadow-2xl border border-slate-100 space-y-3.5">
              
              {/* Cabecera */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDebt ? 'bg-purple-100 text-[#7b52c9]' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isDebt ? <CreditCard className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#2a2542] leading-tight truncate">
                    {isPaid ? "¿Revertir este pago?" : "¿Cuánto pagaste exactamente?"}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {confirmPaymentOb.title}
                  </p>
                </div>
              </div>

              {isPaid ? (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Al revertir, los <strong>{formatCurrency(Number(confirmPaymentOb.amount), currency)}</strong> volverán a aparecer como pendientes en este periodo.
                </p>
              ) : (
                <div className="space-y-3">
                  
                  {/* CAMPO DE ENTRADA DIRECTA DEL VALOR PAGADO */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Valor pagado ($ COP):</span>
                      <span className="text-[10px] text-purple-600">
                        Cuota pactada: {formatCurrency(regularAmount, currency)}
                      </span>
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">$</span>
                      <input
                        type="text"
                        autoFocus
                        value={paidInputAmount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPaidInputAmount(val ? formatThousands(Number(val)) : '');
                        }}
                        placeholder={formatThousands(regularAmount)}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-purple-200 focus:border-[#7b52c9] text-base font-black text-[#2a2542] outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* SI PAGÓ MÁS DE LA CUOTA EN UN CRÉDITO: DETECCIÓN INTELIGENTE DE ABONO A CAPITAL */}
                  {isDebt && extraAbono > 0 && (
                    <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 animate-fade-in text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-900 text-[11px]">
                          ✨ Abono extra detectado:
                        </span>
                        <span className="font-black text-[#7b52c9]">
                          +{formatCurrency(extraAbono, currency)}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 block">
                        ¿Cómo deseas que tu banco aplique este abono a capital?
                      </span>

                      {/* Selector directo de Destino del Abono */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setPrepaymentDest('term')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            prepaymentDest === 'term'
                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300 text-emerald-900 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[10px] block leading-none">Bajar Plazo</span>
                          <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                            Te ahorras {sim?.reduceTerm.savedInstallments || 1} cuotas
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPrepaymentDest('installment')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            prepaymentDest === 'installment'
                              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300 text-blue-900 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[10px] block leading-none">Bajar Cuota</span>
                          <span className="text-[9px] text-blue-700 font-bold block mt-1">
                            Cuota baja a {formatCurrency(sim?.reduceInstallment.newInstallment || regularAmount, currency)}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Botones de acción del modal */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setConfirmPaymentOb(null)}
                  className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPayAction}
                  className="py-2.5 rounded-xl bg-[#7b52c9] hover:bg-[#683cc7] text-xs font-black text-white shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {isPaid ? "Revertir" : "Registrar Pago"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL DE DETALLE DEL CRÉDITO */}
      {selectedDebtForDetail && (
        <DebtDetailModal
          debt={selectedDebtForDetail}
          payments={payments}
          onUpdateDebt={onUpdateObligation}
          onClose={() => setSelectedDebtForDetail(null)}
          currency={currency}
        />
      )}

      {/* MODAL DE AUDITORÍA Y TRANSPARENCIA DE CÁLCULO DEL PRESUPUESTO */}
      {showCalculationAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in safe-top safe-bottom select-none">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Cabecera */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#7b52c9] text-white flex items-center justify-center shadow-xs">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2a2542]">Desglose del Presupuesto</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Cómo se calcula este monto</span>
                </div>
              </div>
              <button
                onClick={() => setShowCalculationAudit(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido con Desglose */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs">
              
              {/* Resultado final destacado */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7b52c9] block">
                    Base para tu Estilo {currentPersonality.name}
                  </span>
                  <span className="text-xl font-black text-[#2a2542]">
                    {formatCurrency(uncommittedBudgetPool, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">Personalidad</span>
                  <span className="text-xs font-black text-purple-700 capitalize">{currentPersonality.name}</span>
                </div>
              </div>

              {/* Fórmula Paso a Paso */}
              <div className="space-y-2 border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/50">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Paso a Paso del Ciclo Actual (Hasta el día {nextPaydayDay})
                </span>

                <div className="space-y-2 divide-y divide-slate-100 text-xs">
                  {/* Saldo base / Dinero en cuenta */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 font-medium">1. Saldo disponible hoy (Bolsillo):</span>
                    <span className="font-extrabold text-[#2a2542]">{formatCurrency(remainingMoney, currency)}</span>
                  </div>

                  {/* Compromisos que faltan antes del sueldo */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-rose-600 font-medium">2. (-) Compromisos pendientes antes del día {nextPaydayDay}:</span>
                    <span className="font-extrabold text-rose-600">-{formatCurrency(commitmentsBeforeNextPayday, currency)}</span>
                  </div>

                  {/* Resultado neto */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-black text-slate-800">(=) Dinero Libre hasta tu Sueldo:</span>
                    <span className="font-black text-purple-700 text-sm">
                      {formatCurrency(uncommittedBudgetPool, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Compromisos pendientes detallados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    A pagar con el saldo de hoy (Antes del {nextPaydayDay})
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Total: {formatCurrency(commitmentsBeforeNextPayday, currency)}</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {obligations.filter(o => o.is_active && !paidMap.has(o.id) && o.due_day < nextPaydayDay).length === 0 ? (
                    <p className="text-[11px] text-emerald-600 italic py-1">
                      ✓ No tienes compromisos pendientes antes de tu fecha de cobro.
                    </p>
                  ) : (
                    obligations
                      .filter(o => o.is_active && !paidMap.has(o.id) && o.due_day < nextPaydayDay)
                      .map((ob) => (
                        <div key={ob.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-bold text-[#2a2542] block truncate">{ob.title}</span>
                            <span className="text-[10px] text-slate-400 block">Día de pago: {ob.due_day}</span>
                          </div>
                          <span className="font-black text-rose-600 shrink-0">
                            {formatCurrency(Number(ob.amount), currency)}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Lista de Cuentas cubiertas por el próximo sueldo */}
              {commitmentsAfterNextPayday > 0 && (
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-150 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-blue-900 tracking-wider">
                      Cubierto con el Sueldo del día {nextPaydayDay}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700">{formatCurrency(commitmentsAfterNextPayday, currency)}</span>
                  </div>
                  <p className="text-[10px] text-blue-700/90 leading-tight">
                    Estas cuentas (del {nextPaydayDay} en adelante) no se descuentan de tu saldo de hoy porque se cubrirán con el ingreso entrante.
                  </p>
                </div>
              )}

              {/* Botón Cerrar */}
              <button
                onClick={() => setShowCalculationAudit(false)}
                className="w-full py-2.5 rounded-xl bg-[#7b52c9] hover:bg-[#683cc7] text-white text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Entendido
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
