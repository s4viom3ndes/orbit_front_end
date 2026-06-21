"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { TransactionSummary } from "@/types";

interface Props {
  data: TransactionSummary[];
  loading?: boolean;
}

const FALLBACK_COLORS = [
  "#2ECFE4", "#6366f1", "#f59e0b", "#22c55e",
  "#ef4444", "#a855f7", "#3b82f6", "#f97316",
];

export function SpendingChart({ data, loading }: Props) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Gastos por categoria</CardTitle></CardHeader>
        <div className="flex items-center justify-center h-52">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader><CardTitle>Gastos por categoria</CardTitle></CardHeader>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">Nenhuma transação no período</p>
        </div>
      </Card>
    );
  }

  const chartData = data.slice(0, 7).map((item, i) => ({
    name: item.category_name,
    value: item.total,
    color: item.category_color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    percentage: item.percentage,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
        <span className="text-xs text-slate-500">este mês</span>
      </CardHeader>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), ""]}
            contentStyle={{
              backgroundColor: "#162036",
              border: "1px solid rgba(46,207,228,0.15)",
              borderRadius: "12px",
              color: "#f1f5f9",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-slate-400">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{item.percentage}%</span>
              <span className="text-xs font-medium text-slate-300">{formatCurrency(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
