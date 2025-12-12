export interface Seller {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SalesResult {
  id: string;
  sellerId: string;
  sellerName: string;
  startDate: string;
  endDate: string;
  opportunities: number;
  sales: number;
  conversionRate: number;
  averageConversionTime: number;
  revenue: number;
  importedAt: string;
  dataSource?: 'csv' | 'manual';
}

export interface DashboardFilters {
  sellerId: string | 'all';
  startDate: string;
  endDate: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}
