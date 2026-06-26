"use client";
import { useQuery } from "@tanstack/react-query";
import { Check, AlertTriangle, CalendarDays } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { budgetApi } from "@/lib/api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function DailySpendingCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["budget", "daily-breakdown"],
    queryFn: () => budgetApi.dailyBreakdown().then((r) => r.data),
    retry: false,
  });

  const days = data?.days ?? [];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-navy-700/50">
        <CardTitle>Gastos dia a dia</CardTitle>
        {data && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            meta de {formatCurrency(data.daily_target)}/dia
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          Carregando...
        </div>
      ) : days.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-400">Nenhum gasto este mês ainda.</p>
          <p className="text-xs text-slate-600 mt-1">
            Quando chegarem transações, seu balanço diário aparece aqui.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-navy-700/30 max-h-[420px] overflow-y-auto">
          {days.map((day) => {
            const over = day.status === "over_budget";
            const diff = Math.abs(day.remaining);
            return (
              <div
                key={day.date}
                className="grid grid-cols-[1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-navy-900/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    {formatDate(day.date)}
                  </p>
                  <p className={cn("text-xs mt-0.5", over ? "text-danger" : "text-success")}>
                    {over
                      ? `Passou ${formatCurrency(diff)} do limite do dia`
                      : `Sobrou ${formatCurrency(diff)} do limite do dia`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        over ? "text-danger" : "text-slate-200"
                      )}
                    >
                      {formatCurrency(day.spent)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      de {formatCurrency(day.limit)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
                      over ? "bg-danger/10" : "bg-success/10"
                    )}
                  >
                    {over ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-danger" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-success" />
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
