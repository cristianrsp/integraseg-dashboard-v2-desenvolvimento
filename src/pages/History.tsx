import { useState } from 'react';
import { Download, Trash2, Pencil, FileSpreadsheet, FileText, History as HistoryIcon, Search, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSalesData } from '@/hooks/useSalesData';
import { SalesRecord } from '@/types/sales';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

export default function History() {
  const { records, loading, updateRecord, deleteRecord } = useSalesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ oportunidades: 0, vendas: 0, tempoMedio: 0, receita: 0 });

  const filteredRecords = records.filter(r =>
    r.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
  const formatDateTime = (s: string) => new Date(s).toLocaleString('pt-BR');
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleEdit = (r: SalesRecord) => {
    setEditingRecord(r);
    setEditForm({ oportunidades: r.oportunidades || 0, vendas: r.vendas, tempoMedio: r.tempoMedio || 0, receita: r.receita });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      await updateRecord(editingRecord.id, {
        oportunidades: editingRecord.tipoLead === 'externo' ? editForm.oportunidades : null,
        vendas: editForm.vendas,
        tempoMedio: editingRecord.tipoLead === 'externo' ? editForm.tempoMedio : null,
        receita: editForm.receita,
      });
      toast.success('Registro atualizado!');
      setEditingRecord(null);
    } catch (error) {
      toast.error('Erro ao atualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      toast.success('Registro excluído!');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleExportExcel = () => {
    if (filteredRecords.length === 0) { toast.error('Sem dados'); return; }
    exportToExcel(filteredRecords, 'historico-vendas');
    toast.success('Exportado!');
  };

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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Resultados</h1>
          <p className="mt-1 text-sm text-muted-foreground">Todos os resultados importados</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportExcel} className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToPDF('history-table', 'historico-vendas')} className="gap-2"><FileText className="h-4 w-4" /> PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por vendedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div id="history-table" className="rounded-lg border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo Lead</TableHead>
                <TableHead className="text-right">Oport.</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Tempo Médio</TableHead>
                <TableHead>Importação</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.sellerName}</TableCell>
                  <TableCell>{formatDate(r.dataResultado)}</TableCell>
                  <TableCell>
                    <Badge variant={r.tipoLead === 'externo' ? 'default' : 'secondary'}>
                      {r.tipoLead === 'externo' ? 'Externo' : 'Interno'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{r.oportunidades != null ? r.oportunidades : '—'}</TableCell>
                  <TableCell className="text-right">{r.vendas}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(r.receita)}</TableCell>
                  <TableCell className="text-right">{r.tempoMedio != null ? `${r.tempoMedio} dias` : '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDateTime(r.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
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
          <h3 className="mt-4 text-lg font-semibold text-foreground">{searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum registro'}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{searchTerm ? 'Tente outro termo' : 'Importe resultados para visualizar o histórico'}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>Atualize os dados do resultado</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingRecord?.tipoLead === 'externo' && (
              <div className="grid gap-2">
                <Label>Oportunidades</Label>
                <Input type="number" value={editForm.oportunidades} onChange={(e) => setEditForm({ ...editForm, oportunidades: parseFloat(e.target.value) || 0 })} />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Vendas</Label>
              <Input type="number" value={editForm.vendas} onChange={(e) => setEditForm({ ...editForm, vendas: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="grid gap-2">
              <Label>Receita (R$)</Label>
              <Input type="number" step="0.01" value={editForm.receita} onChange={(e) => setEditForm({ ...editForm, receita: parseFloat(e.target.value) || 0 })} />
            </div>
            {editingRecord?.tipoLead === 'externo' && (
              <div className="grid gap-2">
                <Label>Tempo Médio (dias)</Label>
                <Input type="number" step="0.1" value={editForm.tempoMedio} onChange={(e) => setEditForm({ ...editForm, tempoMedio: parseFloat(e.target.value) || 0 })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
