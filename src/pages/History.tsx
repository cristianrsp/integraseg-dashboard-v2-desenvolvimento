import { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Pencil, 
  FileSpreadsheet, 
  FileText,
  History as HistoryIcon,
  Search
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSalesData } from '@/hooks/useSalesData';
import { SalesResult } from '@/types/sales';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

export default function History() {
  const { results, updateResult, deleteResult } = useSalesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResult, setEditingResult] = useState<SalesResult | null>(null);
  const [editForm, setEditForm] = useState({
    opportunities: 0,
    sales: 0,
    averageConversionTime: 0,
    revenue: 0,
  });

  const filteredResults = results.filter(r => 
    r.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEdit = (result: SalesResult) => {
    setEditingResult(result);
    setEditForm({
      opportunities: result.opportunities,
      sales: result.sales,
      averageConversionTime: result.averageConversionTime,
      revenue: result.revenue,
    });
  };

  const handleSaveEdit = () => {
    if (!editingResult) return;

    updateResult(editingResult.id, editForm);
    toast.success('Registro atualizado com sucesso!');
    setEditingResult(null);
  };

  const handleDelete = (id: string) => {
    deleteResult(id);
    toast.success('Registro excluído com sucesso!');
  };

  const handleExportExcel = () => {
    if (filteredResults.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    exportToExcel(filteredResults, 'historico-vendas-integraseg');
    toast.success('Arquivo Excel exportado!');
  };

  const handleExportPDF = () => {
    if (filteredResults.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    exportToPDF('history-table', 'historico-vendas-integraseg');
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Resultados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize e gerencie todos os resultados importados
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Exportar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredResults.length > 0 ? (
        <div id="history-table" className="rounded-lg border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Oportunidades</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Conversão</TableHead>
                <TableHead className="text-right">Tempo Médio</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead>Importação</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.sellerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(result.startDate)} - {formatDate(result.endDate)}
                  </TableCell>
                  <TableCell className="text-right">{result.opportunities}</TableCell>
                  <TableCell className="text-right">{result.sales}</TableCell>
                  <TableCell className="text-right">{result.conversionRate}%</TableCell>
                  <TableCell className="text-right">{result.averageConversionTime} dias</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(result.revenue)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(result.importedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(result)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(result.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum registro no histórico'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm 
              ? 'Tente buscar por outro termo' 
              : 'Importe resultados de vendas para visualizar o histórico'}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingResult} onOpenChange={() => setEditingResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Atualize os dados do resultado de vendas
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Oportunidades</Label>
              <Input
                type="number"
                value={editForm.opportunities}
                onChange={(e) => setEditForm({ ...editForm, opportunities: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Vendas</Label>
              <Input
                type="number"
                value={editForm.sales}
                onChange={(e) => setEditForm({ ...editForm, sales: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tempo Médio de Conversão (dias)</Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.averageConversionTime}
                onChange={(e) => setEditForm({ ...editForm, averageConversionTime: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Receita (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.revenue}
                onChange={(e) => setEditForm({ ...editForm, revenue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResult(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
