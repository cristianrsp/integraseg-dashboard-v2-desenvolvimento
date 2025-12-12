import { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  Clock,
  Download
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { ConversionChart } from '@/components/dashboard/ConversionChart';
import { TeamComparisonChart } from '@/components/dashboard/TeamComparisonChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Button } from '@/components/ui/button';
import { useSalesData } from '@/hooks/useSalesData';
import { DashboardFilters as Filters } from '@/types/sales';
import { exportToPDF } from '@/utils/exportUtils';

export default function Dashboard() {
  const { sellers, results, getFilteredResults, getAggregatedMetrics } = useSalesData();
  
  const [filters, setFilters] = useState<Filters>({
    sellerId: 'all',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const filteredResults = useMemo(() => {
    return getFilteredResults(filters.sellerId, filters.startDate, filters.endDate);
  }, [filters, getFilteredResults]);

  const metrics = useMemo(() => {
    return getAggregatedMetrics(filteredResults);
  }, [filteredResults, getAggregatedMetrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Chart data
  const performanceData = useMemo(() => {
    const sellerMap = new Map<string, { oportunidades: number; vendas: number }>();
    
    filteredResults.forEach(r => {
      const current = sellerMap.get(r.sellerName) || { oportunidades: 0, vendas: 0 };
      sellerMap.set(r.sellerName, {
        oportunidades: current.oportunidades + r.opportunities,
        vendas: current.vendas + r.sales,
      });
    });

    return Array.from(sellerMap.entries()).map(([name, data]) => ({
      name: name.split(' ')[0], // First name only for chart
      ...data,
    }));
  }, [filteredResults]);

  const conversionData = useMemo(() => {
    const monthMap = new Map<string, { total: number; count: number }>();
    
    filteredResults.forEach(r => {
      const date = new Date(r.startDate);
      const month = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const current = monthMap.get(month) || { total: 0, count: 0 };
      monthMap.set(month, {
        total: current.total + r.conversionRate,
        count: current.count + 1,
      });
    });

    return Array.from(monthMap.entries()).map(([period, data]) => ({
      period,
      taxa: Math.round((data.total / data.count) * 100) / 100,
    }));
  }, [filteredResults]);

  const teamData = useMemo(() => {
    return [
      { metric: 'Oportunidades', value: metrics.totalOpportunities, fullMark: Math.max(metrics.totalOpportunities * 1.5, 100) },
      { metric: 'Vendas', value: metrics.totalSales, fullMark: Math.max(metrics.totalSales * 1.5, 50) },
      { metric: 'Conversão %', value: metrics.conversionRate, fullMark: 100 },
      { metric: 'Tempo Médio', value: 30 - metrics.avgConversionTime, fullMark: 30 },
    ];
  }, [metrics]);

  const revenueData = useMemo(() => {
    const monthMap = new Map<string, number>();
    
    filteredResults.forEach(r => {
      const date = new Date(r.startDate);
      const month = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const current = monthMap.get(month) || 0;
      monthMap.set(month, current + r.revenue);
    });

    return Array.from(monthMap.entries()).map(([period, receita]) => ({
      period,
      receita,
    }));
  }, [filteredResults]);

  const handleExportPDF = () => {
    exportToPDF('dashboard-content', 'dashboard-integraseg');
  };

  return (
    <MainLayout>
      <div id="dashboard-content">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe os resultados da equipe de vendas
            </p>
          </div>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <DashboardFilters 
            sellers={sellers} 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
        </div>

        {/* Metric Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Total de Oportunidades"
            value={metrics.totalOpportunities.toLocaleString('pt-BR')}
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            title="Total de Vendas"
            value={metrics.totalSales.toLocaleString('pt-BR')}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${metrics.conversionRate}%`}
            icon={<Percent className="h-5 w-5" />}
          />
          <MetricCard
            title="Receita Gerada"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Tempo Médio"
            value={`${metrics.avgConversionTime} dias`}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart 
            data={performanceData} 
            title="Desempenho por Vendedor" 
          />
          <ConversionChart 
            data={conversionData} 
            title="Evolução da Taxa de Conversão" 
          />
          <RevenueChart 
            data={revenueData} 
            title="Evolução da Receita" 
          />
          <TeamComparisonChart 
            data={teamData} 
            title="Visão Geral da Equipe" 
          />
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum dado encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Importe resultados de vendas para visualizar as métricas do dashboard.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
