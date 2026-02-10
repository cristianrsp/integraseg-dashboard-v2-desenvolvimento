import { useState, useMemo } from 'react';
import { Target, TrendingUp, Percent, DollarSign, Clock, Download, Loader2, Trophy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ConversionChart } from '@/components/dashboard/ConversionChart';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesData } from '@/hooks/useSalesData';
import { DashboardFilters as Filters, SalesRecord } from '@/types/sales';
import { exportToPDF } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function Dashboard() {
  const { sellers, loading, getFilteredRecords } = useSalesData();

  const [filters, setFilters] = useState<Filters>({
    sellerId: 'all',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [rankingType, setRankingType] = useState<'externa' | 'interna' | 'total'>('total');

  const filteredRecords = useMemo(() => {
    return getFilteredRecords(filters.sellerId, filters.startDate, filters.endDate);
  }, [filters, getFilteredRecords]);

  const externos = useMemo(() => filteredRecords.filter(r => r.tipoLead === 'externo'), [filteredRecords]);
  const internos = useMemo(() => filteredRecords.filter(r => r.tipoLead === 'interno'), [filteredRecords]);

  // External metrics
  const extMetrics = useMemo(() => {
    const totalOp = externos.reduce((s, r) => s + (r.oportunidades || 0), 0);
    const totalVendas = externos.reduce((s, r) => s + r.vendas, 0);
    const totalReceita = externos.reduce((s, r) => s + r.receita, 0);
    const tempoArr = externos.filter(r => r.tempoMedio != null);
    const avgTempo = tempoArr.length > 0 ? tempoArr.reduce((s, r) => s + (r.tempoMedio || 0), 0) / tempoArr.length : 0;
    return {
      totalOp,
      totalVendas,
      conversionRate: totalOp > 0 ? Math.round((totalVendas / totalOp) * 100 * 100) / 100 : 0,
      totalReceita,
      avgTempo: Math.round(avgTempo * 10) / 10,
    };
  }, [externos]);

  // Internal metrics
  const intMetrics = useMemo(() => {
    const totalVendas = internos.reduce((s, r) => s + r.vendas, 0);
    const totalReceita = internos.reduce((s, r) => s + r.receita, 0);
    return { totalVendas, totalReceita };
  }, [internos]);

  // Daily revenue chart data - external
  const extRevenueData = useMemo(() => {
    return buildDailyData(externos, 'receita');
  }, [externos]);

  // Daily conversion chart data - external
  const extConversionData = useMemo(() => {
    const dayMap = new Map<string, { op: number; vendas: number }>();
    externos.forEach(r => {
      const cur = dayMap.get(r.dataResultado) || { op: 0, vendas: 0 };
      dayMap.set(r.dataResultado, { op: cur.op + (r.oportunidades || 0), vendas: cur.vendas + r.vendas });
    });
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        period: formatDateShort(date),
        taxa: d.op > 0 ? Math.round((d.vendas / d.op) * 100 * 100) / 100 : 0,
      }));
  }, [externos]);

  // Daily revenue chart data - internal
  const intRevenueData = useMemo(() => {
    return buildDailyData(internos, 'receita');
  }, [internos]);

  // Comparative chart data
  const comparativeData = useMemo(() => {
    const allDates = new Set<string>();
    filteredRecords.forEach(r => allDates.add(r.dataResultado));
    const sorted = Array.from(allDates).sort();
    return sorted.map(date => {
      const extR = externos.filter(r => r.dataResultado === date).reduce((s, r) => s + r.receita, 0);
      const intR = internos.filter(r => r.dataResultado === date).reduce((s, r) => s + r.receita, 0);
      return { period: formatDateShort(date), externa: extR, interna: intR };
    });
  }, [filteredRecords, externos, internos]);

  // Ranking
  const rankingData = useMemo(() => {
    const sellerMap = new Map<string, { name: string; recExt: number; recInt: number }>();
    filteredRecords.forEach(r => {
      const cur = sellerMap.get(r.sellerId) || { name: r.sellerName, recExt: 0, recInt: 0 };
      if (r.tipoLead === 'externo') cur.recExt += r.receita;
      else cur.recInt += r.receita;
      sellerMap.set(r.sellerId, cur);
    });
    const arr = Array.from(sellerMap.values()).map(s => ({
      name: s.name,
      value: rankingType === 'externa' ? s.recExt : rankingType === 'interna' ? s.recInt : s.recExt + s.recInt,
    }));
    return arr.sort((a, b) => b.value - a.value);
  }, [filteredRecords, rankingType]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleExportPDF = () => exportToPDF('dashboard-content', 'dashboard-integraseg');

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div id="dashboard-content">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acompanhe os resultados da equipe</p>
          </div>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>

        <div className="mb-8">
          <DashboardFilters sellers={sellers} filters={filters} onFiltersChange={setFilters} />
        </div>

        {filteredRecords.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum dado encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Importe resultados para visualizar métricas.</p>
          </div>
        ) : (
          <>
            {/* External Leads Section */}
            <h2 className="mb-4 text-lg font-semibold text-foreground">Leads Externos</h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard title="Oportunidades" value={extMetrics.totalOp.toLocaleString('pt-BR')} icon={<Target className="h-5 w-5" />} />
              <MetricCard title="Vendas" value={extMetrics.totalVendas.toLocaleString('pt-BR')} icon={<TrendingUp className="h-5 w-5" />} />
              <MetricCard title="Taxa de Conversão" value={`${extMetrics.conversionRate}%`} icon={<Percent className="h-5 w-5" />} />
              <MetricCard title="Receita" value={formatCurrency(extMetrics.totalReceita)} icon={<DollarSign className="h-5 w-5" />} />
              <MetricCard title="Tempo Médio" value={`${extMetrics.avgTempo} dias`} icon={<Clock className="h-5 w-5" />} />
            </div>
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <RevenueChart data={extRevenueData} title="Receita Diária — Externos" />
              <ConversionChart data={extConversionData} title="Taxa de Conversão Diária — Externos" />
            </div>

            {/* Internal Leads Section */}
            <h2 className="mb-4 text-lg font-semibold text-foreground">Leads Internos</h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <MetricCard title="Vendas" value={intMetrics.totalVendas.toLocaleString('pt-BR')} icon={<TrendingUp className="h-5 w-5" />} />
              <MetricCard title="Receita" value={formatCurrency(intMetrics.totalReceita)} icon={<DollarSign className="h-5 w-5" />} />
            </div>
            <div className="mb-8">
              <RevenueChart data={intRevenueData} title="Receita Diária — Internos" />
            </div>

            {/* Comparative Chart */}
            <h2 className="mb-4 text-lg font-semibold text-foreground">Comparativo</h2>
            <Card className="mb-8 animate-slide-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Receita Diária — Internos vs Externos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `R$${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'externa' ? 'Externos' : 'Internos']} />
                      <Legend formatter={(v) => v === 'externa' ? 'Externos' : 'Internos'} />
                      <Bar dataKey="externa" name="externa" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="interna" name="interna" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Ranking */}
            <h2 className="mb-4 text-lg font-semibold text-foreground">Ranking de Vendedores</h2>
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" /> Ranking
                </CardTitle>
                <Select value={rankingType} onValueChange={(v) => setRankingType(v as any)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Receita Total</SelectItem>
                    <SelectItem value="externa">Receita Externa</SelectItem>
                    <SelectItem value="interna">Receita Interna</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {rankingData.length > 0 ? (
                  <div className="space-y-3">
                    {rankingData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <span className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          index === 0 ? "bg-warning/20 text-warning" : index === 1 ? "bg-muted text-muted-foreground" : "bg-muted/50 text-muted-foreground"
                        )}>{index + 1}</span>
                        <span className="flex-1 font-medium text-foreground">{item.name}</span>
                        <span className="font-semibold text-foreground">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados para o período.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function buildDailyData(records: SalesRecord[], field: 'receita') {
  const dayMap = new Map<string, number>();
  records.forEach(r => {
    dayMap.set(r.dataResultado, (dayMap.get(r.dataResultado) || 0) + r[field]);
  });
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, receita]) => ({ period: formatDateShort(date), receita }));
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
