import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  PlayCircle, 
  Video, 
  ShieldCheck, 
  Percent, 
  HelpCircle, 
  History, 
  CheckCircle2, 
  Edit2, 
  Save, 
  FileText,
  Globe,
  FileCheck,
  CreditCard as PaymentIcon
} from 'lucide-react';
import { formatCurrency, parseThousands } from '../../lib/utils';
import { calculateMonthlyInstallment } from '../../lib/loanCalculator';
import { findServiceDirectoryItem } from '../../data/serviceDirectory';
import type { Database } from '../../types/supabase';

type Obligation = Database['public']['Tables']['obligations']['Row'];
type ObligationPayment = Database['public']['Tables']['obligation_payments']['Row'];

export interface DebtDetailModalProps {
  debt: Obligation | null;
  payments?: ObligationPayment[];
  onUpdateDebt?: (obligationId: string, updates: Partial<Obligation>) => Promise<void>;
  onClose: () => void;
  currency?: string;
}

export const DebtDetailModal: React.FC<DebtDetailModalProps> = ({
  debt,
  payments = [],
  onUpdateDebt,
  onClose,
  currency = "COP",
}) => {
  if (!debt) return null;

  // Estado local sincronizado con los datos de la deuda para reflejo inmediato e instantáneo
  const [currentDebt, setCurrentDebt] = useState<Obligation>(debt);

  // Pestañas principales arriba del modal
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'ayuda'>('resumen');

  // Modo edición de campos
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar estado local cuando debt prop cambie
  React.useEffect(() => {
    setCurrentDebt(debt);
  }, [debt]);

  // Estados editables de los campos inicializados con los datos de currentDebt
  const [editTitle, setEditTitle] = useState(debt.title);
  const [editBalance, setEditBalance] = useState(String(debt.current_balance ?? debt.total_debt_amount ?? 3173329));
  const [editInstallment, setEditInstallment] = useState(String(debt.amount));
  const [editTotalInstallments, setEditTotalInstallments] = useState(String(debt.total_installments || 30));
  const [editPaidInstallments, setEditPaidInstallments] = useState(String(debt.paid_installments || 2));
  const [editDueDay, setEditDueDay] = useState(String(debt.due_day));
  const [editAnnualRate, setEditAnnualRate] = useState(String(debt.annual_rate || 25.05));
  const [editMonthlyRate, setEditMonthlyRate] = useState(String(debt.monthly_rate || 1.88));
  const [editInsurance, setEditInsurance] = useState(String(debt.insurance_fee || 5871.09));
  const [editLoanNumber, setEditLoanNumber] = useState(debt.loan_number || '');

  // Sincronizar estados editables cuando cambie currentDebt
  React.useEffect(() => {
    setEditTitle(currentDebt.title);
    setEditBalance(String(currentDebt.current_balance ?? currentDebt.total_debt_amount ?? 3173329));
    setEditInstallment(String(currentDebt.amount));
    setEditTotalInstallments(String(currentDebt.total_installments || 30));
    setEditPaidInstallments(String(currentDebt.paid_installments || 2));
    setEditDueDay(String(currentDebt.due_day));
    setEditAnnualRate(String(currentDebt.annual_rate || 25.05));
    setEditMonthlyRate(String(currentDebt.monthly_rate || 1.88));
    setEditInsurance(String(currentDebt.insurance_fee || 5871.09));
    setEditLoanNumber(currentDebt.loan_number || '');
  }, [currentDebt]);

  const totalAmount = currentDebt.total_debt_amount ? Number(currentDebt.total_debt_amount) : Number(currentDebt.amount) * (currentDebt.total_installments || 12);
  
  // EL SALDO A LA FECHA ES EL VALOR EDITADO O REGISTRADO EXACTO (sin restarle dobles deducciones)
  const currentBalance = currentDebt.current_balance !== null && currentDebt.current_balance !== undefined 
    ? Number(currentDebt.current_balance) 
    : totalAmount;
  
  const totalInstallments = currentDebt.total_installments || 30;
  const paidInstallments = currentDebt.paid_installments || 2;
  const remainingInstallments = Math.max(totalInstallments - paidInstallments, 0);

  // Pagos históricos registrados para este crédito
  const debtPayments = payments
    .filter(p => p.obligation_id === currentDebt.id && p.status === 'paid')
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  // Desglose de cuota exacta del extracto o calculada sobre el saldo actual
  const insuranceFee = currentDebt.insurance_fee ? Number(currentDebt.insurance_fee) : 5871.09;
  const monthlyRate = currentDebt.monthly_rate || 1.88;
  const annualRate = currentDebt.annual_rate || 25.05;
  const regularInstallment = Number(currentDebt.amount) || 152437.45;

  // Composición de cuota sobre el saldo real
  const estimatedInterest = Math.round(currentBalance * (monthlyRate / 100));
  const estimatedCapital = Math.max(regularInstallment - estimatedInterest - insuranceFee, 0);

  // Si hubo abono extra en el pago registrado este mes (ej. pagó 160.000 vs cuota pactada)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const latestThisMonthPayment = debtPayments.find(p => p.month === currentMonth && p.year === currentYear);
  const actualPaidAmount = latestThisMonthPayment ? Number(latestThisMonthPayment.amount_paid) : 0;
  const extraAbono = Math.max(actualPaidAmount - regularInstallment, 0);

  // Cuota mensual fija recalculada sobre el saldo exacto actual
  const recalculatedInstallment = remainingInstallments > 0
    ? calculateMonthlyInstallment(currentBalance, monthlyRate, remainingInstallments, insuranceFee).totalInstallment
    : regularInstallment;

  // Guardar cambios manuales de edición
  const handleSaveChanges = async () => {
    const rawBalance = parseThousands(editBalance) || Number(editBalance);
    const rawInstallment = parseThousands(editInstallment) || Number(editInstallment);
    const rawInsurance = parseThousands(editInsurance) || Number(editInsurance);

    const updates: Partial<Obligation> = {
      title: editTitle,
      amount: rawInstallment,
      current_balance: rawBalance,
      total_installments: Number(editTotalInstallments),
      paid_installments: Number(editPaidInstallments),
      due_day: Number(editDueDay),
      annual_rate: Number(editAnnualRate),
      monthly_rate: Number(editMonthlyRate),
      insurance_fee: rawInsurance,
      loan_number: editLoanNumber
    };

    // Actualización inmediata local en el modal para que el cambio se vea al instante sin cerrar
    setCurrentDebt(prev => ({
      ...prev,
      ...updates
    }));
    setIsEditing(false);

    if (onUpdateDebt) {
      setIsSaving(true);
      try {
        await onUpdateDebt(currentDebt.id, updates);
      } catch (err) {
        console.error("Error al guardar cambios de la deuda:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Directorio de ayuda y links oficiales según el servicio
  const serviceInfo = findServiceDirectoryItem(currentDebt.title, currentDebt.lender_name);

  // Tutoriales oficiales verificados según el extracto de Lulo Bank (o links del directorio)
  const luloTutorials = [
    {
      title: '¿Cómo pagar tu Lulo crédito con la Lulo cuenta?',
      channel: 'Lulo Tutorial',
      url: 'https://www.youtube.com/watch?v=zEuBfT7VADI',
    },
    {
      title: '¿Cómo pagar tu Lulo crédito con PSE?',
      channel: 'Lulo Tutorial',
      url: 'https://www.youtube.com/watch?v=K8sZdPOKM3A&t=1s',
    },
    {
      title: '¿Cómo activar el débito automático de tu Lulo crédito?',
      channel: 'Lulo Tutorial',
      url: 'https://www.youtube.com/watch?v=4bOPHHzqQhI',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in safe-top safe-bottom select-none">
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-100 flex flex-col h-[650px] max-h-[92vh] overflow-hidden">
        
        {/* CABECERA DEL MODAL */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/60 to-white">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8300e9] to-[#a134f5] text-white flex items-center justify-center shadow-sm shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-[#2a2542] leading-tight truncate">
                {currentDebt.title}
              </h3>
            </div>
          </div>

          {/* Botones de Cabecera: Editar todos los campos y Cerrar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isEditing 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-purple-100/80 hover:bg-purple-200 text-[#7b52c9]'
              }`}
              title="Editar todos los campos del crédito"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar' : 'Editar Datos'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PESTAÑAS BIEN ARRIBA: SECCIONES INDEPENDIENTES */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200/60 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => { setActiveTab('resumen'); setIsEditing(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'resumen'
                ? 'bg-[#7b52c9] text-white shadow-2xs font-black'
                : 'bg-white hover:bg-slate-200/60 text-slate-600 border border-slate-200/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resumen</span>
          </button>

          <button
            onClick={() => { setActiveTab('historial'); setIsEditing(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'historial'
                ? 'bg-[#7b52c9] text-white shadow-2xs font-black'
                : 'bg-white hover:bg-slate-200/60 text-slate-600 border border-slate-200/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({debtPayments.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('ayuda'); setIsEditing(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ayuda'
                ? 'bg-[#7b52c9] text-white shadow-2xs font-black'
                : 'bg-white hover:bg-slate-200/60 text-slate-600 border border-slate-200/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ayuda</span>
          </button>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* PANEL DE EDICIÓN COMPLETA DE CAMPOS */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-900 text-xs flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-amber-700" />
                  Editar todos los campos del crédito
                </span>
                <span className="text-[10px] text-amber-700 font-bold">Modo Administrador</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nombre / Título:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Saldo Capital a la Fecha ($):</label>
                  <input
                    type="text"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Cuota Mensual Pactada ($):</label>
                  <input
                    type="text"
                    value={editInstallment}
                    onChange={(e) => setEditInstallment(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Día de Pago (1 a 31):</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editDueDay}
                    onChange={(e) => setEditDueDay(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Total Cuotas Pactadas:</label>
                  <input
                    type="number"
                    value={editTotalInstallments}
                    onChange={(e) => setEditTotalInstallments(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Cuotas Pagadas Actuales:</label>
                  <input
                    type="number"
                    value={editPaidInstallments}
                    onChange={(e) => setEditPaidInstallments(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tasa Efectiva Anual (% E.A.):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAnnualRate}
                    onChange={(e) => setEditAnnualRate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tasa Mes Vencido (% M.V.):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMonthlyRate}
                    onChange={(e) => setEditMonthlyRate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">No. de Crédito:</label>
                  <input
                    type="text"
                    value={editLoanNumber}
                    onChange={(e) => setEditLoanNumber(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Seguro de Vida ($):</label>
                  <input
                    type="text"
                    value={editInsurance}
                    onChange={(e) => setEditInsurance(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-[#7b52c9] text-white text-xs font-black hover:bg-[#683cc7] flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA 1: RESUMEN DEL CRÉDITO */}
          {activeTab === 'resumen' && (
            <div className="space-y-4 animate-fade-in">
              {/* Tarjeta de Resumen Principal del Crédito */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Total a la Fecha</span>
                    <span className="text-xl sm:text-2xl font-black text-[#2a2542] tracking-tight">
                      {formatCurrency(currentBalance, currency)}
                    </span>
                    {extraAbono > 0 && (
                      <span className="text-[10px] font-extrabold text-emerald-600 block mt-0.5">
                        ✓ Incluye abono extra de {formatCurrency(extraAbono, currency)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {extraAbono > 0 ? 'Nueva Cuota Recalculada' : 'Cuota Mensual Fija'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-rose-600 tracking-tight">
                      {formatCurrency(recalculatedInstallment, currency)}
                    </span>
                    {extraAbono > 0 && (
                      <span className="text-[10px] font-bold text-purple-600 block mt-0.5">
                        Antes: <del className="text-slate-400">{formatCurrency(regularInstallment, currency)}</del>
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso de pago del crédito */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Progreso: {Math.round((paidInstallments / totalInstallments) * 100)}%</span>
                    <span>Faltan {remainingInstallments} cuotas</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(Math.round((paidInstallments / totalInstallments) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabla de Datos Generales del Crédito */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-2 text-xs">
                <h4 className="font-extrabold text-[#2a2542] text-[11px] uppercase tracking-wider text-slate-400">
                  Datos Generales del Crédito
                </h4>

                <div className="divide-y divide-slate-100">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Monto solicitado original:</span>
                    <span className="font-bold text-[#2a2542]">{formatCurrency(totalAmount, currency)}</span>
                  </div>

                  {currentDebt.loan_number && (
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">No. Crédito:</span>
                      <span className="font-mono font-bold text-[#2a2542] bg-slate-100 px-2 py-0.5 rounded">{currentDebt.loan_number}</span>
                    </div>
                  )}

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Día límite de pago:</span>
                    <span className="font-bold text-[#2a2542] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      Día {currentDebt.due_day} de cada mes
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Tasa de interés Efectiva Anual:</span>
                    <span className="font-bold text-purple-700 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      {annualRate}% E.A. ({monthlyRate}% M.V.)
                    </span>
                  </div>

                  {insuranceFee > 0 && (
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Seguro de vida asociado:</span>
                      <span className="font-bold text-slate-700">{formatCurrency(insuranceFee, currency)}</span>
                    </div>
                  )}

                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Estado del crédito:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Al día
                    </span>
                  </div>
                </div>
              </div>

              {/* Desglose de Próxima Cuota (Capital + Intereses + Seguro) */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">
                  Composición de tu Cuota (~{formatCurrency(recalculatedInstallment, currency)})
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-purple-100">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Abono Capital</span>
                    <span className="text-xs font-black text-emerald-700">{formatCurrency(estimatedCapital, currency)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-purple-100">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Interés Corriente</span>
                    <span className="text-xs font-black text-amber-700">{formatCurrency(estimatedInterest, currency)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-purple-100">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Seguro Vida</span>
                    <span className="text-xs font-black text-slate-700">{formatCurrency(insuranceFee, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: HISTORIAL DE PAGOS */}
          {activeTab === 'historial' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-600" />
                  <h4 className="font-extrabold text-[#2a2542] text-[11px] uppercase tracking-wider">
                    Historial de Pagos Registrados
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  {debtPayments.length} {debtPayments.length === 1 ? 'mes registrado' : 'meses registrados'}
                </span>
              </div>

              {debtPayments.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                  Aún no hay pagos registrados en la aplicación para este crédito. Marca la cuota como pagada para llevar la trazabilidad mensual.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {debtPayments.map((p) => {
                    const monthName = monthNames[(p.month - 1) % 12];
                    const isExtra = Number(p.amount_paid) > regularInstallment;
                    return (
                      <div 
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/40 border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-[#2a2542] block">
                              {monthName} {p.year}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {p.paid_date ? new Date(p.paid_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Pagado oportuno'}
                              {isExtra && ' · Incluye abono extra a capital'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-700 block">
                            {formatCurrency(Number(p.amount_paid), currency)}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase">
                            Al día
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 3: AYUDA (LINKS DE PAGO, WEB OFICIAL, VIDEOS Y DOCUMENTACIÓN) */}
          {activeTab === 'ayuda' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Acceso directo a Portales de Pago y Página Oficial */}
              {serviceInfo && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/60 border border-purple-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-600" />
                      Sitios Oficiales: {serviceInfo.providerName}
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold bg-white px-2 py-0.5 rounded-full border border-purple-200">
                      {serviceInfo.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serviceInfo.paymentPortal && (
                      <a
                        href={serviceInfo.paymentPortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200/80 transition-all text-xs font-bold text-emerald-800 shadow-2xs group"
                      >
                        <span className="flex items-center gap-2">
                          <PaymentIcon className="w-4 h-4 text-emerald-600" />
                          Portal de Pago en Línea
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}

                    <a
                      href={serviceInfo.officialSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200/80 transition-all text-xs font-bold text-[#2a2542] shadow-2xs group"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600" />
                        Sitio Web Oficial
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              )}

              {/* Enlaces y Documentos Útiles */}
              {serviceInfo && serviceInfo.helpLinks.filter(l => l.type !== 'video').length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#2a2542] uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    Documentación y Canales
                  </h4>
                  <div className="space-y-1.5">
                    {serviceInfo.helpLinks.filter(l => l.type !== 'video').map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition-all group shadow-2xs text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-[#2a2542] group-hover:text-purple-700 block truncate">
                            {link.title}
                          </span>
                          {link.description && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {link.description}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos y Tutoriales Oficiales */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                    <h4 className="text-xs font-extrabold text-[#2a2542] uppercase tracking-wider">
                      Tutoriales Paso a Paso
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Videos Verificados</span>
                </div>

                <div className="space-y-1.5">
                  {luloTutorials.map((tut, i) => (
                    <a
                      key={i}
                      href={tut.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/80 border border-slate-100 hover:border-purple-200 transition-all group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#2a2542] group-hover:text-purple-700 block truncate">
                            {tut.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{tut.channel}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Atención al cliente y canales oficiales */}
              <div className="p-3 rounded-2xl bg-slate-50 text-[10px] text-slate-500 space-y-1 border border-slate-100">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Soporte y Atención Oficial:</span>
                </div>
                <p>
                  Paga directamente a través de la App o sitio oficial por PSE para que el abono se refleje en tu extracto sin demoras.
                </p>
                <p className="text-[9px] text-slate-400">
                  En caso de inquietudes o cobros no reconocidos, recurre al Defensor del Consumidor Financiero o PQR oficial.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
