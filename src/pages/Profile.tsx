
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bell, CircleDollarSign, Save, User } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

// Schema for user profile form
const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  bio: z.string().optional(),
});

// Schema for notification settings form
const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  dueDateReminders: z.boolean(),
  goalNotifications: z.boolean(),
  budgetAlerts: z.boolean(),
  dailyDigest: z.boolean(),
  reminderTime: z.string(),
});

// Schema for financial preferences form
const financialFormSchema = z.object({
  currency: z.string(),
  defaultViewMode: z.enum(["monthly", "yearly", "all"]),
  savingsGoalPercentage: z.coerce.number().min(0).max(100),
  autoCategorizeBills: z.boolean(),
  groupCategories: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type FinancialFormValues = z.infer<typeof financialFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });
  
  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      dueDateReminders: true,
      goalNotifications: true,
      budgetAlerts: true,
      dailyDigest: false,
      reminderTime: "20:00",
    },
  });
  
  // Financial preferences form
  const financialForm = useForm<FinancialFormValues>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      currency: "BRL",
      defaultViewMode: "monthly",
      savingsGoalPercentage: 20,
      autoCategorizeBills: true,
      groupCategories: true,
    },
  });
  
  // Submit handlers
  function onProfileSubmit(data: ProfileFormValues) {
    // Here we would save the profile data to the backend
    console.log("Profile data:", data);
    toast.success("Perfil atualizado com sucesso!");
  }
  
  function onNotificationSubmit(data: NotificationFormValues) {
    // Here we would save the notification settings to the backend
    console.log("Notification settings:", data);
    toast.success("Configurações de notificação atualizadas!");
  }
  
  function onFinancialSubmit(data: FinancialFormValues) {
    // Here we would save the financial preferences to the backend
    console.log("Financial preferences:", data);
    toast.success("Preferências financeiras atualizadas!");
  }
  
  return (
    <Shell>
      <div className="container py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Perfil e Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências do sistema
          </p>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="financial">
              <CircleDollarSign className="h-4 w-4 mr-2" />
              Finanças
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e configurações de conta
                </CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Este é o seu nome completo que aparecerá em seu perfil.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Este é o email utilizado para login e comunicações do sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobre</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Conte um pouco sobre você e seus objetivos financeiros..."
                            />
                          </FormControl>
                          <FormDescription>
                            Uma breve descrição para seu perfil.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber alertas e lembretes
                </CardDescription>
              </CardHeader>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificações por Email</FormLabel>
                            <FormDescription>
                              Receber notificações por email sobre atividades importantes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="dueDateReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Lembretes de Vencimento</FormLabel>
                            <FormDescription>
                              Receber alertas quando contas estiverem próximas do vencimento
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="goalNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Metas Atingidas</FormLabel>
                            <FormDescription>
                              Receber notificações quando atingir metas financeiras
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="budgetAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Alertas de Orçamento</FormLabel>
                            <FormDescription>
                              Receber alertas quando ultrapassar limites orçamentários
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="dailyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Resumo Diário</FormLabel>
                            <FormDescription>
                              Receber um resumo diário das suas finanças
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="reminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Lembretes</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormDescription>
                            Horário preferido para receber lembretes diários
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          {/* Financial Preferences Tab */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Preferências Financeiras</CardTitle>
                <CardDescription>
                  Configure suas preferências para orçamentos e gestão financeira
                </CardDescription>
              </CardHeader>
              <Form {...financialForm}>
                <form onSubmit={financialForm.handleSubmit(onFinancialSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={financialForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moeda</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Moeda padrão para exibição de valores (ex: BRL, USD)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="defaultViewMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visualização Padrão</FormLabel>
                          <div className="flex gap-4">
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="monthly"
                                  value="monthly"
                                  checked={field.value === "monthly"}
                                  onChange={() => field.onChange("monthly")}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="monthly">Mensal</label>
                              </div>
                            </FormControl>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="yearly"
                                  value="yearly"
                                  checked={field.value === "yearly"}
                                  onChange={() => field.onChange("yearly")}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="yearly">Anual</label>
                              </div>
                            </FormControl>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="all"
                                  value="all"
                                  checked={field.value === "all"}
                                  onChange={() => field.onChange("all")}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="all">Completo</label>
                              </div>
                            </FormControl>
                          </div>
                          <FormDescription>
                            Modo de visualização padrão para relatórios e gráficos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="savingsGoalPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta de Poupança (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" max="100" />
                          </FormControl>
                          <FormDescription>
                            Percentual da renda que deseja poupar mensalmente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="autoCategorizeBills"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-categorizar Contas</FormLabel>
                            <FormDescription>
                              Categorizar automaticamente transações recorrentes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="groupCategories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Agrupar Categorias</FormLabel>
                            <FormDescription>
                              Agrupar categorias similares em relatórios
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
