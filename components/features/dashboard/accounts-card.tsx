"use client";
import { useQuery } from "@tanstack/react-query";
import { Landmark, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { accountsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { AccountType } from "@/types";

const accountTypeLabel: Record<AccountType, string> = {
  checking: "Corrente",
  savings: "Poupança",
  credit: "Crédito",
  investment: "Investimento",
};

export function AccountsCard() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsApi.list().then((r) => r.data),
  });

  const totalBalance = accounts?.reduce((acc, a) => {
    if (a.account_type !== "credit") return acc + a.balance;
    return acc;
  }, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas vinculadas</CardTitle>
        <Link href="/accounts">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3" />
            Conectar
          </Button>
        </Link>
      </CardHeader>

      {/* Total */}
      <div className="space-y-1 mb-4">
        <div className="text-4xl font-light text-slate-100">
          {formatCurrency(totalBalance)}
        </div>
        <p className="text-xs text-slate-500">saldo total disponível</p>
      </div>

      {/* Accounts list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : !accounts?.length ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Landmark className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">Nenhuma conta conectada.</p>
          <Link href="/accounts" className="text-xs text-teal-400 hover:underline mt-1">
            Conectar via Open Finance
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.slice(0, 3).map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-xl bg-navy-900/60 px-3 py-2.5 border border-navy-700/50"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-navy-700 flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">{acc.institution_name}</p>
                  <p className="text-xs text-slate-600">{accountTypeLabel[acc.account_type]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${acc.balance >= 0 ? "text-slate-200" : "text-danger"}`}>
                  {formatCurrency(acc.balance)}
                </p>
              </div>
            </div>
          ))}
          {accounts.length > 3 && (
            <Link href="/accounts" className="block text-center text-xs text-slate-500 hover:text-teal-400 transition-colors mt-1">
              +{accounts.length - 3} mais contas
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
