"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transactionsApi } from "@/lib/api";
import type { Account, Category } from "@/types";

const schema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  date: z.string(),
  categoryId: z.string().optional(),
  accountId: z.string()
});

type FormData = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTransactionModal({ categories, accounts, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    },
  });



  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);


  const onSubmit = async (data: FormData) => {
    try {
      console.log(data);
      await transactionsApi.create(data);
      toast.success("Transação adicionada!");
      onSuccess();
    } catch {
      console.log("erro");
      toast.error("Erro ao adicionar transação");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-navy-700/50 bg-navy-800 p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Nova transação</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-navy-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((type) => (
                <label key={type} className={`cursor-pointer block text-center py-2 rounded-xl border text-sm font-medium transition-all ${
                  type === "EXPENSE"
                    ? "border-danger/30 text-danger has-[:checked]:bg-danger/10"
                    : type === "INCOME"
                    ? "border-success/30 text-success has-[:checked]:bg-success/10"
                    : "border-indigo-500/30 text-indigo-400 has-[:checked]:bg-indigo-500/10"
                } hover:opacity-80`}>
                  <input type="radio" value={type} {...register("type")} className="sr-only" />
                  <span>{type === "EXPENSE" ? "Despesa" : type === "INCOME" ? "Receita" : "Transfer."}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Descrição"
            placeholder="Ex: Almoço no restaurante"
            error={errors.description?.message}
            {...register("description")}
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          

          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Conta</label>
            <select
              {...register("accountId")}
              className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} - Saldo: R${acc.balance}</option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Categoria</label>
            <select
              {...register("categoryId")}
              className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
