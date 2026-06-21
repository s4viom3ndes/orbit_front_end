"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, percentOf, classifyBudgetStatus } from "@/lib/utils";
import type { DailyBudget } from "@/types";

interface Props {
  data: DailyBudget;
}

export function DailyLimitCard({ data }: Props) {
  const status = classifyBudgetStatus(data.status);
  const spentPercent = percentOf(data.spent_today, data.daily_limit);

  const StatusIcon =
    data.status === "on_track"
      ? TrendingUp
      : data.status === "over_budget"
      ? TrendingDown
      : Minus;

  return (
    <Card className="relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #2ECFE4, transparent)" }} />

      <CardHeader>
        <CardTitle>Limite hoje</CardTitle>
        <Badge variant={data.status === "on_track" ? "teal" : data.status === "warning" ? "warning" : "danger"}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </CardHeader>

      <div className="space-y-1 mb-4">
        <div className="text-4xl font-light text-slate-100">
          {formatCurrency(data.daily_limit)}
        </div>
        <p className="text-xs text-slate-500">de limite diário disponível</p>
      </div>

      <Progress value={spentPercent} className="mb-3" />

      <div className="flex justify-between text-xs text-slate-500">
        <span>Gasto hoje: <span className="text-slate-300">{formatCurrency(data.spent_today)}</span></span>
        <span>Restam: <span className="text-slate-300">{formatCurrency(data.remaining_today)}</span></span>
      </div>

      {/* Context message — Orbit voice */}
      <div className="mt-4 rounded-xl bg-navy-900/60 px-3 py-2.5 border border-navy-700/50">
        <p className="text-xs text-slate-400">
          {data.status === "on_track"
            ? `Seu limite hoje é ${formatCurrency(data.daily_limit)}. Ainda dá para o almoço.`
            : data.status === "warning"
            ? `Você está chegando no seu limite de hoje. Atenção nos próximos gastos.`
            : `Você passou do limite de hoje em ${formatCurrency(Math.abs(data.remaining_today))}. Segura o próximo café.`}
        </p>
      </div>
    </Card>
  );
}
