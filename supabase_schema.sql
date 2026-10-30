-- ==============================================================================
-- ESQUEMA INICIAL DE BASE DE DATOS: APP FINANCIERA (FINANCEFLOW)
-- Tablas: profiles, accounts, categories, transactions, savings_goals
-- Incluye: RLS (Row Level Security), triggers de saldo y auditoría
-- ==============================================================================

-- 1. TABLA: PROFILES (Perfiles de usuario vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: ACCOUNTS (Billeteras, Cuentas bancarias, Tarjetas, Cuentas Earn)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                           -- Ej: 'Cuenta Corriente', 'Tarjeta Débito', 'Cuenta Earn'
  type TEXT NOT NULL DEFAULT 'checking',        -- 'checking', 'savings', 'credit', 'yield_earn'
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  color TEXT DEFAULT '#7b52c9',
  apy_percentage NUMERIC(5, 2) DEFAULT 0.00,    -- Para cuentas tipo Rand Earn
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CATEGORIES (Categorías de gasto / ingreso con color e icono)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL si es del sistema global
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL,                           -- Ej: 'shopping-bag', 'briefcase', 'coffee'
  color TEXT NOT NULL DEFAULT '#7b52c9',        -- Código de color o token
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: TRANSACTIONS (Movimientos financieros: ingresos, egresos, transferencias)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: SAVINGS_GOALS (Alcancías inteligentes y metas de ahorro)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                           -- Ej: 'Fondo de Emergencia', 'Bici nueva'
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  deadline_date DATE,
  illustration TEXT DEFAULT '🎯',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS): Cada usuario solo accede a sus propios registros
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Políticas Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas Accounts
CREATE POLICY "Users can access own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- Políticas Categories
CREATE POLICY "Users can access own and system categories" ON public.categories FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

-- Políticas Transactions
CREATE POLICY "Users can access own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Políticas Savings Goals
CREATE POLICY "Users can access own goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: Crear perfil al registrarse nuevo usuario en Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_pro, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    true,
    'USD'
  );

  -- Crear cuenta corriente inicial por defecto
  INSERT INTO public.accounts (user_id, name, type, balance, currency)
  VALUES (NEW.id, 'Cuenta Principal', 'checking', 0.00, 'USD');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
