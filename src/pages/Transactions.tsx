
import { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Check, 
  Clock, 
  Filter, 
  Plus, 
  Search,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Shell from "@/components/layout/Shell";
import { cn } from "@/lib/utils";
import { TransactionType, TransactionCategory } from "@/context/TransactionContext";

export default function Transactions() {
  const { transactions, markAsPaid, deleteTransaction, getCategoryName } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [isPaidFilter, setIsPaidFilter] = useState<boolean | "all">("all");
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Text search
    const matchesSearch = 
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.source && transaction.source.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    // Paid filter
    const matchesPaid = isPaidFilter === "all" || transaction.isPaid === isPaidFilter;
    
    return matchesSearch && matchesType && matchesPaid;
  });
  
  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
            <p className="text-muted-foreground">
              Gerencie todas as suas receitas e despesas
            </p>
          </div>
          <Button className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </header>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar transações..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tipo</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                        <Check className={cn("mr-2 h-4 w-4", typeFilter === "all" ? "opacity-100" : "opacity-0")} />
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("income")}>
                        <Check className={cn("mr-2 h-4 w-4", typeFilter === "income" ? "opacity-100" : "opacity-0")} />
                        Receitas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("expense")}>
                        <Check className={cn("mr-2 h-4 w-4", typeFilter === "expense" ? "opacity-100" : "opacity-0")} />
                        Despesas
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setIsPaidFilter("all")}>
                        <Check className={cn("mr-2 h-4 w-4", isPaidFilter === "all" ? "opacity-100" : "opacity-0")} />
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsPaidFilter(true)}>
                        <Check className={cn("mr-2 h-4 w-4", isPaidFilter === true ? "opacity-100" : "opacity-0")} />
                        Pagos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsPaidFilter(false)}>
                        <Check className={cn("mr-2 h-4 w-4", isPaidFilter === false ? "opacity-100" : "opacity-0")} />
                        Pendentes
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma transação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
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
                              <div className="font-medium">{transaction.title}</div>
                              {transaction.source && (
                                <div className="text-xs text-muted-foreground">
                                  Fonte: {transaction.source}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryName(transaction.category as TransactionCategory)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {transaction.dueDate && !transaction.isPaid && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-amber-500">
                                Vence: {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          {transaction.isRecurring && (
                            <div className="text-xs text-muted-foreground mt-1">Recorrente</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.isPaid ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Pago
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!transaction.isPaid && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8" 
                                onClick={() => markAsPaid(transaction.id)}
                                title="Marcar como pago"
                              >
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8" 
                              onClick={() => deleteTransaction(transaction.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
