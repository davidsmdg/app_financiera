-- ==============================================================================
-- TABLAS DEL MÓDULO DE OBLIGACIONES FINANCIERAS
-- ==============================================================================

-- 1. Catálogo de Obligaciones Fijas del Usuario
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                          -- Ej: 'Arriendo', 'Luz / Energía', 'Tarjeta Visa'
  category TEXT NOT NULL,                       -- 'Servicios', 'Crédito', 'Vivienda', 'Suscripción'
  amount NUMERIC(12, 2) NOT NULL,               -- Monto estimado o fijo
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- Día del mes que vence
  frequency TEXT NOT NULL DEFAULT 'monthly',    -- 'monthly', 'biweekly', 'annual'
  reminder_days_before INTEGER DEFAULT 3,       -- Días de anticipación para avisar
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- De qué cuenta se debita
  color TEXT DEFAULT '#7b52c9',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Historial de Pagos de Obligaciones Mes a Mes
CREATE TABLE IF NOT EXISTS public.obligation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_id UUID NOT NULL REFERENCES public.obligations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  paid_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'skipped', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(obligation_id, month, year)
);

-- Seguridad RLS
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligation_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own obligations" ON public.obligations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own obligation payments" ON public.obligation_payments FOR ALL USING (auth.uid() = user_id);
