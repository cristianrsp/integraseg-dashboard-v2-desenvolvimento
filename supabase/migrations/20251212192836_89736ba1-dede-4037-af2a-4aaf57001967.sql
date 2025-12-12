-- Create vendedores table
CREATE TABLE public.vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resultados table
CREATE TABLE public.resultados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id UUID NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  oportunidades INTEGER NOT NULL DEFAULT 0,
  vendas INTEGER NOT NULL DEFAULT 0,
  tempo_medio_conversao NUMERIC NOT NULL DEFAULT 0,
  receita NUMERIC NOT NULL DEFAULT 0,
  origem_dos_dados TEXT NOT NULL DEFAULT 'manual',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required as per user specs)
CREATE POLICY "Public read access for vendedores" 
ON public.vendedores 
FOR SELECT 
USING (true);

CREATE POLICY "Public insert access for vendedores" 
ON public.vendedores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public update access for vendedores" 
ON public.vendedores 
FOR UPDATE 
USING (true);

CREATE POLICY "Public delete access for vendedores" 
ON public.vendedores 
FOR DELETE 
USING (true);

CREATE POLICY "Public read access for resultados" 
ON public.resultados 
FOR SELECT 
USING (true);

CREATE POLICY "Public insert access for resultados" 
ON public.resultados 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public update access for resultados" 
ON public.resultados 
FOR UPDATE 
USING (true);

CREATE POLICY "Public delete access for resultados" 
ON public.resultados 
FOR DELETE 
USING (true);