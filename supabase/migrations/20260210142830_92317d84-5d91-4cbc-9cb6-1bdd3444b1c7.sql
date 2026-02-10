
-- Create new resultados_vendas table
CREATE TABLE public.resultados_vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id UUID NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  data_resultado DATE NOT NULL,
  tipo_lead TEXT NOT NULL CHECK (tipo_lead IN ('interno', 'externo')),
  oportunidades NUMERIC,
  vendas NUMERIC NOT NULL DEFAULT 0,
  receita NUMERIC NOT NULL DEFAULT 0,
  tempo_medio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resultados_vendas ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Public read access for resultados_vendas"
  ON public.resultados_vendas FOR SELECT USING (true);

CREATE POLICY "Public insert access for resultados_vendas"
  ON public.resultados_vendas FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access for resultados_vendas"
  ON public.resultados_vendas FOR UPDATE USING (true);

CREATE POLICY "Public delete access for resultados_vendas"
  ON public.resultados_vendas FOR DELETE USING (true);

-- Drop email column from vendedores (not needed)
ALTER TABLE public.vendedores DROP COLUMN IF EXISTS email;

-- Drop old resultados table (replaced by resultados_vendas)
DROP TABLE IF EXISTS public.resultados;
