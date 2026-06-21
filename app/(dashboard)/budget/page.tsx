"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Settings, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { budgetApi } from "@/lib/api";
import { formatCurrency, formatMonth, percentOf, getMonthName } from "@/lib/utils";

const budgetSchema = z.object({
  totalLimit: z.coerce.number().min(100, "Mínimo R$ 100"),
});
type BudgetForm = z.infer<typeof budgetSchema>;

export default function BudgetPage() {
  const [editingBudget, setEditingBudget] = useState(false);
  const qc = useQueryClient();

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ["budget", "daily"],
    queryFn: () => budgetApi.daily().then((r) => r.data),
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["budget", "history"],
    queryFn: () => budgetApi.history().then((r) => r.data),
  });

  const { data: currentBudget } = useQuery({
    queryKey: ["budget", "current"],
    queryFn: () => budgetApi.current().then((r) => r.data),
    enabled: editingBudget,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetForm>({ resolver: zodResolver(budgetSchema) });

  const updateBudgetMutation = useMutation({
    mutationFn: async (data: BudgetForm) => {
      if (!currentBudget) throw new Error("Budget not loaded");
      return budgetApi.update(currentBudget.id, { totalLimit: data.totalLimit });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Orçamento atualizado!");
      setEditingBudget(false);
    },
    onError: () => toast.error("Erro ao atualizar orçamento"),
  });

  const historyChartData = (Array.isArray(history) ? history : []).map((b) => ({
    month: getMonthName(b.month),
    limite: b.totalLimit,
    gasto: b.spent,
  }));

  return (
    <div>
      <Header title="Orçamento" subtitle="Controle seu orçamento mensal" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Budget config row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loadingDaily ? (
            <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
          ) : daily ? (
            <>
              {/* Current Budget */}
              <Card>
                <CardHeader>
                  <CardTitle>Orçamento de {formatMonth(daily.period.year, daily.period.month)}</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => setEditingBudget(true)}>
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <div className="text-4xl font-light text-slate-100 mb-1">
                  {formatCurrency(daily.total_budget)}
                </div>
                <p className="text-xs text-slate-500 mb-4">orçamento total do mês</p>
                <Progress value={percentOf(daily.total_spent, daily.total_budget)} className="mb-3" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gasto: <span className="text-danger font-medium">{formatCurrency(daily.total_spent)}</span></span>
                  <span className="text-slate-500">Restam: <span className="text-success font-medium">{formatCurrency(daily.remaining_budget)}</span></span>
                </div>
              </Card>

              {/* Daily Limit */}
              <Card>
                <CardHeader>
                  <CardTitle>Limite diário hoje</CardTitle>
                  <TrendingUp className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <div className="text-4xl font-light text-teal-400 mb-1">
                  {formatCurrency(daily.daily_limit)}
                </div>
                <p className="text-xs text-slate-500 mb-4">recalculado automaticamente</p>
                <div className="rounded-xl bg-navy-900/60 px-3 py-2.5 border border-navy-700/50">
                  <p className="text-xs text-slate-400">
                    {daily.remaining_budget > 0
                      ? `${formatCurrency(daily.remaining_budget)} ÷ ${daily.remaining_days} dias`
                      : "Orçamento esgotado este mês"}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-3 text-center">
                  Restam {daily.remaining_days} dias no período
                </p>
              </Card>

              {/* Spent today */}
              <Card>
                <CardHeader>
                  <CardTitle>Gasto hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <div className={`text-4xl font-light mb-1 ${daily.spent_today > daily.daily_limit ? "text-danger" : "text-slate-100"}`}>
                  {formatCurrency(daily.spent_today)}
                </div>
                <p className="text-xs text-slate-500 mb-4">de {formatCurrency(daily.daily_limit)} do limite</p>
                <Progress value={percentOf(daily.spent_today, daily.daily_limit)} className="mb-3" />
                <div className="text-center text-xs text-slate-500">
                  {daily.remaining_today >= 0
                    ? `Ainda tem ${formatCurrency(daily.remaining_today)} para gastar hoje`
                    : `Passou ${formatCurrency(Math.abs(daily.remaining_today))} do limite`}
                </div>
              </Card>
            </>
          ) : null}
        </div>

        {/* Edit budget modal */}
        {editingBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingBudget(false)} />
            <div className="relative w-full max-w-sm rounded-2xl border border-navy-700/50 bg-navy-800 p-6 shadow-2xl animate-slide-up">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Editar orçamento</h2>
              <form onSubmit={handleSubmit((d) => updateBudgetMutation.mutate(d))} className="space-y-4">
                <Input
                  label="Orçamento mensal (R$)"
                  type="number"
                  step="100"
                  placeholder={currentBudget ? String(currentBudget.totalLimit) : "3000"}
                  error={errors.totalLimit?.message}
                  {...register("totalLimit")}
                />
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" fullWidth onClick={() => setEditingBudget(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" fullWidth loading={isSubmitting || updateBudgetMutation.isPending}>
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico mensal</CardTitle>
            <span className="text-xs text-slate-500">Limite vs gasto</span>
          </CardHeader>
          {loadingHistory ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Carregando...</p>
            </div>
          ) : historyChartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Sem histórico disponível</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={historyChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "limite" ? "Limite" : "Gasto",
                  ]}
                  contentStyle={{
                    backgroundColor: "#162036",
                    border: "1px solid rgba(46,207,228,0.15)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="limite" fill="#2ECFE4" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="gasto" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* History table */}
        {Array.isArray(history) && history.length > 0 && (
          <Card className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-navy-700/50">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Detalhamento por mês</h3>
            </div>
            <div className="divide-y divide-navy-700/30">
              {history.map((b) => (
                <div key={b.id} className="grid grid-cols-3 gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {formatMonth(b.year, b.month)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {percentOf(b.spent, b.totalLimit)}% usado
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Limite</p>
                    <p className="text-sm font-medium text-teal-400">{formatCurrency(b.totalLimit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Gasto</p>
                    <p className={`text-sm font-medium ${b.isOverBudget ? "text-danger" : "text-slate-200"}`}>
                      {formatCurrency(b.spent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
