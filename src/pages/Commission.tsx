import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Download, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSalesData } from '@/hooks/useSalesData';
import { DashboardFilters as Filters, SalesRecord } from '@/types/sales';
import { exportToPDF } from '@/utils/exportUtils';

// Commission rules
function calcDailyCommissionExterno(dailyRevenue: number): number {
  return dailyRevenue >= 450 ? dailyRevenue * 0.01 : 0;
}

function calcDailyCommissionInterno(dailyRevenue: number): number {
  return dailyRevenue >= 600 ? dailyRevenue * 0.01 : 0;
}

function calcPeriodCommissionExterno(totalRevenue: number): number {
  if (totalRevenue >= 5000) return totalRevenue * 0.0375;
  if (totalRevenue >= 3200) return totalRevenue * 0.03;
  if (totalRevenue >= 1500) return totalRevenue * 0.02;
  return 0;
}

function calcPeriodCommissionInterno(totalRevenue: number): number {
  if (totalRevenue >= 6250) return totalRevenue * 0.0375;
  if (totalRevenue >= 4000) return totalRevenue * 0.03;
  if (totalRevenue >= 1900) return totalRevenue * 0.02;
  return 0;
}

function getNextGoalExterno(totalRevenue: number): { goal: number; percent: string } {
  if (totalRevenue >= 5000) return { goal: 5000, percent: '3,75%' };
  if (totalRevenue >= 3200) return { goal: 5000, percent: '3,75%' };
  if (totalRevenue >= 1500) return { goal: 3200, percent: '3%' };
  return { goal: 1500, percent: '2%' };
}

function getNextGoalInterno(totalRevenue: number): { goal: number; percent: string } {
  if (totalRevenue >= 6250) return { goal: 6250, percent: '3,75%' };
  if (totalRevenue >= 4000) return { goal: 6250, percent: '3,75%' };
  if (totalRevenue >= 1900) return { goal: 4000, percent: '3%' };
  return { goal: 1900, percent: '2%' };
}

export default function Commission() {
  const { sellers, loading, getFilteredRecords } = useSalesData();

  const [filters, setFilters] = useState<Filters>({
    sellerId: 'all',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const filteredRecords = useMemo(() => {
    return getFilteredRecords(filters.sellerId, filters.startDate, filters.endDate);
  }, [filters, getFilteredRecords]);

  const externos = useMemo(() => filteredRecords.filter(r => r.tipoLead === 'externo'), [filteredRecords]);
  const internos = useMemo(() => filteredRecords.filter(r => r.tipoLead === 'interno'), [filteredRecords]);

  // Daily commission - sum of per-day commissions
  const dailyCommExt = useMemo(() => {
    const dayMap = new Map<string, number>();
    externos.forEach(r => dayMap.set(r.dataResultado, (dayMap.get(r.dataResultado) || 0) + r.receita));
    return Array.from(dayMap.values()).reduce((s, rev) => s + calcDailyCommissionExterno(rev), 0);
  }, [externos]);

  const dailyCommInt = useMemo(() => {
    const dayMap = new Map<string, number>();
    internos.forEach(r => dayMap.set(r.dataResultado, (dayMap.get(r.dataResultado) || 0) + r.receita));
    return Array.from(dayMap.values()).reduce((s, rev) => s + calcDailyCommissionInterno(rev), 0);
  }, [internos]);

  // Period commission
  const totalReceitaExt = useMemo(() => externos.reduce((s, r) => s + r.receita, 0), [externos]);
  const totalReceitaInt = useMemo(() => internos.reduce((s, r) => s + r.receita, 0), [internos]);

  const periodCommExt = useMemo(() => calcPeriodCommissionExterno(totalReceitaExt), [totalReceitaExt]);
  const periodCommInt = useMemo(() => calcPeriodCommissionInterno(totalReceitaInt), [totalReceitaInt]);

  const totalComm = dailyCommExt + periodCommExt + dailyCommInt + periodCommInt;

  const nextGoalExt = useMemo(() => getNextGoalExterno(totalReceitaExt), [totalReceitaExt]);
  const nextGoalInt = useMemo(() => getNextGoalInterno(totalReceitaInt), [totalReceitaInt]);

  const progressExt = Math.min((totalReceitaExt / nextGoalExt.goal) * 100, 100);
  const progressInt = Math.min((totalReceitaInt / nextGoalInt.goal) * 100, 100);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
      <div id="commission-content">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comissionamento</h1>
            <p className="mt-1 text-sm text-muted-foreground">Cálculo de comissões por período</p>
          </div>
          <Button onClick={() => exportToPDF('commission-content', 'comissionamento')} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>

        <div className="mb-8">
          <DashboardFilters sellers={sellers} filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Commission Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard title="Comissão Diária Ext." value={formatCurrency(dailyCommExt)} icon={<DollarSign className="h-5 w-5" />} />
          <MetricCard title="Comissão Período Ext." value={formatCurrency(periodCommExt)} icon={<TrendingUp className="h-5 w-5" />} />
          <MetricCard title="Comissão Diária Int." value={formatCurrency(dailyCommInt)} icon={<DollarSign className="h-5 w-5" />} />
          <MetricCard title="Comissão Período Int." value={formatCurrency(periodCommInt)} icon={<TrendingUp className="h-5 w-5" />} />
          <MetricCard title="Total a Receber" value={formatCurrency(totalComm)} icon={<DollarSign className="h-5 w-5" />} className="border-2 border-accent" />
        </div>

        {/* Progress Bars */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Progresso — Leads Externos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receita atual: <strong className="text-foreground">{formatCurrency(totalReceitaExt)}</strong></span>
                <span className="text-muted-foreground">Próxima meta ({nextGoalExt.percent}): <strong className="text-foreground">{formatCurrency(nextGoalExt.goal)}</strong></span>
              </div>
              <Progress value={progressExt} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">{Math.round(progressExt)}% concluído</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Progresso — Leads Internos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receita atual: <strong className="text-foreground">{formatCurrency(totalReceitaInt)}</strong></span>
                <span className="text-muted-foreground">Próxima meta ({nextGoalInt.percent}): <strong className="text-foreground">{formatCurrency(nextGoalInt.goal)}</strong></span>
              </div>
              <Progress value={progressInt} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">{Math.round(progressInt)}% concluído</p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Rules Reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Regras de Comissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Leads Externos</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Diária:</strong> ≥ R$450 → 1%</p>
                  <p><strong>Período:</strong> R$1.500–R$3.199 → 2% | R$3.200–R$4.999 → 3% | ≥ R$5.000 → 3,75%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Leads Internos</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Diária:</strong> ≥ R$600 → 1%</p>
                  <p><strong>Período:</strong> R$1.900–R$3.999 → 2% | R$4.000–R$6.249 → 3% | ≥ R$6.250 → 3,75%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
