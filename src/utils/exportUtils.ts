import { SalesRecord } from '@/types/sales';

export function exportToExcel(records: SalesRecord[], filename: string) {
  const headers = [
    'Vendedor', 'Data', 'Tipo Lead', 'Oportunidades', 'Vendas', 'Receita (R$)', 'Tempo Médio (dias)', 'Data Importação',
  ];

  const rows = records.map(r => [
    r.sellerName,
    formatDate(r.dataResultado),
    r.tipoLead === 'externo' ? 'Externo' : 'Interno',
    r.oportunidades != null ? r.oportunidades : '',
    r.vendas,
    r.receita.toFixed(2),
    r.tempoMedio != null ? r.tempoMedio : '',
    formatDateTime(r.createdAt),
  ]);

  const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1e3a5f; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          h1 { color: #1e3a5f; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
}

function formatDate(s: string): string {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

function formatDateTime(s: string): string {
  return new Date(s).toLocaleString('pt-BR');
}
