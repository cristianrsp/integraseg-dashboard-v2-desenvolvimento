export interface ParsedCSVData {
  opportunities: number;
  sales: number;
  averageConversionTime: number;
  revenue: number;
}

export function parseCSV(content: string): ParsedCSVData {
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados.');
  }

  const headers = lines[0].toLowerCase().split(/[,;]/).map(h => h.trim());
  
  // Find column indices
  const opportunitiesIndex = headers.findIndex(h => 
    h.includes('oportunidade') || h.includes('opportunity') || h.includes('leads')
  );
  const salesIndex = headers.findIndex(h => 
    h.includes('venda') || h.includes('sales') || h.includes('fechamento')
  );
  const conversionTimeIndex = headers.findIndex(h => 
    h.includes('tempo') || h.includes('time') || h.includes('dias') || h.includes('conversão')
  );
  const revenueIndex = headers.findIndex(h => 
    h.includes('receita') || h.includes('revenue') || h.includes('valor') || h.includes('faturamento')
  );

  let totalOpportunities = 0;
  let totalSales = 0;
  let totalConversionTime = 0;
  let totalRevenue = 0;
  let conversionTimeCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,;]/).map(v => v.trim());
    
    if (values.length === 0 || values.every(v => !v)) continue;

    // Parse numeric values, handling Brazilian format (comma as decimal separator)
    const parseNumber = (value: string): number => {
      if (!value) return 0;
      // Remove currency symbols and thousands separators, convert comma to dot
      const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    };

    if (opportunitiesIndex >= 0 && values[opportunitiesIndex]) {
      totalOpportunities += parseNumber(values[opportunitiesIndex]);
    }

    if (salesIndex >= 0 && values[salesIndex]) {
      totalSales += parseNumber(values[salesIndex]);
    }

    if (conversionTimeIndex >= 0 && values[conversionTimeIndex]) {
      const time = parseNumber(values[conversionTimeIndex]);
      if (time > 0) {
        totalConversionTime += time;
        conversionTimeCount++;
      }
    }

    if (revenueIndex >= 0 && values[revenueIndex]) {
      totalRevenue += parseNumber(values[revenueIndex]);
    }
  }

  // If specific columns weren't found, try to interpret the data differently
  // Assuming format: oportunidades, vendas, tempo_conversao, receita
  if (opportunitiesIndex === -1 && salesIndex === -1) {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;]/).map(v => v.trim());
      if (values.length >= 2) {
        const parseNumber = (value: string): number => {
          if (!value) return 0;
          const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          return parseFloat(cleaned) || 0;
        };
        
        totalOpportunities += parseNumber(values[0]);
        totalSales += parseNumber(values[1]);
        if (values[2]) {
          const time = parseNumber(values[2]);
          if (time > 0) {
            totalConversionTime += time;
            conversionTimeCount++;
          }
        }
        if (values[3]) {
          totalRevenue += parseNumber(values[3]);
        }
      }
    }
  }

  return {
    opportunities: Math.round(totalOpportunities),
    sales: Math.round(totalSales),
    averageConversionTime: conversionTimeCount > 0 
      ? Math.round((totalConversionTime / conversionTimeCount) * 10) / 10 
      : 0,
    revenue: Math.round(totalRevenue * 100) / 100,
  };
}
