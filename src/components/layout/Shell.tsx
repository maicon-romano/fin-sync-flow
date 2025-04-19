
import { ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Home, 
  LogOut, 
  Menu, 
  PiggyBank, 
  Settings, 
  User,
  X,
  TrendingUp,
  CreditCard,
  CircleDollarSign,
  Bell
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  isPremium?: boolean;
};

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, isPremium } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const mainLinks: SidebarLink[] = [
    { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Transações", href: "/transactions", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Orçamentos", href: "/budgets", icon: <PiggyBank className="h-5 w-5" /> },
    { name: "Relatórios", href: "/reports", icon: <BarChart className="h-5 w-5" /> },
    { name: "Metas", href: "/goals", icon: <TrendingUp className="h-5 w-5" />, isPremium: true },
    { name: "Investimentos", href: "/investments", icon: <CircleDollarSign className="h-5 w-5" />, isPremium: true },
  ];

  const bottomLinks: SidebarLink[] = [
    { name: "Notificações", href: "/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Configurações", href: "/settings", icon: <Settings className="h-5 w-5" /> },
    { name: "Perfil", href: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  if (!user) {
    // If not logged in, redirect to auth page
    return <>{children}</>;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-finsync-dark text-white w-64 flex-shrink-0 flex flex-col border-r border-zinc-800 z-50",
          isMobile && "fixed inset-y-0 left-0 transition-transform transform duration-300 ease-in-out h-full",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              <span className="text-finsync-accent">Fin</span>Sync
            </h2>
            {isMobile && (
              <button onClick={closeSidebar} className="p-2 -mr-2 rounded-full hover:bg-zinc-800">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const isDisabled = link.isPremium && !isPremium();
              
              return (
                <a
                  key={link.name}
                  href={isDisabled ? "#" : link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium group transition-colors",
                    link.href === window.location.pathname 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      alert("Recurso disponível apenas no plano Premium");
                    } else if (isMobile) {
                      closeSidebar();
                    }
                  }}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                  {isDisabled && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                      PRO
                    </span>
                  )}
                </a>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-800">
            <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Conta
            </div>
            <div className="space-y-1">
              {bottomLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    link.href === window.location.pathname 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                  onClick={() => isMobile && closeSidebar()}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center px-2 py-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-finsync-primary text-white flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-zinc-400 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        {isMobile && (
          <header className="bg-white shadow-sm border-b z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              <button 
                onClick={toggleSidebar}
                className="p-2 -ml-2 rounded-full text-zinc-600 hover:bg-zinc-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-zinc-900">
                <span className="text-finsync-accent">Fin</span>
                <span className="text-finsync-dark">Sync</span>
              </h1>
              <div className="w-10"></div> {/* Spacer for centering logo */}
            </div>
          </header>
        )}
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
