export interface Seller {
  id: string;
  name: string;
  createdAt: string;
}

export interface SalesRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  dataResultado: string;
  tipoLead: 'interno' | 'externo';
  oportunidades: number | null;
  vendas: number;
  receita: number;
  tempoMedio: number | null;
  createdAt: string;
}

export interface DashboardFilters {
  sellerId: string | 'all';
  startDate: string;
  endDate: string;
}
