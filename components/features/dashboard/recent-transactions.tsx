"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  loading?: boolean;
}

export function RecentTransactions({ transactions, loading }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Últimas transações</CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      {loading ? (
        <div className="space-y-1 divide-y divide-navy-700/30">
          {[1, 2, 3, 4, 5].map((i) => <TransactionSkeleton key={i} />)}
        </div>
      ) : !transactions.length ? (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-slate-500">Nenhuma transação ainda.</p>
          <Link href="/transactions" className="text-xs text-teal-400 hover:underline mt-1">
            Adicionar transação manual
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-navy-700/30">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </Card>
  );
}

function TransactionRow({ transaction: tx }: { transaction: Transaction }) {
  const isIncome = tx.type === "income";
  const isTransfer = tx.type === "transfer";

  return (
    <div className="flex items-center gap-3 py-3 hover:bg-navy-900/40 rounded-xl px-2 -mx-2 transition-colors cursor-pointer">
      {/* Icon */}
      <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isIncome ? "bg-success/10" : isTransfer ? "bg-indigo-500/10" : "bg-danger/10"
      }`}>
        {isIncome ? (
          <ArrowUpRight className="h-4 w-4 text-success" />
        ) : isTransfer ? (
          <ArrowRight className="h-4 w-4 text-indigo-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-danger" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {tx.description_clean ?? tx.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
          {tx.category && (
            <span className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tx.category.color }}
              />
              <span className="text-xs text-slate-600">{tx.category.name}</span>
            </span>
          )}
          {tx.is_recurring && (
            <Badge variant="info" className="text-[10px] px-1.5 py-0">
              <RefreshCw className="h-2.5 w-2.5" />
              Recorrente
            </Badge>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${isIncome ? "text-success" : "text-slate-200"}`}>
          {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
        </p>
        {tx.account && (
          <p className="text-xs text-slate-600">{tx.account.institution_name}</p>
        )}
      </div>
    </div>
  );
}
