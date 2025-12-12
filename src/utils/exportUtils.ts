import { SalesResult } from '@/types/sales';

export function exportToExcel(results: SalesResult[], filename: string) {
  const headers = [
    'Vendedor',
    'Período Início',
    'Período Fim',
    'Oportunidades',
    'Vendas',
    'Taxa de Conversão (%)',
    'Tempo Médio (dias)',
    'Receita (R$)',
    'Data de Importação',
  ];

  const rows = results.map(r => [
    r.sellerName,
    formatDate(r.startDate),
    formatDate(r.endDate),
    r.opportunities,
    r.sales,
    r.conversionRate,
    r.averageConversionTime,
    r.revenue.toFixed(2),
    formatDateTime(r.importedAt),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';')),
  ].join('\n');

  // Add BOM for Excel to recognize UTF-8
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
  // For now, we'll use print functionality
  // In a real app, you'd use a library like jsPDF or html2pdf
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
          .metric { display: inline-block; margin: 10px 20px 10px 0; }
          .metric-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
          .metric-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}
