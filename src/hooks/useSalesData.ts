import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Seller, SalesResult } from '@/types/sales';

export function useSalesData() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [results, setResults] = useState<SalesResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sellers from Supabase
  const fetchSellers = useCallback(async () => {
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
      return;
    }

    const mappedSellers: Seller[] = (data || []).map(v => ({
      id: v.id,
      name: v.nome,
      email: v.email || '',
      createdAt: v.criado_em,
    }));

    setSellers(mappedSellers);
  }, []);

  // Fetch results from Supabase
  const fetchResults = useCallback(async () => {
    const { data, error } = await supabase
      .from('resultados')
      .select(`
        *,
        vendedores (
          nome
        )
      `)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      return;
    }

    const mappedResults: SalesResult[] = (data || []).map(r => {
      const opportunities = r.oportunidades || 0;
      const sales = r.vendas || 0;
      const conversionRate = opportunities > 0 
        ? Math.round((sales / opportunities) * 100 * 100) / 100 
        : 0;

      return {
        id: r.id,
        sellerId: r.vendedor_id,
        sellerName: r.vendedores?.nome || 'Desconhecido',
        startDate: r.periodo_inicio,
        endDate: r.periodo_fim,
        opportunities,
        sales,
        conversionRate,
        averageConversionTime: Number(r.tempo_medio_conversao) || 0,
        revenue: Number(r.receita) || 0,
        importedAt: r.criado_em,
        dataSource: (r.origem_dos_dados === 'csv' ? 'csv' : 'manual') as 'csv' | 'manual',
      };
    });

    setResults(mappedResults);
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSellers(), fetchResults()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSellers, fetchResults]);

  const addSeller = useCallback(async (name: string, email: string) => {
    const { data, error } = await supabase
      .from('vendedores')
      .insert({
        nome: name,
        email: email || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding seller:', error);
      throw error;
    }

    const newSeller: Seller = {
      id: data.id,
      name: data.nome,
      email: data.email || '',
      createdAt: data.criado_em,
    };

    setSellers(prev => [newSeller, ...prev]);
    return newSeller;
  }, []);

  const deleteSeller = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seller:', error);
      throw error;
    }

    setSellers(prev => prev.filter(s => s.id !== id));
  }, []);

  const addResult = useCallback(async (result: Omit<SalesResult, 'id' | 'importedAt' | 'conversionRate'>) => {
    const { data, error } = await supabase
      .from('resultados')
      .insert({
        vendedor_id: result.sellerId,
        periodo_inicio: result.startDate,
        periodo_fim: result.endDate,
        oportunidades: result.opportunities,
        vendas: result.sales,
        tempo_medio_conversao: result.averageConversionTime,
        receita: result.revenue,
        origem_dos_dados: result.dataSource || 'manual',
      })
      .select(`
        *,
        vendedores (
          nome
        )
      `)
      .single();

    if (error) {
      console.error('Error adding result:', error);
      throw error;
    }

    const opportunities = data.oportunidades || 0;
    const sales = data.vendas || 0;
    const conversionRate = opportunities > 0 
      ? Math.round((sales / opportunities) * 100 * 100) / 100 
      : 0;

    const newResult: SalesResult = {
      id: data.id,
      sellerId: data.vendedor_id,
      sellerName: data.vendedores?.nome || 'Desconhecido',
      startDate: data.periodo_inicio,
      endDate: data.periodo_fim,
      opportunities,
      sales,
      conversionRate,
      averageConversionTime: Number(data.tempo_medio_conversao) || 0,
      revenue: Number(data.receita) || 0,
      importedAt: data.criado_em,
      dataSource: (data.origem_dos_dados === 'csv' ? 'csv' : 'manual') as 'csv' | 'manual',
    };

    setResults(prev => [newResult, ...prev]);
    return newResult;
  }, []);

  const updateResult = useCallback(async (id: string, updates: Partial<SalesResult>) => {
    const updateData: Record<string, unknown> = {};
    
    if (updates.opportunities !== undefined) updateData.oportunidades = updates.opportunities;
    if (updates.sales !== undefined) updateData.vendas = updates.sales;
    if (updates.averageConversionTime !== undefined) updateData.tempo_medio_conversao = updates.averageConversionTime;
    if (updates.revenue !== undefined) updateData.receita = updates.revenue;

    const { error } = await supabase
      .from('resultados')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating result:', error);
      throw error;
    }

    setResults(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        if (updates.opportunities !== undefined || updates.sales !== undefined) {
          updated.conversionRate = updated.opportunities > 0 
            ? Math.round((updated.sales / updated.opportunities) * 100 * 100) / 100
            : 0;
        }
        return updated;
      }
      return r;
    }));
  }, []);

  const deleteResult = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('resultados')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting result:', error);
      throw error;
    }

    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const getFilteredResults = useCallback((sellerId: string | 'all', startDate: string, endDate: string) => {
    return results.filter(r => {
      const matchesSeller = sellerId === 'all' || r.sellerId === sellerId;
      const matchesDate = r.startDate >= startDate && r.endDate <= endDate;
      return matchesSeller && matchesDate;
    });
  }, [results]);

  const getAggregatedMetrics = useCallback((filteredResults: SalesResult[]) => {
    if (filteredResults.length === 0) {
      return {
        totalOpportunities: 0,
        totalSales: 0,
        conversionRate: 0,
        totalRevenue: 0,
        avgConversionTime: 0,
      };
    }

    const totalOpportunities = filteredResults.reduce((sum, r) => sum + r.opportunities, 0);
    const totalSales = filteredResults.reduce((sum, r) => sum + r.sales, 0);
    const totalRevenue = filteredResults.reduce((sum, r) => sum + r.revenue, 0);
    const avgConversionTime = filteredResults.reduce((sum, r) => sum + r.averageConversionTime, 0) / filteredResults.length;

    return {
      totalOpportunities,
      totalSales,
      conversionRate: totalOpportunities > 0 ? Math.round((totalSales / totalOpportunities) * 100 * 100) / 100 : 0,
      totalRevenue,
      avgConversionTime: Math.round(avgConversionTime * 10) / 10,
    };
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchSellers(), fetchResults()]);
  }, [fetchSellers, fetchResults]);

  return {
    sellers,
    results,
    loading,
    addSeller,
    deleteSeller,
    addResult,
    updateResult,
    deleteResult,
    getFilteredResults,
    getAggregatedMetrics,
    refreshData,
  };
}
