import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Calendar, User, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;
type LeadType = 'externo' | 'interno' | null;

export default function ImportResults() {
  const { sellers, loading, addRecord } = useSalesData();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [dataResultado, setDataResultado] = useState('');
  const [leadType, setLeadType] = useState<LeadType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [oportunidades, setOportunidades] = useState('');
  const [vendas, setVendas] = useState('');
  const [receita, setReceita] = useState('');
  const [tempoMedio, setTempoMedio] = useState('');

  const selectedSellerData = sellers.find(s => s.id === selectedSeller);

  const handleSubmit = async () => {
    if (!selectedSellerData || !leadType) return;

    setIsSubmitting(true);
    try {
      await addRecord({
        sellerId: selectedSeller,
        dataResultado,
        tipoLead: leadType,
        oportunidades: leadType === 'externo' ? (parseFloat(oportunidades) || 0) : null,
        vendas: parseFloat(vendas) || 0,
        receita: parseFloat(receita) || 0,
        tempoMedio: leadType === 'externo' ? (parseFloat(tempoMedio) || 0) : null,
      });

      toast.success('Resultado registrado com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar resultado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedSeller('');
    setDataResultado('');
    setLeadType(null);
    setOportunidades('');
    setVendas('');
    setReceita('');
    setTempoMedio('');
  };

  const canProceedToStep2 = selectedSeller !== '';
  const canProceedToStep3 = dataResultado !== '';
  const canProceedToStep4 = leadType !== null;
  const canSubmit = parseFloat(vendas) >= 0 && parseFloat(receita) >= 0;

  const steps = [
    { number: 1, title: 'Vendedor', icon: User },
    { number: 2, title: 'Data', icon: Calendar },
    { number: 3, title: 'Tipo Lead', icon: Upload },
    { number: 4, title: 'Dados', icon: CheckCircle },
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Importar Resultados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre os resultados diários de vendas
        </p>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                currentStep === step.number ? "bg-primary text-primary-foreground"
                  : currentStep > step.number ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                <span>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("mx-2 h-0.5 w-8", currentStep > step.number ? "bg-accent" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Step 1: Seller */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Selecionar Vendedor</CardTitle>
              <CardDescription>Escolha o vendedor para associar o resultado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellers.length > 0 ? (
                <>
                  <div className="grid gap-2">
                    <Label>Vendedor</Label>
                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                      <SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger>
                      <SelectContent>
                        {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} disabled={!canProceedToStep2}>Próximo</Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-warning" />
                  <h3 className="mt-4 font-semibold text-foreground">Nenhum vendedor cadastrado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Cadastre um vendedor primeiro.</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/vendedores'}>Cadastrar Vendedor</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date */}
        {currentStep === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Data do Resultado</CardTitle>
              <CardDescription>Informe o dia do resultado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={dataResultado} onChange={(e) => setDataResultado(e.target.value)} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Voltar</Button>
                <Button onClick={() => setCurrentStep(3)} disabled={!canProceedToStep3}>Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Lead Type */}
        {currentStep === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Tipo de Lead</CardTitle>
              <CardDescription>Selecione o tipo de lead deste resultado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setLeadType('externo')}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all",
                    leadType === 'externo' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold text-foreground">Lead Externo</p>
                  <p className="text-xs text-muted-foreground text-center">Oportunidades, vendas, receita e tempo médio</p>
                </button>
                <button
                  onClick={() => setLeadType('interno')}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all",
                    leadType === 'interno' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold text-foreground">Lead Interno</p>
                  <p className="text-xs text-muted-foreground text-center">Apenas vendas e receita</p>
                </button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Voltar</Button>
                <Button onClick={() => setCurrentStep(4)} disabled={!canProceedToStep4}>Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Data Entry */}
        {currentStep === 4 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Inserir Resultados</CardTitle>
              <CardDescription>
                {leadType === 'externo' ? 'Lead Externo' : 'Lead Interno'} — {selectedSellerData?.name} — {new Date(dataResultado + 'T12:00:00').toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadType === 'externo' && (
                <>
                  <div className="grid gap-2">
                    <Label>Oportunidades</Label>
                    <Input type="number" value={oportunidades} onChange={e => setOportunidades(e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Vendas</Label>
                    <Input type="number" value={vendas} onChange={e => setVendas(e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Receita (R$)</Label>
                    <Input type="number" step="0.01" value={receita} onChange={e => setReceita(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tempo Médio de Conversão (dias)</Label>
                    <Input type="number" step="0.1" value={tempoMedio} onChange={e => setTempoMedio(e.target.value)} placeholder="0" />
                  </div>
                </>
              )}

              {leadType === 'interno' && (
                <>
                  <div className="grid gap-2">
                    <Label>Vendas</Label>
                    <Input type="number" value={vendas} onChange={e => setVendas(e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Receita (R$)</Label>
                    <Input type="number" step="0.01" value={receita} onChange={e => setReceita(e.target.value)} placeholder="0.00" />
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Voltar</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Resultado
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
