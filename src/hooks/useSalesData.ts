import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Seller, SalesRecord } from '@/types/sales';

export function useSalesData() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
      return;
    }

    setSellers((data || []).map(v => ({
      id: v.id,
      name: v.nome,
      createdAt: v.criado_em,
    })));
  }, []);

  const fetchRecords = useCallback(async () => {
    const { data, error } = await supabase
      .from('resultados_vendas')
      .select(`*, vendedores (nome)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error);
      return;
    }

    setRecords((data || []).map(r => ({
      id: r.id,
      sellerId: r.vendedor_id,
      sellerName: (r.vendedores as any)?.nome || 'Desconhecido',
      dataResultado: r.data_resultado,
      tipoLead: r.tipo_lead as 'interno' | 'externo',
      oportunidades: r.oportunidades != null ? Number(r.oportunidades) : null,
      vendas: Number(r.vendas) || 0,
      receita: Number(r.receita) || 0,
      tempoMedio: r.tempo_medio != null ? Number(r.tempo_medio) : null,
      createdAt: r.created_at,
    })));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSellers(), fetchRecords()]);
      setLoading(false);
    };
    load();
  }, [fetchSellers, fetchRecords]);

  const addSeller = useCallback(async (name: string) => {
    const { data, error } = await supabase
      .from('vendedores')
      .insert({ nome: name })
      .select()
      .single();

    if (error) throw error;

    const newSeller: Seller = { id: data.id, name: data.nome, createdAt: data.criado_em };
    setSellers(prev => [newSeller, ...prev]);
    return newSeller;
  }, []);

  const deleteSeller = useCallback(async (id: string) => {
    const { error } = await supabase.from('vendedores').delete().eq('id', id);
    if (error) throw error;
    setSellers(prev => prev.filter(s => s.id !== id));
  }, []);

  const addRecord = useCallback(async (record: Omit<SalesRecord, 'id' | 'createdAt' | 'sellerName'>) => {
    const { data, error } = await supabase
      .from('resultados_vendas')
      .insert({
        vendedor_id: record.sellerId,
        data_resultado: record.dataResultado,
        tipo_lead: record.tipoLead,
        oportunidades: record.oportunidades,
        vendas: record.vendas,
        receita: record.receita,
        tempo_medio: record.tempoMedio,
      })
      .select(`*, vendedores (nome)`)
      .single();

    if (error) throw error;

    const newRecord: SalesRecord = {
      id: data.id,
      sellerId: data.vendedor_id,
      sellerName: (data.vendedores as any)?.nome || 'Desconhecido',
      dataResultado: data.data_resultado,
      tipoLead: data.tipo_lead as 'interno' | 'externo',
      oportunidades: data.oportunidades != null ? Number(data.oportunidades) : null,
      vendas: Number(data.vendas) || 0,
      receita: Number(data.receita) || 0,
      tempoMedio: data.tempo_medio != null ? Number(data.tempo_medio) : null,
      createdAt: data.created_at,
    };

    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    const { error } = await supabase.from('resultados_vendas').delete().eq('id', id);
    if (error) throw error;
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateRecord = useCallback(async (id: string, updates: Partial<Pick<SalesRecord, 'vendas' | 'receita' | 'oportunidades' | 'tempoMedio'>>) => {
    const updateData: {
      vendas?: number;
      receita?: number;
      oportunidades?: number | null;
      tempo_medio?: number | null;
    } = {};
    if (updates.vendas !== undefined) updateData.vendas = updates.vendas;
    if (updates.receita !== undefined) updateData.receita = updates.receita;
    if (updates.oportunidades !== undefined) updateData.oportunidades = updates.oportunidades;
    if (updates.tempoMedio !== undefined) updateData.tempo_medio = updates.tempoMedio;

    const { error } = await supabase.from('resultados_vendas').update(updateData).eq('id', id);
    if (error) throw error;

    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const getFilteredRecords = useCallback((sellerId: string | 'all', startDate: string, endDate: string) => {
    return records.filter(r => {
      const matchesSeller = sellerId === 'all' || r.sellerId === sellerId;
      const matchesDate = r.dataResultado >= startDate && r.dataResultado <= endDate;
      return matchesSeller && matchesDate;
    });
  }, [records]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchSellers(), fetchRecords()]);
  }, [fetchSellers, fetchRecords]);

  return {
    sellers,
    records,
    loading,
    addSeller,
    deleteSeller,
    addRecord,
    deleteRecord,
    updateRecord,
    getFilteredRecords,
    refreshData,
  };
}
