import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react';
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

export default function ImportResults() {
  const { sellers, addResult } = useSalesData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [revenue, setRevenue] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSubmit = () => {
    if (!selectedSellerData || !parsedData) return;

    addResult({
      sellerId: selectedSeller,
      sellerName: selectedSellerData.name,
      startDate,
      endDate,
      opportunities: parsedData.opportunities,
      sales: parsedData.sales,
      averageConversionTime: parsedData.averageConversionTime,
      revenue: parseFloat(revenue) || 0,
    });

    toast.success('Resultados importados com sucesso!');
    
    // Reset form
    setCurrentStep(1);
    setSelectedSeller('');
    setStartDate('');
    setEndDate('');
    setParsedData(null);
    setRevenue('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canProceedToStep2 = selectedSeller !== '';
  const canProceedToStep3 = startDate !== '' && endDate !== '' && startDate <= endDate;
  const canSubmit = parsedData !== null;

  const steps = [
    { number: 1, title: 'Vendedor', icon: User },
    { number: 2, title: 'Período', icon: Calendar },
    { number: 3, title: 'Importar', icon: Upload },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Importar Resultados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importe dados de vendas a partir de um arquivo CSV
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
                Escolha o vendedor para associar os resultados importados
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

        {/* Step 3: Upload CSV */}
        {currentStep === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Importar Planilha CSV</CardTitle>
              <CardDescription>
                Faça upload do arquivo CSV com os dados de vendas
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
                  onClick={handleSubmit} 
                  disabled={!canSubmit}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Importação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CSV Format Info */}
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
      </div>
    </MainLayout>
  );
}
