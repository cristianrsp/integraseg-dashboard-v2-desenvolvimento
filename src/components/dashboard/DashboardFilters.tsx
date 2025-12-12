import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Seller, DashboardFilters as Filters } from '@/types/sales';

interface DashboardFiltersProps {
  sellers: Seller[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function DashboardFilters({ sellers, filters, onFiltersChange }: DashboardFiltersProps) {
  const handleSellerChange = (value: string) => {
    onFiltersChange({ ...filters, sellerId: value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, endDate: e.target.value });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
      <div className="min-w-[200px] flex-1">
        <Label className="mb-2 block text-sm font-medium">Vendedor</Label>
        <Select value={filters.sellerId} onValueChange={handleSellerChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Equipe Inteira</SelectItem>
            {sellers.map((seller) => (
              <SelectItem key={seller.id} value={seller.id}>
                {seller.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px]">
        <Label className="mb-2 block text-sm font-medium">Data Inicial</Label>
        <div className="relative">
          <Input
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="min-w-[160px]">
        <Label className="mb-2 block text-sm font-medium">Data Final</Label>
        <div className="relative">
          <Input
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
