-- ==============================================================================
-- TABLA: SPACES (Lugares y Espacios del Usuario)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'home', -- 'home', 'store', 'building', 'briefcase', 'warehouse', 'map-pin'
  color TEXT NOT NULL DEFAULT '#7b52c9',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Agregar relación a obligations si no existe
ALTER TABLE public.obligations ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL;

-- Seguridad RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own spaces" ON public.spaces FOR ALL USING (auth.uid() = user_id);
