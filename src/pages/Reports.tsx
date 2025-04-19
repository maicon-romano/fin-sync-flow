
import { useState, useMemo } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { ChevronLeft, ChevronRight, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";
import Shell from "@/components/layout/Shell";

export default function Reports() {
  const { transactions } = useTransactions();
  
  // Current date for default values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // State for selected period
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Month names in Portuguese
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  // Prepare data for charts
  const monthlyData = useMemo(() => {
    // Create a mapping of all days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyMap: Record<string, { income: number, expense: number, balance: number }> = {};
    
    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dailyMap[dateStr] = { income: 0, expense: 0, balance: 0 };
    }
    
    // Filter transactions for the selected month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === selectedYear && 
             transactionDate.getMonth() === selectedMonth;
    });
    
    // Aggregate by day
    monthTransactions.forEach(transaction => {
      const dateKey = transaction.date.substring(0, 10); // YYYY-MM-DD
      if (dailyMap[dateKey]) {
        if (transaction.type === 'income') {
          dailyMap[dateKey].income += transaction.amount;
        } else {
          dailyMap[dateKey].expense += transaction.amount;
        }
        dailyMap[dateKey].balance = dailyMap[dateKey].income - dailyMap[dateKey].expense;
      }
    });
    
    // Convert to array for charts
    return Object.entries(dailyMap).map(([date, values]) => ({
      date,
      displayDate: new Date(date).getDate(), // Just the day number
      income: values.income,
      expense: values.expense,
      balance: values.balance
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, selectedYear, selectedMonth]);
  
  // Calculate monthly totals
  const monthTotals = useMemo(() => {
    const income = monthlyData.reduce((sum, day) => sum + day.income, 0);
    const expense = monthlyData.reduce((sum, day) => sum + day.expense, 0);
    const balance = income - expense;
    
    return { income, expense, balance };
  }, [monthlyData]);
  
  // Category breakdown for the selected month
  const categoryBreakdown = useMemo(() => {
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === selectedYear && 
             transactionDate.getMonth() === selectedMonth;
    });
    
    const incomeCategories: Record<string, number> = {};
    const expenseCategories: Record<string, number> = {};
    
    monthTransactions.forEach(transaction => {
      const categoryMap = transaction.type === 'income' ? incomeCategories : expenseCategories;
      const category = transaction.category;
      categoryMap[category] = (categoryMap[category] || 0) + transaction.amount;
    });
    
    // Convert to array and sort by amount
    const incomeData = Object.entries(incomeCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const expenseData = Object.entries(expenseCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return { incomeData, expenseData };
  }, [transactions, selectedYear, selectedMonth]);
  
  // Colors for charts
  const colors = {
    income: "#10B981", // Emerald
    expense: "#EF4444", // Red
    balance: "#6366F1", // Indigo
    categories: [
      "#10B981", "#6366F1", "#F59E0B", "#EC4899", "#8B5CF6",
      "#3B82F6", "#14B8A6", "#84CC16", "#F97316", "#06B6D4"
    ]
  };

  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise detalhada das suas finanças
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue>{monthNames[selectedMonth]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue>{selectedYear}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="ml-2">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Monthly Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
                Total de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(monthTotals.income)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                em {monthNames[selectedMonth]} de {selectedYear}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(monthTotals.expense)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                em {monthNames[selectedMonth]} de {selectedYear}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Saldo do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthTotals.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(monthTotals.balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                em {monthNames[selectedMonth]} de {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Fluxo Financeiro Diário</CardTitle>
              <CardDescription>
                Movimentação diária de receitas e despesas
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(day) => `${day}`}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), '']}
                    labelFormatter={(day) => `Dia ${day}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Receitas" 
                    stroke={colors.income} 
                    strokeWidth={2} 
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    name="Despesas" 
                    stroke={colors.expense} 
                    strokeWidth={2} 
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    name="Saldo" 
                    stroke={colors.balance} 
                    strokeWidth={2} 
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receitas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das receitas em {monthNames[selectedMonth]}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {categoryBreakdown.incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryBreakdown.incomeData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Valor']}
                    />
                    <Bar dataKey="value" name="Valor">
                      {categoryBreakdown.incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors.categories[index % colors.categories.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhuma receita no período</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Despesas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das despesas em {monthNames[selectedMonth]}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {categoryBreakdown.expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryBreakdown.expenseData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Valor']}
                    />
                    <Bar dataKey="value" name="Valor">
                      {categoryBreakdown.expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors.categories[index % colors.categories.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhuma despesa no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
