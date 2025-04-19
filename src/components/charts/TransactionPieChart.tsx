
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTransactions, Transaction, TransactionType, categoryLabels } from "@/context/TransactionContext";

const COLORS = {
  income: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'],
  expense: ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#ef4444', '#dc2626', '#b91c1c', '#991b1b']
};

type PieChartData = {
  name: string;
  value: number;
  category: string;
};

type Props = {
  type: TransactionType;
  height?: number;
};

export default function TransactionPieChart({ type, height = 300 }: Props) {
  const { transactions, getCategoryName } = useTransactions();

  const chartData = useMemo(() => {
    // Filter transactions by type
    const filteredTransactions = transactions.filter(t => t.type === type);

    // Group by category and sum amounts
    const categoryMap = new Map<string, number>();

    filteredTransactions.forEach(transaction => {
      const { category, amount } = transaction;
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + amount);
    });

    // Convert to chart data format
    const data: PieChartData[] = Array.from(categoryMap.entries()).map(([category, value]) => ({
      name: getCategoryName(category as any),
      value,
      category,
    }));

    // Sort by value (highest first)
    return data.sort((a, b) => b.value - a.value);
  }, [transactions, type, getCategoryName]);

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-white rounded-lg border p-4">
        <p className="text-muted-foreground">
          {type === 'income' ? 'Nenhuma receita registrada' : 'Nenhuma despesa registrada'}
        </p>
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const colorArray = COLORS[type];

  // Format currency for Brazilian Real (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colorArray[index % colorArray.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
