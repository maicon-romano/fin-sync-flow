
import { useState } from "react";
import { Bell, Check, Clock, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    title: "Vencimento Próximo",
    message: "A conta de Aluguel vence em 3 dias.",
    date: "2025-04-22T10:30:00",
    type: "due_date",
    read: false,
  },
  {
    id: "2",
    title: "Despesa Recorrente",
    message: "A conta de Internet foi registrada para este mês.",
    date: "2025-04-20T08:15:00",
    type: "recurring",
    read: true,
  },
  {
    id: "3",
    title: "Meta atingida",
    message: "Você economizou 15% da sua renda neste mês! Continue assim!",
    date: "2025-04-19T16:40:00",
    type: "goal",
    read: false,
  },
  {
    id: "4",
    title: "Gasto acima da média",
    message: "Seus gastos com Alimentação estão 25% acima da média dos últimos 3 meses.",
    date: "2025-04-18T14:22:00",
    type: "alert",
    read: false,
  },
  {
    id: "5",
    title: "Receita Registrada",
    message: "O pagamento do seu Salário foi registrado com sucesso.",
    date: "2025-04-05T09:10:00",
    type: "income",
    read: true,
  },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "due_date" | "recurring" | "goal" | "alert" | "income";
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  // Format date relative to now (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days === 1 ? "1 dia atrás" : `${days} dias atrás`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hora atrás" : `${hours} horas atrás`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minuto atrás" : `${minutes} minutos atrás`;
    } else {
      return seconds === 1 ? "1 segundo atrás" : `${seconds} segundos atrás`;
    }
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };
  
  // Clear all read notifications
  const clearAllRead = () => {
    setNotifications(prev => 
      prev.filter(notif => !notif.read)
    );
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notif => 
    filter === "all" || (filter === "unread" && !notif.read)
  );
  
  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "due_date":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "recurring":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "goal":
        return <Check className="h-4 w-4 text-emerald-500" />;
      case "alert":
        return <Bell className="h-4 w-4 text-red-500" />;
      case "income":
        return <Bell className="h-4 w-4 text-emerald-500" />;
    }
  };
  
  // Get badge based on notification type
  const getNotificationBadge = (type: Notification["type"]) => {
    switch (type) {
      case "due_date":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Vencimento
          </Badge>
        );
      case "recurring":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Recorrente
          </Badge>
        );
      case "goal":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Conquista
          </Badge>
        );
      case "alert":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Alerta
          </Badge>
        );
      case "income":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Receita
          </Badge>
        );
    }
  };
  
  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground">
              Fique por dentro de todos os seus alertas e lembretes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(filter === "all" && "bg-secondary")}
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(filter === "unread" && "bg-secondary")}
              onClick={() => setFilter("unread")}
            >
              Não lidas
            </Button>
            <Button size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          </div>
        </header>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Suas notificações</CardTitle>
              <CardDescription>
                {filteredNotifications.length > 0 
                  ? `Você tem ${filteredNotifications.filter(n => !n.read).length} notificação(ões) não lida(s)` 
                  : "Não há notificações para exibir"}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllRead}
              disabled={!notifications.some(n => n.read)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar lidas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notificação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quando</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhuma notificação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <TableRow key={notification.id} className={!notification.read ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              notification.read ? 'bg-gray-100' : 'bg-blue-100'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {notification.message}
                              </div>
                              {!notification.read && (
                                <Badge variant="secondary" className="mt-1">Nova</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getNotificationBadge(notification.type)}
                        </TableCell>
                        <TableCell>
                          {formatRelativeTime(notification.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8" 
                                onClick={() => markAsRead(notification.id)}
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8" 
                              onClick={() => deleteNotification(notification.id)}
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
