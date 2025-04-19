
import { ReactNode, useState, useEffect } from "react";
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
  Bell,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, Link } from "react-router-dom";
import { useSidebar } from "@/hooks/use-sidebar";

type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  isPremium?: boolean;
};

export default function Shell({ children }: { children: ReactNode }) {
  const { user, logout, isPremium } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isOpen, toggleSidebar } = useSidebar();

  const mainLinks: SidebarLink[] = [
    { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Transações", href: "/transactions", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Orçamentos", href: "/budgets", icon: <PiggyBank className="h-5 w-5" /> },
    { name: "Relatórios", href: "/reports", icon: <BarChart className="h-5 w-5" /> },
    { name: "Previsão", href: "/forecast", icon: <TrendingUp className="h-5 w-5" /> },
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-finsync-dark text-white flex-shrink-0 flex flex-col border-r border-zinc-800 z-50 transition-all duration-300",
          isMobile ? "fixed inset-y-0 left-0 h-full" : "relative",
          isOpen ? "w-64" : isMobile ? "-translate-x-full" : "w-[70px]"
        )}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className={cn(
            "text-xl font-bold text-white transition-opacity duration-200",
            !isOpen && !isMobile && "opacity-0"
          )}>
            <span className="text-finsync-accent">Fin</span>Sync
          </h2>
          {isMobile ? (
            <button onClick={toggleSidebar} className="p-2 -mr-2 rounded-full hover:bg-zinc-800">
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar} 
              className={cn(
                "p-1 rounded-full hover:bg-zinc-800 text-zinc-400",
                !isOpen && "absolute right-0 translate-x-full bg-finsync-dark rounded-l-none rounded-r-full border-y border-r border-zinc-800"
              )}
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const isDisabled = link.isPremium && !isPremium();
              
              return (
                <Link
                  key={link.name}
                  to={isDisabled ? "#" : link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium group transition-colors",
                    isActive 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      alert("Recurso disponível apenas no plano Premium");
                    } else if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                >
                  <div className="flex-shrink-0">{link.icon}</div>
                  <span className={cn(
                    "ml-3 transition-all duration-200",
                    !isOpen && !isMobile && "opacity-0 w-0 overflow-hidden"
                  )}>
                    {link.name}
                  </span>
                  {isDisabled && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 transition-all duration-200",
                      !isOpen && !isMobile && "opacity-0 w-0 overflow-hidden"
                    )}>
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-800">
            <div className={cn(
              "px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider transition-all duration-200",
              !isOpen && !isMobile && "opacity-0"
            )}>
              Conta
            </div>
            <div className="space-y-1">
              {bottomLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === link.href 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <div className="flex-shrink-0">{link.icon}</div>
                  <span className={cn(
                    "ml-3 transition-all duration-200",
                    !isOpen && !isMobile && "opacity-0 w-0 overflow-hidden"
                  )}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-3 border-t border-zinc-800">
          <div className={cn(
            "flex items-center px-2 py-2",
            !isOpen && !isMobile && "justify-center"
          )}>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-finsync-primary text-white flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className={cn(
              "ml-3 min-w-0 flex-1 transition-all duration-200",
              !isOpen && !isMobile && "opacity-0 w-0 overflow-hidden"
            )}>
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
