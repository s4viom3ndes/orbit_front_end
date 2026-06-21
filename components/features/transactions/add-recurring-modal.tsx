"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, RefreshCw, CalendarDays, Hash, Infinity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transactionsApi } from "@/lib/api";
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { Category } from "@/types";

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "Descrição obrigatória").max(255),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  recurringDay: z.coerce.number().int().min(1, "Mín. 1").max(31, "Máx. 31"),
  occurrences: z.coerce.number().int().min(1, "Mín. 1").max(24, "Máx. 24"),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function getOccurrencePreview(recurringDay: number, occurrences: number): string[] {
  const now = new Date();
  const months: string[] = [];
  const count = Math.min(occurrences, 4);
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(formatMonth(d.getFullYear(), d.getMonth() + 1));
  }
  if (occurrences > 4) months.push(`+${occurrences - 4} meses`);
  return months;
}

export function AddRecurringModal({ categories, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indefinite, setIndefinite] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "INCOME",
      recurringDay: new Date().getDate(),
      occurrences: 6,
    },
  });

  const watchedType = watch("type");
  const watchedAmount = watch("amount");
  const watchedDay = watch("recurringDay");
  const watchedOccurrences = watch("occurrences");

  useEffect(() => {
    if (indefinite) setValue("occurrences", 24);
  }, [indefinite, setValue]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await transactionsApi.createRecurring({
        ...data,
        categoryId: data.categoryId || undefined,
      });
      const n = result.data.created;
      toast.success(`${n} transaç${n === 1 ? "ão criada" : "ões criadas"} com sucesso!`);
      onSuccess();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      if (status?.status === 422) {
        toast.error("Você precisa ter uma conta cadastrada para criar transações recorrentes.");
      } else if (status?.status === 400) {
        toast.error(status.data?.message ?? "Dados inválidos. Verifique os campos.");
      } else {
        toast.error("Erro ao criar transações recorrentes.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const preview = getOccurrencePreview(watchedDay || 1, watchedOccurrences || 1);
  const totalValue = (Number(watchedAmount) || 0) * (indefinite ? 24 : (watchedOccurrences || 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-navy-700/50 bg-navy-800 p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-400/10 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Transação recorrente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-navy-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type toggle */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(["INCOME", "EXPENSE"] as const).map((t) => {
                const selected = watchedType === t;
                const isIncome = t === "INCOME";
                return (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" value={t} {...register("type")} className="sr-only" />
                    <span
                      className={[
                        "flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 select-none",
                        selected
                          ? isIncome
                            ? "bg-success/15 border-success/50 text-success shadow-sm shadow-success/10"
                            : "bg-danger/15 border-danger/50 text-danger shadow-sm shadow-danger/10"
                          : isIncome
                            ? "bg-navy-900 border-navy-700 text-slate-400 hover:border-success/30 hover:text-success/80 hover:bg-success/5 active:scale-95"
                            : "bg-navy-900 border-navy-700 text-slate-400 hover:border-danger/30 hover:text-danger/80 hover:bg-danger/5 active:scale-95",
                      ].join(" ")}
                    >
                      {isIncome ? "Receita" : "Despesa"}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <Input
            label="Descrição"
            placeholder={watchedType === "INCOME" ? "Ex: Salário, Freelance..." : "Ex: Aluguel, Plano de saúde..."}
            error={errors.description?.message}
            {...register("description")}
          />

          <Input
            label="Valor por ocorrência (R$)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register("amount")}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Day of month */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                Dia do mês
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="5"
                className="w-full h-11 px-4 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 text-sm transition-colors"
                {...register("recurringDay")}
              />
              {errors.recurringDay && (
                <p className="text-xs text-danger">{errors.recurringDay.message}</p>
              )}
            </div>

            {/* Occurrences */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-500" />
                Ocorrências
              </label>
              <input
                type="number"
                min="1"
                max="24"
                placeholder="6"
                disabled={indefinite}
                className="w-full h-11 px-4 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                {...register("occurrences")}
              />
              {errors.occurrences && !indefinite && (
                <p className="text-xs text-danger">{errors.occurrences.message}</p>
              )}
            </div>
          </div>

          {/* Indefinite toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setIndefinite((v) => !v)}
              className={[
                "relative h-5 w-9 rounded-full transition-colors duration-200 flex-shrink-0",
                indefinite ? "bg-teal-400" : "bg-navy-700 group-hover:bg-navy-600",
              ].join(" ")}
            >
              <div
                className={[
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                  indefinite ? "translate-x-4" : "translate-x-0.5",
                ].join(" ")}
              />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              <Infinity className="h-3.5 w-3.5" />
              A perder de vista
              {indefinite && (
                <span className="text-xs text-slate-600">(24 meses)</span>
              )}
            </span>
          </label>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Categoria</label>
            <select
              {...register("categoryId")}
              className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/60 focus:outline-none focus:ring-1 focus:ring-teal-400/20 transition-colors"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {watchedDay >= 1 && watchedDay <= 31 && (
            <div className="rounded-xl bg-navy-900/60 border border-navy-700/50 px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-slate-400">Prévia</p>
              {indefinite ? (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Infinity className="h-3 w-3 text-teal-400" />
                  Todo dia {watchedDay}, todos os meses, pelos próximos 24 meses
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {preview.map((m, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {totalValue > 0 && (
                <p className="text-xs text-slate-500">
                  Total acumulado:{" "}
                  <span className={`font-medium ${watchedType === "INCOME" ? "text-success" : "text-danger"}`}>
                    {watchedType === "INCOME" ? "+" : "-"}{formatCurrency(totalValue)}
                  </span>
                  {indefinite && <span className="text-slate-600"> em 24 meses</span>}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              {indefinite
                ? "Criar 24 transações"
                : `Criar ${watchedOccurrences || ""} transaç${watchedOccurrences === 1 ? "ão" : "ões"}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
