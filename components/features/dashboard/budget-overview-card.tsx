"use client";
import { Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, percentOf, formatMonth } from "@/lib/utils";
import type { DailyBudget } from "@/types";

interface Props {
  data: DailyBudget;
}

export function BudgetOverviewCard({ data }: Props) {
  const spentPercent = percentOf(data.total_spent, data.total_budget);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento mensal</CardTitle>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          {formatMonth(data.period.year, data.period.month)}
        </div>
      </CardHeader>

      {/* Main stat */}
      <div className="space-y-1 mb-4">
        <div className="text-4xl font-light text-slate-100">
          {formatCurrency(data.remaining_budget)}
        </div>
        <p className="text-xs text-slate-500">restam no mês</p>
      </div>

      <Progress value={spentPercent} className="mb-3" />

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-navy-900/60 p-3 border border-navy-700/50">
          <p className="text-xs text-slate-500 mb-1">Gasto</p>
          <p className="text-sm font-medium text-danger">{formatCurrency(data.total_spent)}</p>
        </div>
        <div className="rounded-xl bg-navy-900/60 p-3 border border-navy-700/50">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-sm font-medium text-slate-300">{formatCurrency(data.total_budget)}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {data.remaining_days} dias restantes · {spentPercent}% usado
      </div>
    </Card>
  );
}
