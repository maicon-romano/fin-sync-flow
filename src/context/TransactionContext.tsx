
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'salary'
  | 'investment'
  | 'bonus'
  | 'other_income'
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'education'
  | 'debt'
  | 'savings'
  | 'personal'
  | 'other_expense';

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  dueDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  isVariable?: boolean;
  source?: string;
  notes?: string;
};

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  markAsPaid: (id: string) => void;
  filterTransactions: (filters: {
    type?: TransactionType;
    category?: TransactionCategory;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
    source?: string;
  }) => Transaction[];
  getCategoryName: (category: TransactionCategory) => string;
  categoryLabels: Record<TransactionCategory, string>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const categoryLabels: Record<TransactionCategory, string> = {
  // Income categories
  salary: 'Salário',
  investment: 'Investimentos',
  bonus: 'Bônus',
  other_income: 'Outras Receitas',
  // Expense categories
  housing: 'Moradia',
  transportation: 'Transporte',
  food: 'Alimentação',
  utilities: 'Contas',
  healthcare: 'Saúde',
  entertainment: 'Lazer',
  education: 'Educação',
  debt: 'Dívidas',
  savings: 'Poupança',
  personal: 'Pessoal',
  other_expense: 'Outras Despesas'
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Salário Mensal',
    amount: 5000,
    type: 'income',
    category: 'salary',
    date: '2025-04-05',
    isPaid: true,
    isRecurring: true,
    source: 'Empresa XYZ',
  },
  {
    id: '2',
    title: 'Aluguel',
    amount: 1200,
    type: 'expense',
    category: 'housing',
    date: '2025-04-10',
    dueDate: '2025-04-15',
    isPaid: true,
    isRecurring: true,
  },
  {
    id: '3',
    title: 'Supermercado',
    amount: 450,
    type: 'expense',
    category: 'food',
    date: '2025-04-08',
    isPaid: true,
    isRecurring: false,
  },
  {
    id: '4',
    title: 'Internet + TV',
    amount: 200,
    type: 'expense',
    category: 'utilities',
    date: '2025-04-20',
    dueDate: '2025-04-22',
    isPaid: false,
    isRecurring: true,
  },
  {
    id: '5',
    title: 'Dividendos',
    amount: 350,
    type: 'income',
    category: 'investment',
    date: '2025-04-15',
    isPaid: false,
    isRecurring: false,
    source: 'Ações',
  },
  {
    id: '6',
    title: 'Academia',
    amount: 100,
    type: 'expense',
    category: 'personal',
    date: '2025-04-01',
    isPaid: true,
    isRecurring: true,
  },
  {
    id: '7',
    title: 'Gasolina',
    amount: 300,
    type: 'expense',
    category: 'transportation',
    date: '2025-04-12',
    isPaid: true,
    isRecurring: false,
  },
  {
    id: '8',
    title: 'Curso Online',
    amount: 80,
    type: 'expense',
    category: 'education',
    date: '2025-04-18',
    isPaid: true,
    isRecurring: false,
  }
];

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load transactions from localStorage or use mock data for demonstration
    const storedTransactions = localStorage.getItem('finsync_transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      // Use mock data for demo purposes
      setTransactions(mockTransactions);
      localStorage.setItem('finsync_transactions', JSON.stringify(mockTransactions));
    }
    setIsLoading(false);
  }, []);

  // Update localStorage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('finsync_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(), // Simple ID generation
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    toast.success("Transação adicionada com sucesso!");
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...transaction } : item
      )
    );
    toast.success("Transação atualizada com sucesso!");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    toast.success("Transação removida com sucesso!");
  };

  const markAsPaid = (id: string) => {
    updateTransaction(id, { isPaid: true });
    toast.success("Transação marcada como paga!");
  };

  const filterTransactions = (filters: {
    type?: TransactionType;
    category?: TransactionCategory;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
    source?: string;
    isVariable?: boolean;
  }) => {
    return transactions.filter(transaction => {
      // Apply each filter if it exists
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.category && transaction.category !== filters.category) return false;
      if (filters.isPaid !== undefined && transaction.isPaid !== filters.isPaid) return false;
      if (filters.isVariable !== undefined && transaction.isVariable !== filters.isVariable) return false;
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;
      if (filters.source && transaction.source !== filters.source) return false;
      
      return true;
    });
  };

  const getCategoryName = (category: TransactionCategory) => {
    return categoryLabels[category] || category;
  };

  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        isLoading, 
        addTransaction, 
        updateTransaction, 
        deleteTransaction, 
        markAsPaid, 
        filterTransactions,
        getCategoryName,
        categoryLabels
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
