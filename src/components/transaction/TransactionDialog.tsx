
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Transaction, TransactionCategory, TransactionType, useTransactions, categoryLabels } from "@/context/TransactionContext";

// Schema for form validation
const transactionFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  type: z.enum(["income", "expense"]),
  category: z.string(),
  date: z.date(),
  dueDate: z.date().optional(),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  isVariable: z.boolean().default(false),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function TransactionDialog({ 
  open, 
  onOpenChange, 
  transaction 
}: TransactionDialogProps) {
  const { addTransaction, updateTransaction, categoryLabels } = useTransactions();
  const isEditing = !!transaction;

  // Set default values for the form
  const defaultValues: Partial<TransactionFormValues> = {
    title: transaction?.title || "",
    amount: transaction?.amount || 0,
    type: transaction?.type || "expense",
    category: transaction?.category || "",
    date: transaction?.date ? new Date(transaction.date) : new Date(),
    dueDate: transaction?.dueDate ? new Date(transaction.dueDate) : undefined,
    isPaid: transaction?.isPaid || false,
    isRecurring: transaction?.isRecurring || false,
    isVariable: transaction?.isVariable || false,
    source: transaction?.source || "",
    notes: transaction?.notes || "",
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  // Reset form when transaction changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, transaction, form, defaultValues]);

  // Watch for type changes to filter categories
  const watchedType = form.watch("type");
  const watchedIsRecurring = form.watch("isRecurring");

  // Filter categories based on transaction type
  const filteredCategories = Object.entries(categoryLabels)
    .filter(([key, _]) => {
      if (watchedType === "income") {
        return key.includes("income") || key === "salary" || key === "investment" || key === "bonus";
      } else {
        return !key.includes("income");
      }
    })
    .map(([key, value]) => ({ value: key, label: value }));

  function onSubmit(data: TransactionFormValues) {
    // Format dates to ISO string
    const formattedData = {
      ...data,
      date: data.date.toISOString().split('T')[0],
      dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : undefined,
    };

    if (isEditing && transaction) {
      updateTransaction(transaction.id, formattedData as Partial<Transaction>);
    } else {
      addTransaction(formattedData as Omit<Transaction, 'id'>);
    }
    
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifique os detalhes da transação existente" 
              : "Preencha os detalhes da nova transação"}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Aluguel, Salário, Conta de Luz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transaction Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                          <Input className="pl-8" {...field} type="number" step="0.01" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transaction Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Transação</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date - Show only for expenses */}
                {watchedType === "expense" && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Source / Origin - Full width */}
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Origem / Fonte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Empresa XYZ, Cartão Nubank" {...field} />
                      </FormControl>
                      <FormDescription>
                        {watchedType === "income" 
                          ? "De onde vem esta receita?" 
                          : "Qual meio de pagamento ou origem desta despesa?"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Checkboxes row */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                  {/* Is Paid */}
                  <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Pago/Recebido</FormLabel>
                          <FormDescription>
                            {watchedType === "income" 
                              ? "Esta receita já foi recebida?" 
                              : "Esta despesa já foi paga?"}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Is Recurring */}
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Recorrente</FormLabel>
                          <FormDescription>
                            Esta transação se repete mensalmente?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Is Variable - Only for expenses */}
                  {watchedType === "expense" && (
                    <FormField
                      control={form.control}
                      name="isVariable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Valor Variável</FormLabel>
                            <FormDescription>
                              O valor desta despesa varia mensalmente?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais sobre esta transação..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Transação
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
