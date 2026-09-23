GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendedores TO anon, authenticated;
GRANT ALL ON public.vendedores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resultados_vendas TO anon, authenticated;
GRANT ALL ON public.resultados_vendas TO service_role;