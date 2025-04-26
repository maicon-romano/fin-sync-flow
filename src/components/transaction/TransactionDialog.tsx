import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Transaction,
  useTransactions,
  categoryLabels,
} from "@/context/TransactionContext";

const transactionFormSchema = z.object({
  title: z.string().min(3),
  amount: z.coerce.number().min(0.01),
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

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDialogProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const isEditing = !!transaction;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date(),
      dueDate: undefined,
      isPaid: false,
      isRecurring: false,
      isVariable: false,
      source: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && transaction) {
      form.reset({
        ...transaction,
        date: new Date(transaction.date),
        dueDate: transaction.dueDate
          ? new Date(transaction.dueDate)
          : undefined,
      });
    } else if (open) {
      form.reset();
    }
  }, [open, transaction]);

  const watchedType = form.watch("type");

  const filteredCategories = Object.entries(categoryLabels)
    .filter(([key]) =>
      watchedType === "income"
        ? key.includes("income")
        : !key.includes("income")
    )
    .map(([key, label]) => ({ value: key, label }));

  function onSubmit(data: TransactionFormValues) {
    const payload: Omit<Transaction, "id"> = {
      ...data,
      date: data.date.toISOString().split("T")[0],
      dueDate: data.dueDate
        ? data.dueDate.toISOString().split("T")[0]
        : undefined,
    };

    if (isEditing && transaction) {
      updateTransaction(transaction.id, payload);
    } else {
      addTransaction(payload);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo com os dados da sua receita ou despesa.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Aluguel, Salário, Conta de Luz"
                        />
                      </FormControl>
                      <FormDescription>
                        Descreva o nome da transação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="type"
                  control={form.control}
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

                <FormField
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            R$
                          </span>
                          <Input
                            className="pl-8"
                            type="number"
                            step="0.01"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Informe o valor da transação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione:" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredCategories.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Transação</FormLabel>
                      <Popover
                        open={showDatePicker}
                        onOpenChange={setShowDatePicker}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal"
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
                                : "Selecione uma data"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-auto p-0 z-[100]"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(val) => {
                              field.onChange(val);
                              setShowDatePicker(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedType === "expense" && (
                  <FormField
                    name="dueDate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento</FormLabel>
                        <Popover
                          open={showDueDatePicker}
                          onOpenChange={setShowDueDatePicker}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal"
                              >
                                {field.value
                                  ? format(field.value, "dd/MM/yyyy", {
                                      locale: ptBR,
                                    })
                                  : "Selecione uma data"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-auto p-0 z-[100]"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(val) => {
                                field.onChange(val);
                                setShowDueDatePicker(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  name="source"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Origem / Fonte</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Cartão Nubank, Empresa XYZ"
                        />
                      </FormControl>
                      <FormDescription>
                        Informe de onde vem essa receita ou qual o meio de
                        pagamento da despesa.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {[
                  "isPaid",
                  "isRecurring",
                  watchedType === "expense" ? "isVariable" : null,
                ]
                  .filter(Boolean)
                  .map((name) => (
                    <FormField
                      key={name as string}
                      name={name as keyof TransactionFormValues}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="capitalize">
                            {name === "isPaid"
                              ? "Despesa Paga"
                              : name === "isRecurring"
                              ? "Transação Recorrente"
                              : "Valor Variável"}
                          </FormLabel>
                          <FormDescription>
                            {name === "isPaid"
                              ? "A despesa já foi quitada ou a receita recebida."
                              : name === "isRecurring"
                              ? "Essa transação se repete todos os meses."
                              : "O valor dessa transação muda mensalmente."}
                          </FormDescription>
                          <Select
                            onValueChange={(val) =>
                              field.onChange(val === "true")
                            }
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                <FormField
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Adicione qualquer detalhe relevante..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Campo opcional para anotações ou descrições adicionais.
                      </FormDescription>
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
                  <X className="h-4 w-4 mr-2" /> Cancelar
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
