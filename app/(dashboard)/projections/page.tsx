"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { projectionsApi } from "@/lib/api";
import { formatCurrency, formatMonth } from "@/lib/utils";

function monthFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return names[d.getUTCMonth()];
}

function formatMonthFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  return formatMonth(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export default function ProjectionsPage() {
  const { data: projectionData, isLoading, refetch } = useQuery({
    queryKey: ["projections"],
    queryFn: () => projectionsApi.list().then((r) => r.data),
  });

  const projections = projectionData?.projections ?? [];
  const summary = projectionData?.summary;

  const generateMutation = useMutation({
    mutationFn: () => projectionsApi.generate(6),
    onSuccess: () => {
      refetch();
      toast.success("Projeções recalculadas!");
    },
    onError: () => toast.error("Erro ao recalcular projeções"),
  });

  const chartData = projections.map((p) => ({
    month: monthFromDate(p.date),
    saldo: p.projectedBalance,
    confianca: p.confidencePercent,
  }));

  const positiveMonths = projections.filter((p) => p.isPositive).length;
  const negativeMonths = projections.filter((p) => !p.isPositive).length;
  const avgBalance = projections.length
    ? projections.reduce((acc, p) => acc + p.projectedBalance, 0) / projections.length
    : 0;

  return (
    <div>
      <Header
        title="Projeções"
        subtitle="Visão financeira para os próximos 6 meses"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Summary cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Meses positivos</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <div className="text-4xl font-light text-success">{positiveMonths}</div>
              <p className="text-xs text-slate-500 mt-1">dos próximos {projections.length || 6} meses</p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Meses negativos</CardTitle>
                <TrendingDown className="h-4 w-4 text-danger" />
              </CardHeader>
              <div className={`text-4xl font-light ${negativeMonths > 0 ? "text-danger" : "text-slate-500"}`}>
                {negativeMonths}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {negativeMonths > 0 ? "atenção necessária" : "tudo certo"}
              </p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saldo médio projetado</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  loading={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <div className={`text-4xl font-light ${avgBalance >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(avgBalance)}
              </div>
              <p className="text-xs text-slate-500 mt-1">média dos {projections.length || 6} meses</p>
            </Card>
          </div>
        )}

        {/* Summary insights */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Saldo atual</p>
              <p className={`text-lg font-semibold ${summary.currentBalance >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(summary.currentBalance)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Receita média/mês</p>
              <p className="text-lg font-semibold text-success">{formatCurrency(summary.avgMonthlyIncome)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Despesa média/mês</p>
              <p className="text-lg font-semibold text-danger">{formatCurrency(summary.avgMonthlyExpenses)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Fluxo mensal projetado</p>
              <p className={`text-lg font-semibold ${summary.projectedNetFlow >= 0 ? "text-success" : "text-danger"}`}>
                {summary.projectedNetFlow >= 0 ? "+" : ""}{formatCurrency(summary.projectedNetFlow)}
              </p>
            </Card>
          </div>
        )}

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Saldo projetado por mês</CardTitle>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-400" />Saldo
              </span>
            </div>
          </CardHeader>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Carregando projeções...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-slate-600" />
              <p className="text-slate-500 text-sm">Sem dados de projeção disponíveis</p>
              <p className="text-xs text-slate-600">Você precisa de pelo menos 30 dias de histórico</p>
              <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>
                <RefreshCw className="h-3.5 w-3.5" />
                Calcular agora
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECFE4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ECFE4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Saldo projetado"]}
                  contentStyle={{
                    backgroundColor: "#162036",
                    border: "1px solid rgba(46,207,228,0.15)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Area type="monotone" dataKey="saldo" stroke="#2ECFE4" strokeWidth={2} fill="url(#balanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Detail cards */}
        {projections.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {projections.map((p) => (
              <Card key={p.id} hover>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-300">
                    {formatMonthFromDate(p.date)}
                  </p>
                  <Badge variant={p.confidencePercent >= 70 ? "teal" : p.confidencePercent >= 50 ? "warning" : "default"}>
                    {p.confidencePercent}% confiança
                  </Badge>
                </div>

                <div className={`text-2xl font-semibold mb-3 ${p.isPositive ? "text-success" : "text-danger"}`}>
                  {p.isPositive ? "+" : ""}{formatCurrency(p.projectedBalance)}
                </div>

                {summary && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Receita prevista</span>
                      <span className="text-success">{formatCurrency(summary.avgMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Despesa prevista</span>
                      <span className="text-danger">{formatCurrency(summary.avgMonthlyExpenses)}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
