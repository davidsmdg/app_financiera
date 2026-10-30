import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('david930408.dd@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(
          error.message === 'Invalid login credentials'
            ? 'Credenciales no autorizadas para este entorno.'
            : error.message
        );
      } else if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-canvas flex flex-col justify-between p-6 safe-top safe-bottom relative overflow-hidden select-none">
      
      {/* Formas orgánicas de fondo suaves idénticas a los referentes */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7b52c9]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#06b6d4]/10 blur-2xl pointer-events-none" />

      {/* Header / Marca superior */}
      <header className="relative z-10 flex items-center justify-between pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-squircle-md bg-gradient-to-tr from-[#683cc7] via-[#7b52c9] to-[#9366eb] flex items-center justify-center text-white shadow-btn-primary">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#2a2542] tracking-tight leading-tight">
              FinanceFlow
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#9f9cb2] font-bold">
              Private Access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 text-xs font-semibold text-[#5e5977] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#7b52c9]" />
          <span className="text-[11px]">Entorno Seguro</span>
        </div>
      </header>

      {/* Tarjeta Central de Inicio de Sesión */}
      <main className="relative z-10 my-auto py-8 max-w-sm w-full mx-auto">
        
        {/* Tarjeta blanca flotante estilo Design System */}
        <div className="bg-white p-7 sm:p-8 rounded-squircle-xl shadow-card-float border border-slate-100 relative">
          
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-[#2a2542] tracking-tight mb-1">
              Bienvenido de nuevo
            </h2>
            <p className="text-xs text-[#9f9cb2] leading-relaxed">
              Ingresa tus credenciales autorizadas para acceder a tu plataforma financiera.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-squircle-sm bg-rose-50 border border-rose-100 text-xs text-rose-600 font-semibold text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Campo Correo Electrónico */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1.5 px-1">
                Correo Electrónico
              </label>
              <div className="flex items-center px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white rounded-squircle-md border border-slate-200/70 focus-within:border-[#7b52c9] focus-within:ring-2 focus-within:ring-[#7b52c9]/20 transition-all shadow-inner">
                <Mail className="w-4 h-4 text-[#9f9cb2] shrink-0 mr-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@dominio.com"
                  className="w-full bg-transparent text-xs text-[#2a2542] font-semibold outline-none"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9f9cb2] block mb-1.5 px-1">
                Contraseña
              </label>
              <div className="flex items-center px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white rounded-squircle-md border border-slate-200/70 focus-within:border-[#7b52c9] focus-within:ring-2 focus-within:ring-[#7b52c9]/20 transition-all shadow-inner">
                <Lock className="w-4 h-4 text-[#9f9cb2] shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-[#2a2542] font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9f9cb2] hover:text-[#2a2542] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Entrada (Estilo CHECKOUT del Referente 1) */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                className="shadow-btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Accediendo...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    INGRESAR A LA PLATAFORMA <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

          </form>

          {/* Nota informativa sin enlace de registro */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-[#9f9cb2]">
              Acceso restringido a cuentas pre-autorizadas.
            </p>
          </div>

        </div>

      </main>

      {/* Footer minimalista */}
      <footer className="relative z-10 text-center text-[10px] text-[#9f9cb2] font-semibold py-2">
        FinanceFlow PWA • Versión 1.0.0
      </footer>

    </div>
  );
};
