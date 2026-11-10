import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  Bell, 
  Loader2, 
  Search, 
  Smartphone, 
  Tv, 
  Home, 
  Train, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Building, 
  Layers, 
  ChevronRight, 
  PlusCircle, 
  CheckCircle2,
  Zap,
  PiggyBank
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatThousands, parseThousands, formatCurrency } from '../../lib/utils';
import { calculateEnelDiagnostics } from '../../lib/energyDiagnostics';
import { calculateMonthlyInstallment } from '../../lib/loanCalculator';
import { 
  POPULAR_COMPANIES, 
  CATEGORIES_CONFIG, 
  type CompanyPreset 
} from '../../data/companyPresets';
import { type Space } from '../../data/spaces';
import { renderSpaceIcon } from '../spaces/ManageSpacesModal';

export interface AddObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces?: Space[];
  selectedSpaceId?: string | null;
  onSubmit: (data: {
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
  }) => Promise<void>;
}

export const AddObligationModal: React.FC<AddObligationModalProps> = ({
  isOpen,
  onClose,
  spaces = [],
  selectedSpaceId = null,
  onSubmit,
}) => {
  // Step 1: Explorar / Seleccionar Servicio, Step 2: Configurar y Confirmar
  const [step, setStep] = useState<'catalog' | 'configure'>('catalog');
  
  // Categoría seleccionada en el catálogo
  const [activeCategory, setActiveCategory] = useState<string>('Servicios');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Datos del formulario
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [amount, setAmount] = useState('');
  
  // Fecha exacta con calendario
  const [targetDate, setTargetDate] = useState<string>(() => {
    const today = new Date();
    // Sugerir por defecto en 5 días
    const next = new Date(today);
    next.setDate(today.getDate() + 5);
    return next.toISOString().split('T')[0];
  });
  
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'annual'>('monthly');
  const [reminderDays, setReminderDays] = useState('3');
  
  const [assignedSpaceName, setAssignedSpaceName] = useState<string>(() => {
    if (selectedSpaceId && spaces.length > 0) {
      const match = spaces.find(s => s.id === selectedSpaceId);
      if (match) return match.name;
    }
    // Si no tiene un lugar seleccionado, el valor por defecto es "Yo"
    return 'Yo';
  });
  const [selectedLogo, setSelectedLogo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Estados dedicados para Créditos y Préstamos
  const [isDebtMode, setIsDebtMode] = useState(false);
  const [totalLoanAmount, setTotalLoanAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState<number | ''>('');
  const [paidInstallments, setPaidInstallments] = useState(0);
  const [monthlyRate, setMonthlyRate] = useState(3.85);
  const [annualRate, setAnnualRate] = useState(57.38);
  const [insuranceFee, setInsuranceFee] = useState(2000);
  const [loanNumber, setLoanNumber] = useState('');

  // Iconos por categoría
  const getCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className={className} />;
      case 'Tv': return <Tv className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Train': return <Train className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Building': return <Building className={className} />;
      case 'PiggyBank': return <PiggyBank className={className} />;
      default: return <Layers className={className} />;
    }
  };

  // Filtrado de servicios populares según búsqueda y categoría activa (soporta múltiples categorías por servicio)
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      return POPULAR_COMPANIES.filter(
        c => c.name.toLowerCase().includes(q) || 
             c.description.toLowerCase().includes(q) ||
             c.subCategory.toLowerCase().includes(q) ||
             c.category.toLowerCase().includes(q) ||
             (c.categories && c.categories.some(cat => cat.toLowerCase().includes(q)))
      );
    }
    return POPULAR_COMPANIES.filter(
      c => c.category === activeCategory || (c.categories && c.categories.includes(activeCategory))
    );
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  // Calcular fecha sugerida cuando una empresa tiene defaultDay
  const computeNextDateForDay = (day: number) => {
    const today = new Date();
    let y = today.getFullYear();
    let m = today.getMonth(); // 0-indexed
    
    // Si el día ya pasó este mes, pasar al siguiente mes
    if (today.getDate() >= day) {
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
    const dStr = String(day).padStart(2, '0');
    const mStr = String(m + 1).padStart(2, '0');
    return `${y}-${mStr}-${dStr}`;
  };

  const handleSelectPreset = (company: CompanyPreset) => {
    setTitle(company.name);
    setCategory(company.category);
    if (company.defaultDay) {
      setTargetDate(computeNextDateForDay(company.defaultDay));
    }
    
    // Si es crédito o tarjeta
    const isDebt = company.category === 'Crédito & Tarjetas' || company.name.toLowerCase().includes('crédito') || company.name.toLowerCase().includes('nequi');
    setIsDebtMode(isDebt);

    if (isDebt) {
      setTotalLoanAmount('');
      setTotalInstallments('');
      setPaidInstallments(0);
      setAmount('');

      if (company.id.includes('nequi')) {
        setMonthlyRate(3.85);
        setAnnualRate(57.38);
        setInsuranceFee(2000);
      } else if (company.id.includes('lulo')) {
        setMonthlyRate(1.88);
        setAnnualRate(25.05);
        setInsuranceFee(5871);
      } else {
        setMonthlyRate(2.2);
        setAnnualRate(29.8);
        setInsuranceFee(3000);
      }
    } else {
      if (company.suggestedAmount) setAmount(formatThousands(company.suggestedAmount));
      else setAmount('');
    }

    setSelectedLogo(company.logoUrl);
    setStep('configure');
  };

  const handleStartCustom = (catName?: string) => {
    const defaultCat = catName || activeCategory || 'Servicios';
    setTitle('');
    setCategory(defaultCat);
    setAmount('');
    setTargetDate(computeNextDateForDay(5));
    setSelectedLogo(undefined);
    setIsDebtMode(defaultCat === 'Crédito & Tarjetas');
    setStep('configure');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousands(amount);
    if (!title || !parsedAmount || !targetDate) return;

    // Extraer día del mes (1 - 31) desde targetDate (YYYY-MM-DD)
    const selectedDay = parseInt(targetDate.split('-')[2], 10);

    // Concatenar el lugar para guardarlo de manera transparente y compatible
    const finalTitle = assignedSpaceName 
      ? `${title.trim()} [${assignedSpaceName}]`
      : title.trim();

    setLoading(true);
    try {
      const parsedTotalDebt = parseThousands(totalLoanAmount);
      await onSubmit({
        title: finalTitle,
        category,
        amount: parsedAmount,
        due_day: selectedDay,
        frequency,
        reminder_days_before: parseInt(reminderDays, 10),
        obligation_type: isDebtMode ? 'debt' : 'recurring',
        total_debt_amount: isDebtMode ? parsedTotalDebt : undefined,
        current_balance: isDebtMode ? parsedTotalDebt : undefined,
        total_installments: isDebtMode && typeof totalInstallments === 'number' ? totalInstallments : undefined,
        paid_installments: isDebtMode ? paidInstallments : undefined,
        monthly_rate: isDebtMode ? monthlyRate : undefined,
        annual_rate: isDebtMode ? annualRate : undefined,
        insurance_fee: isDebtMode ? insuranceFee : undefined,
        loan_number: isDebtMode && loanNumber ? loanNumber.trim() : undefined,
        lender_name: isDebtMode ? title.trim() : undefined,
      });
      // Limpiar y resetear vista
      setTitle('');
      setAmount('');
      setIsDebtMode(false);
      setStep('catalog');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden select-none">
        
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button
                onClick={() => setStep('catalog')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
                title="Volver a la selección de servicios"
              >
                ←
              </button>
            )}
            <div>
              <h3 className="text-base font-extrabold text-[#2a2542]">
                {step === 'catalog' ? 'Selecciona o Agrega Servicio' : 'Configurar Pago'}
              </h3>
              <p className="text-[11px] text-[#9f9cb2]">
                {step === 'catalog' ? 'Elige una entidad o agrega un pago personalizado' : `Define la fecha y monto para ${title || 'tu obligación'}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStep('catalog');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido según el paso */}
        {step === 'catalog' ? (
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4">
            
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar servicio (EPM, Netflix, Claro, Nu, Bancolombia...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 focus:border-[#7b52c9] text-xs font-semibold outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de Categorías Horizontal */}
            {!searchQuery && (
              <div>
                <p className="text-[10px] font-bold text-[#9f9cb2] uppercase tracking-wider mb-2">Explora categorías</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {CATEGORIES_CONFIG.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#7b52c9]/10 border-[#7b52c9] text-[#7b52c9] shadow-sm font-bold'
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl ${isActive ? 'bg-[#7b52c9] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                        </div>
                        <span className="text-[9px] mt-1.5 text-center leading-tight line-clamp-1">
                          {cat.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de Empresas / Servicios */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2a2542]">
                  {searchQuery ? `Resultados (${filteredCompanies.length})` : activeCategory}
                </span>

                {/* Opción personalizada */}
                <button
                  onClick={() => handleStartCustom(activeCategory)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#7b52c9] hover:text-[#5a369e] py-1 px-2.5 rounded-full bg-[#7b52c9]/10 hover:bg-[#7b52c9]/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Personalizado</span>
                </button>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-3">No encontramos ese servicio registrado en la lista.</p>
                  <button
                    onClick={() => {
                      setTitle(searchQuery);
                      handleStartCustom();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7b52c9] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#6841b5] transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Crear "{searchQuery}" como personalizado</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => handleSelectPreset(comp)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-[#7b52c9]/40 bg-white hover:bg-slate-50/80 transition-all cursor-pointer shadow-sm group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {comp.logoUrl ? (
                            <img
                              src={comp.logoUrl}
                              alt={comp.name}
                              className="w-full h-full object-contain"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                (e.target as HTMLElement).parentElement!.innerText = comp.name.substring(0, 2).toUpperCase();
                              }}
                            />
                          ) : (
                            <span className="font-bold text-xs text-[#7b52c9]">
                              {comp.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#2a2542] truncate group-hover:text-[#7b52c9]">
                            {comp.name}
                          </h4>
                          <p className="text-[10px] text-[#9f9cb2] truncate">{comp.subCategory}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7b52c9] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* PASO 2: FORMULARIO DETALLADO Y REFERENCIA DE PAGO */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Banner del servicio seleccionado */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shadow-xs shrink-0">
                {selectedLogo ? (
                  <img
                    src={selectedLogo}
                    alt={title}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      (e.target as HTMLElement).parentElement!.innerText = (title || 'OP').substring(0, 2).toUpperCase();
                    }}
                  />
                ) : (
                  <span className="font-extrabold text-sm text-[#7b52c9]">
                    {(title || 'OP').substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#7b52c9] bg-[#7b52c9]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                  {category}
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nombre de la obligación"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-bold text-sm text-[#2a2542] bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-[#7b52c9]"
                />
              </div>
            </div>

            {/* Asignar a Lugar o Espacio (Por defecto: Yo) */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block">
                  Asociado a (Lugar o Personal)
                </label>
                {assignedSpaceName !== 'Yo' && (
                  <button
                    type="button"
                    onClick={() => setAssignedSpaceName('Yo')}
                    className="text-[10px] text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
                  >
                    Restablecer a Yo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Opción 'Yo' por defecto */}
                <button
                  type="button"
                  onClick={() => setAssignedSpaceName('Yo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                    assignedSpaceName === 'Yo' || !assignedSpaceName
                      ? 'bg-[#7b52c9] text-white border-[#7b52c9] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                  <span>👤 Yo (Personal)</span>
                </button>

                {spaces.map((sp) => {
                  const isSelected = assignedSpaceName === sp.name;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setAssignedSpaceName(isSelected ? 'Yo' : sp.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#7b52c9] text-white border-[#7b52c9] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : sp.color }}
                      >
                        {renderSpaceIcon(sp.icon, "w-2.5 h-2.5")}
                      </div>
                      <span>{sp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnóstico Automático Inteligente para ENEL / Energía */}
            {title.toLowerCase().includes('enel') && parseThousands(amount) > 0 && (() => {
              const parsedVal = parseThousands(amount);
              const matchedSpace = spaces.find(s => s.name === assignedSpaceName);
              const occ = matchedSpace?.occupants || 1;
              const diag = calculateEnelDiagnostics(parsedVal, occ);

              return (
                <div className="p-3.5 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 rounded-2xl border border-blue-200/90 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Cálculo Automático de Consumo
                    </span>
                    <span className="text-[9px] bg-blue-100/90 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      Enel • {occ} {occ === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>

                  {/* Resumen estimado */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Consumo Deducido</span>
                      <span className="text-xs font-black text-blue-700">~{diag.estimatedKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Energía</span>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(diag.estimatedEnergyAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Aseo (LIME/Otros)</span>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(diag.estimatedAseoAmount)}</span>
                    </div>
                  </div>

                  {/* Diagnóstico de consumo */}
                  <div className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs font-semibold ${diag.badgeColor}`}>
                    <span className="text-base shrink-0">{diag.statusEmoji}</span>
                    <div className="leading-snug">
                      <strong>{diag.tierLabel}:</strong> {diag.explanation}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN ESPECIAL PARA CRÉDITOS Y TARJETAS */}
            {(isDebtMode || category === 'Crédito & Tarjetas') && (
              <div className="p-4 bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-indigo-50/80 rounded-2xl border border-purple-200/90 space-y-3.5 animate-fade-in shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7b52c9] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#7b52c9]" />
                    Detalles del Crédito / Préstamo
                  </span>
                  <span className="text-[9px] bg-purple-100 text-[#7b52c9] px-2.5 py-0.5 rounded-full font-bold">
                    Amortización Automática
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                      Capital Prestado / Saldo Actual
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="Ej: 500.000"
                        value={totalLoanAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTotalLoanAmount(formatThousands(val));
                          const p = parseThousands(val);
                          const inst = typeof totalInstallments === 'number' ? totalInstallments : 12;
                          const calc = calculateMonthlyInstallment(p, monthlyRate, inst, insuranceFee);
                          setAmount(formatThousands(calc.totalInstallment));
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-purple-200 font-extrabold text-xs text-[#2a2542] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                      Número de Cuotas
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Ej: 12"
                        value={totalInstallments}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setTotalInstallments('');
                            return;
                          }
                          const inst = parseInt(val, 10);
                          setTotalInstallments(inst);
                          const p = parseThousands(totalLoanAmount);
                          const calc = calculateMonthlyInstallment(p, monthlyRate, inst, insuranceFee);
                          setAmount(formatThousands(calc.totalInstallment));
                        }}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 font-extrabold text-xs text-[#2a2542] outline-none"
                      />
                      <span className="text-xs text-slate-400 font-bold shrink-0">cuotas</span>
                    </div>
                  </div>
                </div>

                {/* Tasas y Seguros (Configurados por defecto con el valor de Nequi / Bancolombia) */}
                <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-purple-100 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Tasa Mes V.</span>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <input
                        type="number"
                        step="0.01"
                        value={monthlyRate}
                        onChange={(e) => {
                          const r = parseFloat(e.target.value) || 0;
                          setMonthlyRate(r);
                          const p = parseThousands(totalLoanAmount);
                          const inst = typeof totalInstallments === 'number' ? totalInstallments : 12;
                          const calc = calculateMonthlyInstallment(p, r, inst, insuranceFee);
                          setAmount(formatThousands(calc.totalInstallment));
                        }}
                        className="w-12 text-center font-black text-xs text-[#7b52c9] border-b border-dashed border-purple-300 outline-none"
                      />
                      <span className="text-[10px] font-bold text-[#7b52c9]">%</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Tasa E.A.</span>
                    <span className="text-xs font-black text-slate-700 block mt-1">{annualRate}%</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Seguro Vida</span>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400">$</span>
                      <input
                        type="text"
                        value={formatThousands(insuranceFee)}
                        onChange={(e) => {
                          const fee = parseThousands(e.target.value);
                          setInsuranceFee(fee);
                          const p = parseThousands(totalLoanAmount);
                          const inst = typeof totalInstallments === 'number' ? totalInstallments : 12;
                          const calc = calculateMonthlyInstallment(p, monthlyRate, inst, fee);
                          setAmount(formatThousands(calc.totalInstallment));
                        }}
                        className="w-14 text-center font-black text-xs text-slate-700 border-b border-dashed border-slate-300 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-purple-100/60 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-900">Cuota mensual calculada:</span>
                  <span className="font-black text-[#7b52c9] text-sm">
                    {formatCurrency(calculateMonthlyInstallment(parseThousands(totalLoanAmount), monthlyRate, typeof totalInstallments === 'number' ? totalInstallments : 12, insuranceFee).totalInstallment)}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Número de crédito o referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 87301706909"
                    value={loanNumber}
                    onChange={(e) => setLoanNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 font-semibold text-xs text-[#2a2542] outline-none"
                  />
                </div>

              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORIES_CONFIG.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Frecuencia
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold outline-none appearance-none cursor-pointer"
                >
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>

            {/* Monto y Fecha Límite de Pago con Calendario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Monto Estimado ($ COP)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Ej: 85.000"
                    value={amount}
                    onChange={(e) => setAmount(formatThousands(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#7b52c9] text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                  Fecha Próxima de Pago
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#7b52c9] text-xs font-bold outline-none cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-purple-600 font-semibold block mt-1">
                  {(() => {
                    if (!targetDate) return '';
                    const [y, m, d] = targetDate.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
                    return `Vence el ${d} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Recordatorio */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1">
                Recordatorio inteligente
              </label>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#7b52c9] shrink-0" />
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="1">1 día antes del vencimiento</option>
                  <option value="3">3 días antes (Recomendado)</option>
                  <option value="5">5 días antes</option>
                  <option value="7">1 semana antes</option>
                </select>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                className="shadow-btn-primary rounded-xl py-3 font-bold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> GUARDAR OBLIGACIÓN
                  </span>
                )}
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
