import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { AddObligationModal } from './components/obligations/AddObligationModal';
import { UnifiedDebtsView } from './components/obligations/UnifiedDebtsView';
import { InvoiceCheckPrompt } from './components/obligations/InvoiceCheckPrompt';
import { FinancialHealthWidget } from './components/incomes/FinancialHealthWidget';
import { AddIncomeModal } from './components/incomes/AddIncomeModal';
import { AddOccasionalExpenseModal } from './components/expenses/AddOccasionalExpenseModal';
import { SplitHomeScreen } from './components/home/SplitHomeScreen';
import { type AppTab } from './components/navigation/BottomNavBar';
import { DrawerMenu } from './components/navigation/DrawerMenu';
import { FinancialCalendarView } from './components/calendar/FinancialCalendarView';
import { SelectPersonalityModal } from './components/personalities/SelectPersonalityModal';
import { FINANCIAL_PERSONALITIES } from './data/personalities';
import { SpacesFilterBar } from './components/spaces/SpacesFilterBar';
import { ManageSpacesModal } from './components/spaces/ManageSpacesModal';
import { type Space } from './data/spaces';
import type { Database } from './types/supabase';

import { 
  Sparkles,
  Menu
} from 'lucide-react';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];
type Income = Database['public']['Tables']['incomes']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export function App() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Estados del Módulo de Obligaciones
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [payments, setPayments] = useState<ObligationPayment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Estados de Ingresos
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);

  // Estados de Gastos Ocasionales / Transacciones
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados de Navegación y Vistas (Split Screen UX)
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [personalityId, setPersonalityId] = useState<string>(() => {
    return localStorage.getItem('user_personality_id') || 'balanced';
  });
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState(false);

  const handleSelectPersonality = (id: string) => {
    setPersonalityId(id);
    localStorage.setItem('user_personality_id', id);
  };
  // Estados de Gastos Ocasionales / No presupuestados
  const [isAddOccasionalExpenseOpen, setIsAddOccasionalExpenseOpen] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string | undefined>(undefined);

  const handleOpenAddOccasionalExpense = (categoryId?: string) => {
    setSelectedExpenseCategory(categoryId);
    setIsAddOccasionalExpenseOpen(true);
  };

  const handleAddOccasionalExpense = async (expense: {
    amount: number;
    description: string;
    personality_category: string;
    transaction_date: string;
    space_name?: string;
  }) => {
    if (!sessionUser) return;
    try {
      const payload = {
        user_id: sessionUser.id,
        amount: expense.amount,
        type: 'expense' as const,
        description: expense.description,
        transaction_date: expense.transaction_date,
        personality_category: expense.personality_category,
        status: 'completed' as const,
      };

      const { data, error } = await (supabase.from('transactions') as any).insert(payload).select();
      if (!error && data) {
        setTransactions(prev => {
          const updated = [data[0], ...prev];
          localStorage.setItem('user_transactions_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      } else {
        const localTx = {
          id: 'tx_' + Date.now(),
          ...payload,
          account_id: 'default',
          category_id: null,
          payment_method: null,
          created_at: new Date().toISOString()
        } as Transaction;
        setTransactions(prev => {
          const updated = [localTx, ...prev];
          localStorage.setItem('user_transactions_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Error guardando gasto ocasional:", err);
      const localTx = {
        id: 'tx_' + Date.now(),
        user_id: sessionUser.id,
        amount: expense.amount,
        type: 'expense' as const,
        description: expense.description,
        transaction_date: expense.transaction_date,
        personality_category: expense.personality_category,
        status: 'completed' as const,
        account_id: 'default',
        category_id: null,
        payment_method: null,
        created_at: new Date().toISOString()
      } as Transaction;
      setTransactions(prev => {
        const updated = [localTx, ...prev];
        localStorage.setItem('user_transactions_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    }
  };
  const [spaces, setSpaces] = useState<Space[]>(() => {
    try {
      const saved = localStorage.getItem('user_finance_spaces_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isManageSpacesOpen, setIsManageSpacesOpen] = useState(false);

  // Guardar lugares cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('user_finance_spaces_v2', JSON.stringify(spaces));
    } catch (e) {
      console.error(e);
    }
  }, [spaces]);

  // Cargar lugares y espacios desde Supabase (con sincronización local)
  const fetchSpacesData = async () => {
    if (!sessionUser) return;
    try {
      const { data, error } = await (supabase.from('spaces') as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setSpaces(data);
        localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(data));
      } else {
        const local = localStorage.getItem('user_finance_spaces_' + sessionUser.id);
        if (local) setSpaces(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem('user_finance_spaces_' + sessionUser.id);
      if (local) setSpaces(JSON.parse(local));
    }
  };

  const handleAddSpace = async (name: string, icon: Space['icon'], color: string, occupants: number = 1) => {
    if (!sessionUser) return;

    try {
      const { data, error } = await (supabase.from('spaces') as any)
        .insert({
          user_id: sessionUser.id,
          name,
          icon,
          color,
          occupants,
          is_default: false,
        })
        .select();

      if (!error && data) {
        setSpaces(prev => {
          const updated = [...prev, data[0]];
          localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      } else {
        const fallback: Space = {
          id: 'space_' + Date.now(),
          user_id: sessionUser.id,
          name,
          icon,
          color,
          occupants,
          is_default: false,
        };
        setSpaces(prev => {
          const updated = [...prev, fallback];
          localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      const fallback: Space = {
        id: 'space_' + Date.now(),
        user_id: sessionUser.id,
        name,
        icon,
        color,
        occupants,
        is_default: false,
      };
      setSpaces(prev => {
        const updated = [...prev, fallback];
        localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleUpdateSpace = async (id: string, name: string, icon: Space['icon'], color: string, occupants: number) => {
    if (!sessionUser) return;

    try {
      await (supabase.from('spaces') as any)
        .update({
          name,
          icon,
          color,
          occupants,
        })
        .eq('id', id);

      setSpaces(prev => {
        const updated = prev.map(s => (s.id === id ? { ...s, name, icon, color, occupants } : s));
        localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    } catch {
      setSpaces(prev => {
        const updated = prev.map(s => (s.id === id ? { ...s, name, icon, color, occupants } : s));
        localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeleteSpace = async (id: string) => {
    if (!sessionUser) return;
    await (supabase.from('spaces') as any).delete().eq('id', id);

    setSpaces(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('user_finance_spaces_' + sessionUser.id, JSON.stringify(updated));
      return updated;
    });
    if (selectedSpaceId === id) setSelectedSpaceId(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar obligaciones y pagos cuando el usuario esté autenticado
  const fetchObligationsData = async () => {
    if (!sessionUser) return;

    try {
      const { data: obData, error: obError } = await (supabase
        .from('obligations') as any)
        .select('*')
        .order('due_day', { ascending: true });

      if (obData) {
        setObligations(obData);
      } else if (obError) {
        // Fallback a almacenamiento persistente local mientras se corre la migración en Supabase
        const localObs = localStorage.getItem('user_obligations_' + sessionUser.id);
        if (localObs) setObligations(JSON.parse(localObs));
      }

      const { data: payData, error: payError } = await (supabase
        .from('obligation_payments') as any)
        .select('*');

      if (payData) {
        setPayments(payData);
      } else if (payError) {
        const localPays = localStorage.getItem('user_obligation_payments_' + sessionUser.id);
        if (localPays) setPayments(JSON.parse(localPays));
      }
    } catch (e) {
      console.error("Error al cargar obligaciones:", e);
      const localObs = localStorage.getItem('user_obligations_' + sessionUser.id);
      if (localObs) setObligations(JSON.parse(localObs));
    }
  };

  // Cargar ingresos desde Supabase
  const fetchIncomesData = async () => {
    if (!sessionUser) return;
    try {
      const { data, error } = await (supabase.from('incomes') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setIncomes(data);
        localStorage.setItem('user_incomes_' + sessionUser.id, JSON.stringify(data));
      } else if (error) {
        const local = localStorage.getItem('user_incomes_' + sessionUser.id);
        if (local) setIncomes(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem('user_incomes_' + sessionUser.id);
      if (local) setIncomes(JSON.parse(local));
    }
  };

  // Cargar transacciones (gastos ocasionales) desde Supabase
  const fetchTransactionsData = async () => {
    if (!sessionUser) return;
    try {
      const { data, error } = await (supabase.from('transactions') as any)
        .select('*')
        .order('transaction_date', { ascending: false });

      if (data) {
        setTransactions(data);
        localStorage.setItem('user_transactions_' + sessionUser.id, JSON.stringify(data));
      } else if (error) {
        const local = localStorage.getItem('user_transactions_' + sessionUser.id);
        if (local) setTransactions(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem('user_transactions_' + sessionUser.id);
      if (local) setTransactions(JSON.parse(local));
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchObligationsData();
      fetchSpacesData();
      fetchIncomesData();
      fetchTransactionsData();
    }
  }, [sessionUser]);

  // Manejador para agregar o crear un ingreso
  const handleAddIncome = async (newInc: {
    name: string;
    amount: number;
    income_type: 'recurring' | 'occasional';
    frequency: 'monthly' | 'biweekly' | 'weekly' | 'one_time';
    payment_day?: number;
    income_date?: string;
    category?: string;
  }) => {
    if (!sessionUser) return;

    try {
      const payload = {
        user_id: sessionUser.id,
        name: newInc.name,
        amount: newInc.amount,
        income_type: newInc.income_type,
        frequency: newInc.frequency,
        payment_day: newInc.payment_day || null,
        income_date: newInc.income_date || null,
        category: newInc.category || 'Salario',
        is_active: true,
      };

      const { data, error } = await (supabase.from('incomes') as any).insert(payload).select();

      if (!error && data) {
        setIncomes(prev => {
          const updated = [data[0], ...prev];
          localStorage.setItem('user_incomes_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      } else {
        const localRec = {
          id: 'inc_' + Date.now(),
          ...payload,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setIncomes(prev => {
          const updated = [localRec, ...prev];
          localStorage.setItem('user_incomes_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      const localRec = {
        id: 'inc_' + Date.now(),
        user_id: sessionUser.id,
        name: newInc.name,
        amount: newInc.amount,
        income_type: newInc.income_type,
        frequency: newInc.frequency,
        payment_day: newInc.payment_day || null,
        income_date: newInc.income_date || null,
        category: newInc.category || 'Salario',
        is_active: true,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setIncomes(prev => {
        const updated = [localRec, ...prev];
        localStorage.setItem('user_incomes_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Manejador para agregar nueva obligación
  const handleAddObligation = async (newOb: {
    title: string;
    category: string;
    amount: number;
    due_day: number;
    frequency: 'monthly' | 'biweekly' | 'annual';
    reminder_days_before: number;
    obligation_type?: 'recurring' | 'debt';
    total_debt_amount?: number;
    current_balance?: number;
    total_installments?: number;
    paid_installments?: number;
    monthly_rate?: number;
    annual_rate?: number;
    insurance_fee?: number;
    loan_number?: string;
    lender_name?: string;
  }) => {
    if (!sessionUser) return;

    try {
      const payload: any = {
        user_id: sessionUser.id,
        title: newOb.title,
        category: newOb.category,
        amount: newOb.amount,
        due_day: newOb.due_day,
        frequency: newOb.frequency,
        reminder_days_before: newOb.reminder_days_before,
        obligation_type: newOb.obligation_type || 'recurring',
      };

      if (newOb.obligation_type === 'debt') {
        payload.total_debt_amount = newOb.total_debt_amount;
        payload.current_balance = newOb.current_balance;
        payload.total_installments = newOb.total_installments;
        payload.paid_installments = newOb.paid_installments || 0;
        payload.monthly_rate = newOb.monthly_rate;
        payload.annual_rate = newOb.annual_rate;
        payload.insurance_fee = newOb.insurance_fee;
        payload.loan_number = newOb.loan_number;
        payload.lender_name = newOb.lender_name;
      }

      const { data, error } = await (supabase.from('obligations') as any).insert(payload).select();

      if (!error && data) {
        setObligations(prev => {
          const updated = [...prev, data[0]].sort((a, b) => a.due_day - b.due_day);
          localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      } else {
        // Fallback local
        const newLocalRecord = {
          id: 'ob_' + Date.now(),
          ...payload,
          account_id: null,
          color: '#7b52c9',
          is_active: true,
          created_at: new Date().toISOString()
        };

        setObligations(prev => {
          const updated = [...prev, newLocalRecord].sort((a, b) => a.due_day - b.due_day);
          localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      const newLocalRecord = {
        id: 'ob_' + Date.now(),
        user_id: sessionUser.id,
        title: newOb.title,
        category: newOb.category,
        amount: newOb.amount,
        due_day: newOb.due_day,
        frequency: newOb.frequency,
        reminder_days_before: newOb.reminder_days_before,
        obligation_type: newOb.obligation_type || 'recurring',
        total_debt_amount: newOb.total_debt_amount,
        current_balance: newOb.current_balance,
        total_installments: newOb.total_installments,
        paid_installments: newOb.paid_installments || 0,
        monthly_rate: newOb.monthly_rate,
        annual_rate: newOb.annual_rate,
        insurance_fee: newOb.insurance_fee,
        loan_number: newOb.loan_number,
        lender_name: newOb.lender_name,
        account_id: null,
        color: '#7b52c9',
        is_active: true,
        created_at: new Date().toISOString()
      };

      setObligations(prev => {
        const updated = [...prev, newLocalRecord].sort((a, b) => a.due_day - b.due_day);
        localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Manejador para alternar pago (marcar como pagado o revertir, con soporte de abono extra a créditos)
  const handleTogglePay = async (
    obligationId: string, 
    isCurrentlyPaid: boolean, 
    amount: number,
    debtPaymentOptions?: {
      extraPayment?: number;
      prepaymentTarget?: 'reduce_term' | 'reduce_installment';
      savedInstallments?: number;
      newBalance?: number;
    }
  ) => {
    if (!sessionUser) return;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (isCurrentlyPaid) {
      // Revertir pago
      await (supabase
        .from('obligation_payments') as any)
        .delete()
        .eq('obligation_id', obligationId)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      setPayments(prev => {
        const updated = prev.filter(p => !(p.obligation_id === obligationId && p.month === currentMonth && p.year === currentYear));
        localStorage.setItem('user_obligation_payments_' + sessionUser.id, JSON.stringify(updated));
        return updated;
      });

      // Si es un crédito, revertir saldo y cuotas
      const targetObligation = obligations.find(o => o.id === obligationId);
      const isCreditDebt = targetObligation && (targetObligation.obligation_type === 'debt' || targetObligation.category === 'Crédito & Tarjetas');
      if (isCreditDebt && targetObligation) {
        const monthlyRate = targetObligation.monthly_rate || 1.88;
        const insurance = targetObligation.insurance_fee ? Number(targetObligation.insurance_fee) : 0;
        const regularInstallment = Number(targetObligation.amount);
        const curBal = targetObligation.current_balance !== null && targetObligation.current_balance !== undefined
          ? Number(targetObligation.current_balance)
          : Number(targetObligation.total_debt_amount || regularInstallment * 12);
        
        const interestPortion = Math.round(curBal * (monthlyRate / 100));
        const capitalPortion = Math.max(regularInstallment - interestPortion - insurance, 0);
        const restoredBalance = curBal + capitalPortion;
        const restoredInstallments = Math.max((targetObligation.paid_installments || 1) - 1, 0);

        await (supabase.from('obligations') as any)
          .update({
            current_balance: restoredBalance,
            paid_installments: restoredInstallments,
          })
          .eq('id', obligationId);

        setObligations(prev => {
          const updated = prev.map(o => {
            if (o.id === obligationId) {
              return {
                ...o,
                current_balance: restoredBalance,
                paid_installments: restoredInstallments,
              };
            }
            return o;
          });
          localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      // Registrar pago
      const totalAmountPaid = amount + (debtPaymentOptions?.extraPayment || 0);

      const { data, error } = await (supabase.from('obligation_payments') as any).insert({
        obligation_id: obligationId,
        user_id: sessionUser.id,
        month: currentMonth,
        year: currentYear,
        amount_paid: totalAmountPaid,
        status: 'paid',
      }).select();

      if (!error && data) {
        setPayments(prev => {
          const updated = [...prev, data[0]];
          localStorage.setItem('user_obligation_payments_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      } else {
        const localPay = {
          id: 'pay_' + Date.now(),
          obligation_id: obligationId,
          user_id: sessionUser.id,
          month: currentMonth,
          year: currentYear,
          amount_paid: totalAmountPaid,
          paid_date: new Date().toISOString(),
          status: 'paid' as const,
          created_at: new Date().toISOString()
        };
        setPayments(prev => {
          const updated = [...prev, localPay];
          localStorage.setItem('user_obligation_payments_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }

      // Si es un crédito, siempre descontar el abono a capital del saldo total y aumentar cuotas pagadas
      const targetObligation = obligations.find(o => o.id === obligationId);
      const isCreditDebt = targetObligation && (targetObligation.obligation_type === 'debt' || targetObligation.category === 'Crédito & Tarjetas');

      if (isCreditDebt && targetObligation) {
        let newBalance = targetObligation.current_balance !== null && targetObligation.current_balance !== undefined
          ? Number(targetObligation.current_balance)
          : (targetObligation.total_debt_amount ? Number(targetObligation.total_debt_amount) : Number(targetObligation.amount) * (targetObligation.total_installments || 12));
        
        let newPaidInstallments = (targetObligation.paid_installments || 0) + 1;

        if (debtPaymentOptions?.newBalance !== undefined) {
          // Vino de simulación de pago con abono extra
          newBalance = debtPaymentOptions.newBalance;
          newPaidInstallments += (debtPaymentOptions.savedInstallments || 0);
        } else {
          // Pago de cuota normal: descomponer en abono a capital
          const monthlyRate = targetObligation.monthly_rate || 1.88;
          const insurance = targetObligation.insurance_fee ? Number(targetObligation.insurance_fee) : 0;
          const regularInstallment = Number(targetObligation.amount);
          const interestPortion = Math.round(newBalance * (monthlyRate / 100));
          const capitalPortion = Math.max(regularInstallment - interestPortion - insurance, 0);

          newBalance = Math.max(newBalance - capitalPortion, 0);
        }

        await (supabase.from('obligations') as any)
          .update({
            current_balance: newBalance,
            paid_installments: newPaidInstallments,
          })
          .eq('id', obligationId);

        setObligations(prev => {
          const updated = prev.map(o => {
            if (o.id === obligationId) {
              return {
                ...o,
                current_balance: newBalance,
                paid_installments: newPaidInstallments,
              };
            }
            return o;
          });
          localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  // Manejador para actualizar cualquier campo de una obligación/crédito
  const handleUpdateObligation = async (obligationId: string, updates: Partial<Obligation>) => {
    if (!sessionUser) return;

    await (supabase.from('obligations') as any)
      .update(updates)
      .eq('id', obligationId);

    setObligations(prev => {
      const updated = prev.map(o => {
        if (o.id === obligationId) {
          return { ...o, ...updates };
        }
        return o;
      });
      localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
      return updated;
    });
  };

  // Manejador para eliminar obligación
  const handleDeleteObligation = async (obligationId: string) => {
    if (!confirm("¿Deseas eliminar esta obligación recurrente?")) return;

    await (supabase.from('obligations') as any).delete().eq('id', obligationId);
    setObligations(prev => {
      const updated = prev.filter(o => o.id !== obligationId);
      localStorage.setItem('user_obligations_' + sessionUser.id, JSON.stringify(updated));
      return updated;
    });
    setPayments(prev => {
      const updated = prev.filter(p => p.obligation_id !== obligationId);
      localStorage.setItem('user_obligation_payments_' + sessionUser.id, JSON.stringify(updated));
      return updated;
    });
  };

  // Obtener el nombre del espacio seleccionado para filtrar obligaciones
  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  // Mapa de conteo de obligaciones por lugar
  const obligationsCountMap = spaces.reduce((acc, sp) => {
    const c = obligations.filter(o => o.title.toLowerCase().includes(`[${sp.name.toLowerCase()}]`)).length;
    acc[sp.name] = c;
    return acc;
  }, {} as Record<string, number>);

  // Filtrar obligaciones según el espacio seleccionado (si hay uno activo)
  const displayedObligations = selectedSpace
    ? obligations.filter(o => o.title.toLowerCase().includes(`[${selectedSpace.name.toLowerCase()}]`))
    : obligations;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-app-canvas flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7b52c9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessionUser) {
    return <LoginScreen onLoginSuccess={(user) => setSessionUser(user)} />;
  }

  const currentPersonality = FINANCIAL_PERSONALITIES[personalityId] || FINANCIAL_PERSONALITIES.balanced;

  return (
    <div className="min-h-screen bg-app-canvas text-title pb-10 safe-top safe-bottom overflow-x-hidden w-full max-w-full box-border">
      
      {/* HEADER MINIMALISTA CON MENÚ HAMBURGUESA Y LOGO A LA IZQUIERDA, Y PERSONALIDAD DESTACADA A LA DERECHA */}
      <header className="sticky top-0 z-30 w-full px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-md sm:max-w-4xl mx-auto flex items-center justify-between gap-2">
          
          {/* Lado Izquierdo: Menú Hamburguesa + Logo/Nombre de la plataforma */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs border border-slate-200/60 shrink-0"
              title="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#683cc7] to-[#8c65d9] flex items-center justify-center text-white shadow-2xs shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-base font-black text-[#2a2542] tracking-tight truncate">FinanceFlow</span>
            </div>
          </div>

          {/* Lado Derecho: Badge de Personalidad con Ícono Grande y Nombre Visible */}
          <button
            onClick={() => setIsPersonalityModalOpen(true)}
            className="px-3 py-1.5 rounded-2xl bg-purple-50/90 hover:bg-purple-100/80 text-[#7b52c9] border border-purple-200 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 transition-all shadow-2xs"
            title="Cambiar Personalidad Financiera"
          >
            <span className="text-xl leading-none">{currentPersonality.emoji}</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none">Estilo</span>
              <span className="font-black text-xs text-[#7b52c9] leading-tight capitalize">{currentPersonality.name}</span>
            </div>
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="w-full max-w-md sm:max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 box-border">

        {/* PESTAÑA 1: INICIO LIMPIO (SPLIT SCREEN UX + PERSONALIDADES) */}
        {currentTab === 'home' && (
          <SplitHomeScreen
            incomes={incomes}
            obligations={obligations}
            payments={payments}
            transactions={transactions}
            onTogglePay={handleTogglePay}
            personalityId={personalityId}
            onOpenPersonalityModal={() => setIsPersonalityModalOpen(true)}
            onAddIncome={() => setIsAddIncomeModalOpen(true)}
            onAddObligation={() => setIsAddModalOpen(true)}
            onUpdateObligation={handleUpdateObligation}
            onAddOccasionalExpense={handleOpenAddOccasionalExpense}
            onGoToDebtsTab={() => setCurrentTab('debts')}
            currency="COP"
          />
        )}

        {/* PESTAÑA 2: CALENDARIO FINANCIERO */}
        {currentTab === 'calendar' && (
          <FinancialCalendarView
            obligations={obligations}
            payments={payments}
            incomes={incomes}
            currency="COP"
          />
        )}

        {/* PESTAÑA 3: MIS DEUDAS (UNIFICADA: CRÉDITOS A PLAZO + FACTURAS & FIJOS) */}
        {currentTab === 'debts' && (
          <div className="space-y-5">
            {/* Barra de menú de Lugares y Espacios */}
            <SpacesFilterBar
              spaces={spaces}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
              onManageSpaces={() => setIsManageSpacesOpen(true)}
              obligationsCountMap={obligationsCountMap}
            />

            {/* Prompt Inteligente de actualización de valor de factura */}
            <InvoiceCheckPrompt
              obligations={displayedObligations}
              payments={payments}
              onUpdateInvoice={(id, newAmount, newDueDay) => handleUpdateObligation(id, { amount: newAmount, due_day: newDueDay })}
              currency="COP"
            />

            {/* Vista Unificada de Deudas y Facturas */}
            <UnifiedDebtsView
              obligations={displayedObligations}
              payments={payments}
              onBack={() => setCurrentTab('home')}
              onAddObligation={() => setIsAddModalOpen(true)}
              onTogglePay={handleTogglePay}
              onUpdateObligation={handleUpdateObligation}
              onDeleteObligation={handleDeleteObligation}
              currency="COP"
              spaces={spaces}
            />
          </div>
        )}

        {/* PESTAÑA 4: ESTILO / PERSONALIDAD & SALUD FINANCIERA */}
        {currentTab === 'personality' && (
          <div className="space-y-5 max-w-lg mx-auto">
            <FinancialHealthWidget
              incomes={incomes}
              obligations={obligations}
              currency="COP"
              onAddIncome={() => setIsAddIncomeModalOpen(true)}
            />
          </div>
        )}

      </main>

      {/* MENÚ HAMBURGUESA DESPLEGABLE (DRAWER) */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userEmail={sessionUser.email || ''}
        onLogout={handleLogout}
        obligationsCount={obligations.filter(o => o.obligation_type !== 'debt' && o.category !== 'Crédito & Tarjetas').length}
        debtsCount={obligations.filter(o => o.obligation_type === 'debt' || o.category === 'Crédito & Tarjetas').length}
        onManageSpaces={() => setIsManageSpacesOpen(true)}
        onOpenPersonality={() => setIsPersonalityModalOpen(true)}
        personalityName={currentPersonality.name}
        personalityEmoji={currentPersonality.emoji}
      />

      {/* MODAL PARA CAMBIAR PERSONALIDAD FINANCIERA */}
      <SelectPersonalityModal
        isOpen={isPersonalityModalOpen}
        onClose={() => setIsPersonalityModalOpen(false)}
        selectedPersonalityId={personalityId}
        onSelectPersonality={handleSelectPersonality}
      />

      {/* MODAL PARA AGREGAR NUEVA OBLIGACIÓN */}
      <AddObligationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSubmit={handleAddObligation}
      />

      {/* MODAL PARA REGISTRAR GASTO OCASIONAL / SALIDA */}
      <AddOccasionalExpenseModal
        isOpen={isAddOccasionalExpenseOpen}
        onClose={() => setIsAddOccasionalExpenseOpen(false)}
        personalityId={personalityId}
        defaultCategoryId={selectedExpenseCategory}
        onSubmit={handleAddOccasionalExpense}
      />

      {/* MODAL PARA REGISTRAR NUEVO INGRESO */}
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        onSubmit={handleAddIncome}
      />

      {/* MODAL PARA GESTIONAR LUGARES Y ESPACIOS */}
      <ManageSpacesModal
        isOpen={isManageSpacesOpen}
        onClose={() => setIsManageSpacesOpen(false)}
        spaces={spaces}
        onAddSpace={handleAddSpace}
        onUpdateSpace={handleUpdateSpace}
        onDeleteSpace={handleDeleteSpace}
      />

    </div>
  );
}

export default App;
