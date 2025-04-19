
import { useMemo } from "react";
import { ArrowDown, ArrowUp, BarChart, Calendar, CircleDollarSign, PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/context/TransactionContext";
import SummaryCard from "@/components/dashboard/SummaryCard";
import TransactionPieChart from "@/components/charts/TransactionPieChart";
import Shell from "@/components/layout/Shell";

export default function Dashboard() {
  const { transactions } = useTransactions();
  
  // Calculate financial summary
  const summary = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Month labels in Portuguese
    const monthLabels = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // Current month transactions
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    // Previous month transactions
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === previousMonth && 
             transactionDate.getFullYear() === previousYear;
    });
    
    // Calculate totals
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = totalIncome - totalExpense;
    
    // Calculate previous month totals for trends
    const prevTotalIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const prevTotalExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const prevBalance = prevTotalIncome - prevTotalExpense;
    
    // Calculate trends (percentage change)
    const incomeTrend = prevTotalIncome === 0 
      ? 100 
      : Math.round(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100);
      
    const expenseTrend = prevTotalExpense === 0 
      ? 0 
      : Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100);
      
    const balanceTrend = prevBalance === 0 
      ? (balance > 0 ? 100 : 0)
      : Math.round(((balance - prevBalance) / Math.abs(prevBalance)) * 100);
    
    return {
      totalIncome,
      totalExpense,
      balance,
      incomeTrend,
      expenseTrend,
      balanceTrend,
      currentMonth: monthLabels[currentMonth],
      previousMonth: monthLabels[previousMonth],
      unpaidExpenses: transactions.filter(t => t.type === 'expense' && !t.isPaid).length,
      pendingIncome: transactions.filter(t => t.type === 'income' && !t.isPaid).length
    };
  }, [transactions]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  return (
    <Shell>
      <div className="container py-6 space-y-6 lg:space-y-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral de suas finanças para {summary.currentMonth}
          </p>
        </header>
        
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard 
            title="Receitas"
            value={formatCurrency(summary.totalIncome)}
            description={`vs. ${summary.previousMonth}`}
            trend={{ value: summary.incomeTrend, label: 'vs. último mês' }}
            icon={<ArrowUp className="h-4 w-4" />}
            variant="income"
          />
          
          <SummaryCard 
            title="Despesas"
            value={formatCurrency(summary.totalExpense)}
            description={`vs. ${summary.previousMonth}`}
            trend={{ value: summary.expenseTrend * -1, label: 'vs. último mês' }}
            icon={<ArrowDown className="h-4 w-4" />}
            variant="expense"
          />
          
          <SummaryCard 
            title="Saldo"
            value={formatCurrency(summary.balance)}
            description={`vs. ${summary.previousMonth}`}
            trend={{ value: summary.balanceTrend, label: 'vs. último mês' }}
            icon={<Wallet className="h-4 w-4" />}
            variant="balance"
          />
          
          <SummaryCard 
            title="Pendências"
            value={`${summary.unpaidExpenses + summary.pendingIncome}`}
            description={`${summary.pendingIncome} receitas, ${summary.unpaidExpenses} despesas`}
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>
        
        {/* Charts and analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Receitas por categoria</CardTitle>
              <CardDescription>Distribuição de receitas em {summary.currentMonth}</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionPieChart type="income" />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Despesas por categoria</CardTitle>
              <CardDescription>Distribuição de gastos em {summary.currentMonth}</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionPieChart type="expense" />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Dicas rápidas</CardTitle>
              <CardDescription>Baseadas em seus hábitos financeiros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-finsync-accent/10 p-3 rounded-lg border border-finsync-accent/20 flex gap-3">
                  <div className="bg-finsync-accent/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                    <PiggyBank className="h-4 w-4 text-finsync-dark" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-finsync-dark">Economize mais</p>
                    <p className="text-zinc-600 text-xs mt-0.5">Tente reservar 20% das suas receitas para economias futuras.</p>
                  </div>
                </div>
                
                <div className="bg-finsync-primary/10 p-3 rounded-lg border border-finsync-primary/20 flex gap-3">
                  <div className="bg-finsync-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                    <BarChart className="h-4 w-4 text-finsync-dark" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-finsync-dark">Compare gastos</p>
                    <p className="text-zinc-600 text-xs mt-0.5">Seus gastos com alimentação diminuíram 12% este mês. Continue assim!</p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-3">
                  <div className="bg-red-100 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                    <CircleDollarSign className="h-4 w-4 text-finsync-warning" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-finsync-dark">Atenção</p>
                    <p className="text-zinc-600 text-xs mt-0.5">Você tem 2 contas vencendo nos próximos 3 dias, totalizando R$ 420,00.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transações Recentes</CardTitle>
            <CardDescription>Suas últimas 5 transações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')} • 
                        {transaction.isPaid ? ' Pago' : ' Pendente'}
                      </p>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
