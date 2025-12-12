import { useState, useEffect, useCallback } from 'react';
import { Seller, SalesResult } from '@/types/sales';

const SELLERS_KEY = 'integraseg_sellers';
const RESULTS_KEY = 'integraseg_results';

export function useSalesData() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [results, setResults] = useState<SalesResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSellers = localStorage.getItem(SELLERS_KEY);
    const storedResults = localStorage.getItem(RESULTS_KEY);
    
    if (storedSellers) {
      setSellers(JSON.parse(storedSellers));
    }
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    setLoading(false);
  }, []);

  const saveSellers = useCallback((newSellers: Seller[]) => {
    localStorage.setItem(SELLERS_KEY, JSON.stringify(newSellers));
    setSellers(newSellers);
  }, []);

  const saveResults = useCallback((newResults: SalesResult[]) => {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(newResults));
    setResults(newResults);
  }, []);

  const addSeller = useCallback((name: string, email: string) => {
    const newSeller: Seller = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    saveSellers([...sellers, newSeller]);
    return newSeller;
  }, [sellers, saveSellers]);

  const deleteSeller = useCallback((id: string) => {
    saveSellers(sellers.filter(s => s.id !== id));
  }, [sellers, saveSellers]);

  const addResult = useCallback((result: Omit<SalesResult, 'id' | 'importedAt' | 'conversionRate'>) => {
    const conversionRate = result.opportunities > 0 
      ? (result.sales / result.opportunities) * 100 
      : 0;
    
    const newResult: SalesResult = {
      ...result,
      id: crypto.randomUUID(),
      conversionRate: Math.round(conversionRate * 100) / 100,
      importedAt: new Date().toISOString(),
    };
    saveResults([...results, newResult]);
    return newResult;
  }, [results, saveResults]);

  const updateResult = useCallback((id: string, updates: Partial<SalesResult>) => {
    const updatedResults = results.map(r => {
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
    });
    saveResults(updatedResults);
  }, [results, saveResults]);

  const deleteResult = useCallback((id: string) => {
    saveResults(results.filter(r => r.id !== id));
  }, [results, saveResults]);

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
  };
}
