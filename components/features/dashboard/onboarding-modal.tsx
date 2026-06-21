"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Orbit, DollarSign, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { budgetApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Props {
  userName: string;
}

const BUDGET_PRESETS = [
  { label: "R$ 2.000", value: 2000 },
  { label: "R$ 3.500", value: 3500 },
  { label: "R$ 5.000", value: 5000 },
  { label: "R$ 8.000", value: 8000 },
];

export function OnboardingModal({ userName }: Props) {
  const qc = useQueryClient();
  const [budget, setBudget] = useState("");
  const [rawValue, setRawValue] = useState(0);
  const now = new Date();

  const mutation = useMutation({
    mutationFn: async (totalLimit: number) => {
      try {
        return await budgetApi.create({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          totalLimit,
        });
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 409) {
          const existing = await budgetApi.current();
          return budgetApi.update(existing.data.id, { totalLimit });
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Orçamento configurado! Bem-vindo ao Orbit.");
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Erro ao configurar orçamento. Tente novamente."),
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(digits || "0", 10) / 100;
    setRawValue(numericValue);
    setBudget(digits ? formatCurrency(numericValue) : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawValue < 100) {
      toast.error("O orçamento mínimo é R$ 100,00");
      return;
    }
    mutation.mutate(rawValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-800 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2ECFE4, #6366f1)" }}
            >
              <Orbit className="h-7 w-7 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-100 text-center">
            Olá, {userName.split(" ")[0]}! 👋
          </h2>
          <p className="text-slate-400 text-sm text-center mt-2 mb-6">
            Para calcular seu limite diário, precisamos saber quanto você quer gastar esse mês.
          </p>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setRawValue(p.value);
                  setBudget(formatCurrency(p.value));
                }}
                className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                  rawValue === p.value
                    ? "bg-teal-400/15 border-teal-400/50 text-teal-400"
                    : "bg-navy-900 border-navy-700/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Budget input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Orçamento mensal personalizado
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={budget}
                  onChange={handleInput}
                  className="w-full h-11 pl-9 pr-4 rounded-xl bg-navy-900 border border-navy-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400/50 text-sm"
                />
              </div>
            </div>

            {rawValue > 0 && (
              <p className="text-xs text-slate-500 text-center">
                Seu limite diário estimado será{" "}
                <span className="text-teal-400 font-medium">
                  {formatCurrency(rawValue / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}
                </span>
                /dia
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={mutation.isPending}
              disabled={rawValue < 100}
            >
              Começar a controlar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Você pode alterar isso a qualquer momento em Configurações
        </p>
      </div>
    </div>
  );
}
