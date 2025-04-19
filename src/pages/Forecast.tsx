import { useState, useMemo } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { 
  AlertTriangle, 
  CircleDollarSign, 
  ChevronLeft, 
  ChevronRight, 
  LineChart, 
  PiggyBank, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CartesianGrid, 
  Line, 
  LineChart as RechartsLineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Legend
} from "recharts";
import { Slider } from "@/components/ui/slider";
import Shell from "@/components/layout/Shell";
import { Transaction } from "@/context/TransactionContext";

// Helper function to get month name
const getMonthName = (monthIndex: number) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[monthIndex % 12];
};

// Helper function to add months to a date
const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export default function Forecast() {
  const { transactions } = useTransactions();
  const [forecastMonths, setForecastMonths] = useState(12); // Default to 12 months
  const [expectedIncome, setExpectedIncome] = useState(100); // Default to 100% (no change)
  const [expectedExpenses, setExpectedExpenses] = useState(100); // Default to 100% (no change)
  const [extraExpense, setExtraExpense] = useState(0); // Simulate a big expense
  const [extraExpenseMonth, setExtraExpenseMonth] = useState(6); // Default to 6 months from now
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Calculate monthly averages from past transactions
  const monthlyAverages = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get transactions from the last 6 months
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    const recentTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= sixMonthsAgo;
    });
    
    // Group by month and type
    const monthlyData: Record<string, { income: number, expense: number, count: number }> = {};
    
    recentTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, count: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
      
      monthlyData[monthKey].count++;
    });
    
    // Calculate averages
    const months = Object.values(monthlyData);
    const monthCount = months.length || 1; // Avoid division by zero
    
    const avgIncome = months.reduce((sum, month) => sum + month.income, 0) / monthCount;
    const avgExpense = months.reduce((sum, month) => sum + month.expense, 0) / monthCount;
    
    return { avgIncome, avgExpense };
  }, [transactions]);
  
  // Identify recurring transactions
  const recurringTransactions = useMemo(() => {
    return transactions.filter(transaction => transaction.isRecurring);
  }, [transactions]);
  
  // Generate forecast data
  const forecastData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const data = [];
    let runningBalance = 0;
    let savings = 0;
    
    // Get initial balance from current month's transactions
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    runningBalance = currentIncome - currentExpense;
    
    // Generate data for each future month
    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = addMonths(now, i);
      const monthName = getMonthName(forecastDate.getMonth());
      const monthYear = `${monthName} ${forecastDate.getFullYear()}`;
      
      // Apply user adjustment factors
      const adjustedIncome = monthlyAverages.avgIncome * (expectedIncome / 100);
      const adjustedExpense = monthlyAverages.avgExpense * (expectedExpenses / 100);
      
      // Add recurring transactions
      const recurringIncome = recurringTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const recurringExpense = recurringTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate month's income and expense
      let monthIncome = adjustedIncome + recurringIncome;
      let monthExpense = adjustedExpense + recurringExpense;
      
      // Add extra expense if this is the selected month
      if (i === extraExpenseMonth) {
        monthExpense += extraExpense;
      }
      
      // Calculate month's balance
      const monthBalance = monthIncome - monthExpense;
      runningBalance += monthBalance;
      
      // Calculate potential savings (positive balance only)
      if (monthBalance > 0) {
        savings += monthBalance;
      }
      
      data.push({
        month: monthYear,
        income: monthIncome,
        expense: monthExpense,
        balance: monthBalance,
        accumulated: runningBalance,
        savings
      });
    }
    
    return data;
  }, [
    transactions, 
    forecastMonths, 
    expectedIncome, 
    expectedExpenses, 
    extraExpense, 
    extraExpenseMonth, 
    monthlyAverages, 
    recurringTransactions
  ]);
  
  // Calculate summary metrics
  const forecastSummary = useMemo(() => {
    if (forecastData.length === 0) return { endBalance: 0, totalSavings: 0, monthsNegative: 0 };
    
    const endBalance = forecastData[forecastData.length - 1].accumulated;
    const totalSavings = forecastData[forecastData.length - 1].savings;
    const monthsNegative = forecastData.filter(month => month.balance < 0).length;
    
    return { endBalance, totalSavings, monthsNegative };
  }, [forecastData]);
  
  // Financial health assessment
  const financialHealth = useMemo(() => {
    // Negative balance at the end of forecast period
    if (forecastSummary.endBalance < 0) {
      return {
        status: "critical",
        title: "Situação Crítica",
        message: "Seu saldo projetado é negativo. Reduza despesas ou aumente receitas urgentemente."
      };
    }
    
    // More than 25% of months are negative
    if (forecastSummary.monthsNegative > forecastMonths * 0.25) {
      return {
        status: "warning",
        title: "Atenção",
        message: `Você terá ${forecastSummary.monthsNegative} meses com saldo negativo. Revise seu orçamento.`
      };
    }
    
    // Savings less than 3 months of expenses
    const avgMonthlyExpense = forecastData.reduce((sum, month) => sum + month.expense, 0) / forecastMonths;
    if (forecastSummary.totalSavings < avgMonthlyExpense * 3) {
      return {
        status: "caution",
        title: "Reserva Insuficiente",
        message: "Sua economia não alcançará 3 meses de despesas. Tente aumentar a taxa de poupança."
      };
    }
    
    // Good financial health
    return {
      status: "good",
      title: "Situação Estável",
      message: "Suas finanças estão em bom caminho. Continue economizando e planejando o futuro."
    };
  }, [forecastSummary, forecastData, forecastMonths]);
  
  // Colors for charts
  const colors = {
    income: "#10B981", // Emerald
    expense: "#EF4444", // Red
    balance: "#6366F1", // Indigo
    accumulated: "#8B5CF6", // Purple
    savings: "#F59E0B", // Amber
  };

  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Previsão Financeira</h1>
            <p className="text-muted-foreground">
              Planeje seu futuro financeiro
            </p>
          </div>
        </header>
        
        {/* Forecast Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajustes da Previsão</CardTitle>
            <CardDescription>
              Personalize sua previsão financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Período de Previsão</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[forecastMonths]}
                      min={3}
                      max={36}
                      step={3}
                      onValueChange={(value) => setForecastMonths(value[0])}
                      className="w-full"
                    />
                    <span className="w-12 text-sm">{forecastMonths} meses</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Expectativa de Receitas</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[expectedIncome]}
                      min={50}
                      max={150}
                      step={5}
                      onValueChange={(value) => setExpectedIncome(value[0])}
                      className="w-full"
                    />
                    <span className="w-12 text-sm">{expectedIncome}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Expectativa de Despesas</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[expectedExpenses]}
                      min={50}
                      max={150}
                      step={5}
                      onValueChange={(value) => setExpectedExpenses(value[0])}
                      className="w-full"
                    />
                    <span className="w-12 text-sm">{expectedExpenses}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Simular Despesa Extraordinária</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[extraExpense]}
                      min={0}
                      max={10000}
                      step={500}
                      onValueChange={(value) => setExtraExpense(value[0])}
                      className="w-full"
                    />
                    <span className="w-24 text-sm">{formatCurrency(extraExpense)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Mês da Despesa Extraordinária</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[extraExpenseMonth]}
                      min={1}
                      max={forecastMonths}
                      step={1}
                      onValueChange={(value) => setExtraExpenseMonth(value[0])}
                      disabled={extraExpense === 0}
                      className="w-full"
                    />
                    <span className="w-12 text-sm">{extraExpenseMonth}º mês</span>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Média mensal (6 meses):</strong><br />
                    Receitas: {formatCurrency(monthlyAverages.avgIncome)}<br />
                    Despesas: {formatCurrency(monthlyAverages.avgExpense)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Financial Health Summary */}
        <Card className={`border-l-4 ${
          financialHealth.status === 'good' ? 'border-l-emerald-500 bg-emerald-50/50' :
          financialHealth.status === 'caution' ? 'border-l-amber-500 bg-amber-50/50' :
          financialHealth.status === 'warning' ? 'border-l-orange-500 bg-orange-50/50' :
          'border-l-red-500 bg-red-50/50'
        }`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {financialHealth.status === 'good' ? (
                <PiggyBank className="h-12 w-12 text-emerald-500" />
              ) : financialHealth.status === 'caution' ? (
                <LineChart className="h-12 w-12 text-amber-500" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-500" />
              )}
              
              <div>
                <h3 className="text-xl font-semibold">{financialHealth.title}</h3>
                <p className="text-sm mt-1">{financialHealth.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Forecast Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-zinc-500" />
                Saldo Acumulado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${forecastSummary.endBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(forecastSummary.endBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ao final de {forecastMonths} meses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <PiggyBank className="mr-2 h-4 w-4 text-zinc-500" />
                Economia Potencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(forecastSummary.totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Se poupar todo saldo positivo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-zinc-500" />
                Meses Negativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${forecastSummary.monthsNegative > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {forecastSummary.monthsNegative} de {forecastMonths}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Meses com saldo negativo
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projeção Financeira</CardTitle>
            <CardDescription>
              Evolução projetada para os próximos {forecastMonths} meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), '']}
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
                  dataKey="accumulated" 
                  name="Acumulado" 
                  stroke={colors.accumulated} 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name="Poupança" 
                  stroke={colors.savings} 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Financial Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dicas Financeiras</CardTitle>
            <CardDescription>
              Recomendações com base na sua previsão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecastSummary.endBalance < 0 && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="font-medium text-red-800">Reduza seus gastos em áreas não essenciais</p>
                  <p className="text-sm text-red-700 mt-1">Sua projeção indica um déficit acumulado. Considere cortar gastos em categorias como entretenimento ou encontrar fontes adicionais de renda.</p>
                </div>
              )}
              
              {forecastSummary.monthsNegative > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-800">Constitua um fundo de emergência</p>
                  <p className="text-sm text-amber-700 mt-1">Você terá meses com saldo negativo. Economize agora para cobrir esses períodos difíceis (recomendado: 3-6 meses de despesas).</p>
                </div>
              )}
              
              {forecastSummary.totalSavings > 0 && (
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <p className="font-medium text-emerald-800">Invista seu potencial de economia</p>
                  <p className="text-sm text-emerald-700 mt-1">Você poderá economizar {formatCurrency(forecastSummary.totalSavings)} nos próximos {forecastMonths} meses. Considere investimentos para fazer seu dinheiro trabalhar por você.</p>
                </div>
              )}
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-800">Planeje grandes despesas com antecedência</p>
                <p className="text-sm text-blue-700 mt-1">Para despesas planejadas (como {formatCurrency(extraExpense)}), guarde um pouco a cada mês ao invés de comprometer seu orçamento todo de uma vez.</p>
              </div>
              
              {expectedExpenses > 100 && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-800">Atenção ao aumento de despesas</p>
                  <p className="text-sm text-purple-700 mt-1">Você projetou um aumento de {expectedExpenses - 100}% nas despesas. Tente manter esse crescimento sob controle para melhorar sua saúde financeira.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
