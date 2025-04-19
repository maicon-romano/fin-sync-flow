
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

type User = {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium' | 'business';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isPremium: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('finsync_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login for demonstration purposes
    // In production, this should call an actual API
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any email/password will work
      const userData: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        plan: 'free'
      };
      
      setUser(userData);
      localStorage.setItem('finsync_user', JSON.stringify(userData));
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Falha ao fazer login. Tente novamente.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // Mock signup for demonstration purposes
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData: User = {
        id: '1',
        name,
        email,
        plan: 'free'
      };
      
      setUser(userData);
      localStorage.setItem('finsync_user', JSON.stringify(userData));
      toast.success("Conta criada com sucesso!");
    } catch (error) {
      toast.error("Falha ao criar conta. Tente novamente.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finsync_user');
    toast.info("Sessão encerrada");
  };

  const isPremium = () => {
    return user?.plan === 'premium' || user?.plan === 'business';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
