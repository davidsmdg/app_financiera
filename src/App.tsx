import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { ObligationsDashboardWidget } from './components/obligations/ObligationsDashboardWidget';
import { AddObligationModal } from './components/obligations/AddObligationModal';
import { ObligationsView } from './components/obligations/ObligationsView';
import type { Database } from './types/supabase';
import { Button } from './components/ui/Button';

import { 
  Sparkles,
  LogOut,
  UserCheck,
  Plus,
  ShieldCheck
} from 'lucide-react';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export function App() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Estados del Módulo de Obligaciones
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [payments, setPayments] = useState<ObligationPayment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'obligations_detail'>('dashboard');

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
      const { data: obData } = await (supabase
        .from('obligations') as any)
        .select('*')
        .order('due_day', { ascending: true });

      if (obData) setObligations(obData);

      const { data: payData } = await (supabase
        .from('obligation_payments') as any)
        .select('*');

      if (payData) setPayments(payData);
    } catch (e) {
      console.error("Error al cargar obligaciones:", e);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchObligationsData();
    }
  }, [sessionUser]);

  // Manejador para agregar nueva obligación
  const handleAddObligation = async (newOb: {
    title: string;
    category: string;
    amount: number;
    due_day: number;
    frequency: 'monthly' | 'biweekly' | 'annual';
    reminder_days_before: number;
  }) => {
    if (!sessionUser) return;

    const { data, error } = await (supabase.from('obligations') as any).insert({
      user_id: sessionUser.id,
      title: newOb.title,
      category: newOb.category,
      amount: newOb.amount,
      due_day: newOb.due_day,
      frequency: newOb.frequency,
      reminder_days_before: newOb.reminder_days_before,
    }).select();

    if (error) {
      alert("Error al guardar: " + error.message);
    } else if (data) {
      setObligations(prev => [...prev, data[0]].sort((a, b) => a.due_day - b.due_day));
    }
  };

  // Manejador para alternar pago (marcar como pagado o revertir)
  const handleTogglePay = async (obligationId: string, isCurrentlyPaid: boolean, amount: number) => {
    if (!sessionUser) return;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (isCurrentlyPaid) {
      // Revertir pago
      const { error } = await (supabase
        .from('obligation_payments') as any)
        .delete()
        .eq('obligation_id', obligationId)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (!error) {
        setPayments(prev => prev.filter(p => !(p.obligation_id === obligationId && p.month === currentMonth && p.year === currentYear)));
      }
    } else {
      // Registrar pago
      const { data, error } = await (supabase.from('obligation_payments') as any).insert({
        obligation_id: obligationId,
        user_id: sessionUser.id,
        month: currentMonth,
        year: currentYear,
        amount_paid: amount,
        status: 'paid',
      }).select();

      if (!error && data) {
        setPayments(prev => [...prev, data[0]]);
      }
    }
  };

  // Manejador para eliminar obligación
  const handleDeleteObligation = async (obligationId: string) => {
    if (!confirm("¿Deseas eliminar esta obligación recurrente?")) return;

    const { error } = await (supabase.from('obligations') as any).delete().eq('id', obligationId);
    if (!error) {
      setObligations(prev => prev.filter(o => o.id !== obligationId));
      setPayments(prev => prev.filter(p => p.obligation_id !== obligationId));
    }
  };

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

  return (
    <div className="min-h-screen bg-app-canvas text-title pb-20 safe-top safe-bottom">
      
      {/* HEADER LIMPIO: MARCA, USUARIO Y CERRAR SESIÓN */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/80 sticky top-0 z-30 px-6 py-4 shadow-card-soft">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-squircle-md bg-gradient-to-tr from-[#683cc7] via-[#7b52c9] to-[#9366eb] flex items-center justify-center text-white shadow-btn-primary">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#2a2542] leading-tight">FinanceFlow</h1>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{sessionUser.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>

        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {currentView === 'obligations_detail' ? (
          /* VISTA DETALLADA COMPLETA DE OBLIGACIONES */
          <ObligationsView
            obligations={obligations}
            payments={payments}
            onBack={() => setCurrentView('dashboard')}
            onAddObligation={() => setIsAddModalOpen(true)}
            onTogglePay={handleTogglePay}
            onDeleteObligation={handleDeleteObligation}
          />
        ) : (
          /* HOME LIMPIO: SOLO OBLIGACIONES */
          <div className="space-y-6">
            
            {/* Encabezado de Bienvenida */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-2xl font-black text-[#2a2542] tracking-tight">
                  Tus Obligaciones Financieras
                </h2>
                <p className="text-xs text-[#9f9cb2] mt-0.5">
                  Control de pagos fijos, cuotas bancarias y servicios del mes
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
                className="shadow-btn-primary"
              >
                Añadir Obligación
              </Button>
            </div>

            {/* Widget Principal de Obligaciones del Mes */}
            <ObligationsDashboardWidget
              obligations={obligations}
              payments={payments}
              onOpenDetails={() => setCurrentView('obligations_detail')}
              onAddObligation={() => setIsAddModalOpen(true)}
              onQuickPay={(id, amount) => handleTogglePay(id, false, amount)}
            />

            {/* Mensaje de estado cuando no hay obligaciones creadas */}
            {obligations.length === 0 && (
              <div className="bg-white p-8 rounded-squircle-xl shadow-card-float border border-slate-100 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f4effb] text-[#7b52c9] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#2a2542]">Sin obligaciones registradas aún</h3>
                <p className="text-xs text-[#9f9cb2] max-w-sm mx-auto">
                  Comienza agregando tu arriendo, servicios públicos o tarjetas de crédito para tener el control total del mes.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Añadir mi primera obligación
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODAL PARA AGREGAR NUEVA OBLIGACIÓN */}
      <AddObligationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddObligation}
      />

    </div>
  );
}

export default App;
