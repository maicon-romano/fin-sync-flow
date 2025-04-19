
import { useState, useMemo } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { 
  ArrowDown, 
  ArrowUp, 
  BarChart3, 
  Percent, 
  Plus, 
  Settings,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TransactionCategory, categoryLabels } from "@/context/TransactionContext";
import Shell from "@/components/layout/Shell";

type Budget = {
  category: TransactionCategory;
  limit: number;
  spent: number;
  percentage: number;
};

export default function Budgets() {
  const { transactions } = useTransactions();
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Mock budget limits for demonstration
  const budgetLimits: Record<string, number> = {
    food: 1500,
    housing: 2000,
    transportation: 700,
    utilities: 600,
    entertainment: 400,
    healthcare: 500,
    personal: 300,
    education: 250,
    debt: 1000,
    other_expense: 200
  };
  
  // Calculate budget usage from transactions
  const budgets = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get only expense transactions from current month
    const expenses = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'expense' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    // Calculate total spent per category
    const categorySpending: Record<string, number> = {};
    
    expenses.forEach(transaction => {
      const category = transaction.category;
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
    });
    
    // Create budget objects
    const result: Budget[] = [];
    
    for (const category in budgetLimits) {
      const limit = budgetLimits[category];
      const spent = categorySpending[category] || 0;
      const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
      
      result.push({
        category: category as TransactionCategory,
        limit,
        spent,
        percentage
      });
    }
    
    return result;
  }, [transactions, budgetLimits]);
  
  // Calculate overall budget
  const overallBudget = useMemo(() => {
    const totalLimit = Object.values(budgetLimits).reduce((sum, limit) => sum + limit, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const percentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
    
    return { totalLimit, totalSpent, percentage };
  }, [budgetLimits, budgets]);
  
  // Get budget status color
  const getBudgetStatusColor = (percentage: number) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage < 90) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Get month name
  const getCurrentMonthName = () => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[new Date().getMonth()];
  };

  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground">
              Controle seus limites de gastos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Editar Limites
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </header>
        
        {/* Overall Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Target className="mr-2 h-5 w-5 text-finsync-primary" />
              Resumo do Orçamento
            </CardTitle>
            <CardDescription>
              Situação geral do seu orçamento em {getCurrentMonthName()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Gasto</span>
                  <h3 className="text-2xl font-bold">{formatCurrency(overallBudget.totalSpent)}</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Limite</span>
                  <h3 className="text-2xl font-bold">{formatCurrency(overallBudget.totalLimit)}</h3>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">
                    {overallBudget.percentage}%
                  </span>
                </div>
                <Progress
                  value={overallBudget.percentage}
                  className="h-3"
                  indicatorClassName={getBudgetStatusColor(overallBudget.percentage)}
                />
                
                <p className="text-sm text-muted-foreground">
                  {overallBudget.percentage < 70 ? (
                    "Você está dentro do seu orçamento. Continue assim!"
                  ) : overallBudget.percentage < 90 ? (
                    "Atenção: Você está se aproximando do limite do seu orçamento."
                  ) : overallBudget.percentage < 100 ? (
                    "Alerta: Você está quase atingindo o limite total do seu orçamento."
                  ) : (
                    "Você atingiu o limite máximo do seu orçamento."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Budget Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.category} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    {categoryLabels[budget.category]}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    budget.percentage < 70 ? 'bg-emerald-100 text-emerald-700' : 
                    budget.percentage < 90 ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {budget.percentage}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <Progress
                    value={budget.percentage}
                    className="h-2"
                    indicatorClassName={getBudgetStatusColor(budget.percentage)}
                  />
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Gasto: </span>
                      <span className="font-medium">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Limite: </span>
                      <span className="font-medium">{formatCurrency(budget.limit)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {budget.limit > budget.spent ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <ArrowDown className="h-3 w-3" />
                        Restante: {formatCurrency(budget.limit - budget.spent)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <ArrowUp className="h-3 w-3" />
                        Excedido: {formatCurrency(budget.spent - budget.limit)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Budget Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-finsync-primary" />
              Visão Geral por Categoria
            </CardTitle>
            <CardDescription>
              Progresso do orçamento por categoria em {getCurrentMonthName()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {categoryLabels[budget.category]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${
                        budget.percentage < 70 ? 'text-emerald-600' : 
                        budget.percentage < 90 ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {budget.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${getBudgetStatusColor(budget.percentage)}`}
                      style={{ width: `${budget.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Percent className="mr-2 h-5 w-5 text-finsync-primary" />
              Dicas de Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Regra 50/30/20</p>
                  <p className="text-sm text-muted-foreground">
                    Destine 50% da sua renda para necessidades básicas, 30% para desejos e 20% para economias e investimentos.
                  </p>
                </div>
              </div>
              
              {budgets.some(b => b.percentage > 90) && (
                <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Categorias em Alerta</p>
                    <p className="text-sm text-muted-foreground">
                      Você ultrapassou 90% do limite em {budgets.filter(b => b.percentage > 90).length} categorias. 
                      Tente reduzir gastos nestas áreas.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Percent className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Economize Automaticamente</p>
                  <p className="text-sm text-muted-foreground">
                    Configure transferências automáticas para sua conta de poupança assim que receber seu salário.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
