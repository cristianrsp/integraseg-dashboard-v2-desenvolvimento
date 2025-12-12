import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Calendar, User, PenLine, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesData } from '@/hooks/useSalesData';
import { parseCSV, ParsedCSVData } from '@/utils/csvParser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
type InputMethod = 'csv' | 'manual' | null;

export default function ImportResults() {
  const { sellers, loading, addResult } = useSalesData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [revenue, setRevenue] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);

  // Manual input state
  const [manualOpportunities, setManualOpportunities] = useState('');
  const [manualSales, setManualSales] = useState('');
  const [manualConversionTime, setManualConversionTime] = useState('');
  const [manualRevenue, setManualRevenue] = useState('');

  const selectedSellerData = sellers.find(s => s.id === selectedSeller);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const content = await file.text();
      const data = parseCSV(content);
      setParsedData(data);
      setRevenue(data.revenue.toString());
      toast.success('Arquivo processado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar o arquivo. Verifique o formato.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitCSV = async () => {
    if (!selectedSellerData || !parsedData) return;

    setIsSubmitting(true);
    try {
      await addResult({
        sellerId: selectedSeller,
        sellerName: selectedSellerData.name,
        startDate,
        endDate,
        opportunities: parsedData.opportunities,
        sales: parsedData.sales,
        averageConversionTime: parsedData.averageConversionTime,
        revenue: parseFloat(revenue) || 0,
        dataSource: 'csv',
      });

      toast.success('Resultados importados com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar resultados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitManual = async () => {
    if (!selectedSellerData) return;

    const opportunities = parseInt(manualOpportunities) || 0;
    const sales = parseInt(manualSales) || 0;
    const conversionTime = parseFloat(manualConversionTime) || 0;
    const revenueValue = parseFloat(manualRevenue) || 0;

    if (opportunities === 0 && sales === 0) {
      toast.error('Informe pelo menos oportunidades ou vendas');
      return;
    }

    setIsSubmitting(true);
    try {
      await addResult({
        sellerId: selectedSeller,
        sellerName: selectedSellerData.name,
        startDate,
        endDate,
        opportunities,
        sales,
        averageConversionTime: conversionTime,
        revenue: revenueValue,
        dataSource: 'manual',
      });

      toast.success('Resultados registrados com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar resultados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedSeller('');
    setStartDate('');
    setEndDate('');
    setParsedData(null);
    setRevenue('');
    setFileName('');
    setInputMethod(null);
    setManualOpportunities('');
    setManualSales('');
    setManualConversionTime('');
    setManualRevenue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canProceedToStep2 = selectedSeller !== '';
  const canProceedToStep3 = startDate !== '' && endDate !== '' && startDate <= endDate;
  const canSubmitCSV = parsedData !== null;
  const canSubmitManual = (parseInt(manualOpportunities) > 0 || parseInt(manualSales) > 0);

  const steps = [
    { number: 1, title: 'Vendedor', icon: User },
    { number: 2, title: 'Período', icon: Calendar },
    { number: 3, title: 'Dados', icon: Upload },
  ];

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Cadastro de Resultados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importe dados via CSV ou insira manualmente
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.number
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "mx-2 h-0.5 w-12 transition-colors",
                  currentStep > step.number ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-2xl">
        {/* Step 1: Select Seller */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Selecionar Vendedor</CardTitle>
              <CardDescription>
                Escolha o vendedor para associar os resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellers.length > 0 ? (
                <>
                  <div className="grid gap-2">
                    <Label>Vendedor</Label>
                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellers.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      disabled={!canProceedToStep2}
                    >
                      Próximo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-warning" />
                  <h3 className="mt-4 font-semibold text-foreground">Nenhum vendedor cadastrado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cadastre um vendedor antes de importar resultados.
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/vendedores'}>
                    Cadastrar Vendedor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Set Period */}
        {currentStep === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Definir Período</CardTitle>
              <CardDescription>
                Informe o período de análise dos resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {startDate && endDate && startDate > endDate && (
                <p className="text-sm text-destructive">
                  A data inicial não pode ser maior que a data final
                </p>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={!canProceedToStep3}
                >
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Choose Input Method & Enter Data */}
        {currentStep === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Adicionar Resultados</CardTitle>
              <CardDescription>
                Escolha como deseja adicionar os resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Vendedor:</strong> {selectedSellerData?.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">Período:</strong>{' '}
                  {new Date(startDate).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Method Selection */}
              {!inputMethod && (
                <div className="space-y-4">
                  <p className="text-center text-sm font-medium text-foreground">
                    Escolha como deseja adicionar os resultados:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => setInputMethod('csv')}
                      className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border p-6 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">Importar CSV</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Upload de planilha com dados
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setInputMethod('manual')}
                      className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border p-6 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <PenLine className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">Inserir Manualmente</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Digitar os dados no formulário
                        </p>
                      </div>
                    </button>
                  </div>
                  
                  <div className="flex justify-start pt-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Voltar
                    </Button>
                  </div>
                </div>
              )}

              {/* CSV Upload */}
              {inputMethod === 'csv' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setInputMethod(null);
                        setParsedData(null);
                        setFileName('');
                      }}
                      className="text-muted-foreground"
                    >
                      ← Alterar método
                    </Button>
                  </div>

                  {/* Upload Area */}
                  <div
                    className={cn(
                      "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                      parsedData 
                        ? "border-success bg-success/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      disabled={isProcessing}
                    />
                    {isProcessing ? (
                      <div className="space-y-2">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                      </div>
                    ) : parsedData ? (
                      <div className="space-y-2">
                        <CheckCircle className="mx-auto h-10 w-10 text-success" />
                        <p className="font-medium text-foreground">{fileName}</p>
                        <p className="text-sm text-muted-foreground">Arquivo processado com sucesso</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="font-medium text-foreground">Clique ou arraste o arquivo CSV</p>
                        <p className="text-sm text-muted-foreground">
                          O arquivo deve conter colunas de oportunidades, vendas e tempo de conversão
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Parsed Data Preview */}
                  {parsedData && (
                    <div className="space-y-4 rounded-lg border border-border p-4">
                      <h4 className="font-semibold text-foreground">Dados Extraídos</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Oportunidades</p>
                          <p className="text-lg font-bold text-foreground">{parsedData.opportunities}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Vendas</p>
                          <p className="text-lg font-bold text-foreground">{parsedData.sales}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Tempo Médio (dias)</p>
                          <p className="text-lg font-bold text-foreground">{parsedData.averageConversionTime}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Receita (R$)</p>
                          <Input
                            type="number"
                            value={revenue}
                            onChange={(e) => setRevenue(e.target.value)}
                            className="mt-1 h-8"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleSubmitCSV} 
                      disabled={!canSubmitCSV || isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Importação
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual Input */}
              {inputMethod === 'manual' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setInputMethod(null);
                        setManualOpportunities('');
                        setManualSales('');
                        setManualConversionTime('');
                        setManualRevenue('');
                      }}
                      className="text-muted-foreground"
                    >
                      ← Alterar método
                    </Button>
                  </div>

                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <h4 className="font-semibold text-foreground">Inserir Dados Manualmente</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="opportunities">Oportunidades de Vendas *</Label>
                        <Input
                          id="opportunities"
                          type="number"
                          min="0"
                          value={manualOpportunities}
                          onChange={(e) => setManualOpportunities(e.target.value)}
                          placeholder="Ex: 50"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sales">Vendas Realizadas *</Label>
                        <Input
                          id="sales"
                          type="number"
                          min="0"
                          value={manualSales}
                          onChange={(e) => setManualSales(e.target.value)}
                          placeholder="Ex: 15"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="conversionTime">Tempo Médio de Conversão (dias)</Label>
                        <Input
                          id="conversionTime"
                          type="number"
                          min="0"
                          step="0.1"
                          value={manualConversionTime}
                          onChange={(e) => setManualConversionTime(e.target.value)}
                          placeholder="Ex: 7"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="revenue">Receita Gerada (R$)</Label>
                        <Input
                          id="revenue"
                          type="number"
                          min="0"
                          step="0.01"
                          value={manualRevenue}
                          onChange={(e) => setManualRevenue(e.target.value)}
                          placeholder="Ex: 45000.00"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">* Campos obrigatórios (pelo menos um deve ser maior que zero)</p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleSubmitManual} 
                      disabled={!canSubmitManual || isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Dados
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CSV Format Info - Only show when CSV is selected or no method chosen */}
        {(inputMethod === 'csv' || inputMethod === null) && currentStep === 3 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Formato do CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                O arquivo CSV deve conter colunas com os seguintes nomes (ou similares):
              </p>
              <code className="mt-2 block rounded bg-muted px-3 py-2 text-xs">
                oportunidades;vendas;tempo_conversao;receita
              </code>
              <code className="mt-1 block rounded bg-muted px-3 py-2 text-xs">
                50;15;7;45000.00
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
