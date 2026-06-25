"use client";
import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus, RefreshCw, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { accountsApi, openFinanceApi } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { AccountType } from "@/types";

declare global {
  interface Window {
    PluggyConnect: new (config: {
      connectToken: string;
      includeSandbox: boolean;
      onSuccess: (data: { item: { id: string } }) => void;
      onError: (error: unknown) => void;
      onClose: () => void;
    }) => { init: () => void };
  }
}

const accountTypeLabel: Record<AccountType, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  credit: "Cartão de Crédito",
  investment: "Investimentos",
};

const bankColors: Record<string, string> = {
  Nubank: "#820ad1",
  Itaú: "#EC7000",
  Bradesco: "#cc092f",
  "Banco do Brasil": "#FFDB01",
  Santander: "#ec0000",
  XP: "#000",
  BTG: "#003399",
  Inter: "#FF7A00",
};

export default function AccountsPage() {
  const qc = useQueryClient();

  // Carrega o script do Pluggy Widget uma vez
  useEffect(() => {
    if (document.getElementById("pluggy-connect-script")) return;
    const script = document.createElement("script");
    script.id = "pluggy-connect-script";
    script.src = "https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsApi.list().then((r) => r.data),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => accountsApi.sync(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Sincronização enfileirada!");
    },
    onError: () => toast.error("Erro ao sincronizar conta"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta desvinculada");
    },
    onError: () => toast.error("Erro ao desvincular conta"),
  });

  const handleConnect = useCallback(async () => {
    try {
      const { data } = await openFinanceApi.connectToken();
      const { connectToken } = data;

      if (!window.PluggyConnect) {
        toast.error("Widget do Pluggy não carregou. Verifique sua conexão.");
        return;
      }

      const widget = new window.PluggyConnect({
        connectToken,
        includeSandbox: true,
        onSuccess: async ({ item }) => {
          toast.success("Banco conectado! Importando transações...");
          try {
            await openFinanceApi.syncItem(item.id);
          } catch {
            // sync enfileirado mesmo com erro de request
          }
          // aguarda uns instantes para o worker processar
          setTimeout(() => {
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: ["budget"] });
            qc.invalidateQueries({ queryKey: ["transactions"] });
          }, 3000);
        },
        onError: (err) => {
          console.error("Pluggy Widget error:", err);
          toast.error("Erro ao conectar banco. Tente novamente.");
        },
        onClose: () => {},
      });

      widget.init();
    } catch {
      toast.error("Não foi possível iniciar a conexão. Tente novamente.");
    }
  }, [qc]);

  const totalBalance = accounts
    ?.filter((a) => a.account_type !== "credit")
    .reduce((acc, a) => acc + a.balance, 0) ?? 0;

  const totalCredit = accounts
    ?.filter((a) => a.account_type === "credit")
    .reduce((acc, a) => acc + a.balance, 0) ?? 0;

  return (
    <div>
      <Header title="Contas Bancárias" subtitle="Gerencie suas contas via Open Finance Brasil" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldo disponível</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <div className="text-3xl font-light text-slate-100">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-slate-500 mt-1">soma das contas correntes e poupança</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fatura de crédito</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <div className="text-3xl font-light text-slate-100">{formatCurrency(totalCredit)}</div>
            <p className="text-xs text-slate-500 mt-1">total de cartões de crédito</p>
          </Card>
        </div>

        {/* Connect CTA */}
        <Card className="border-dashed border-teal-400/20 bg-teal-400/5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-200">Conectar novo banco</h3>
              <p className="text-xs text-slate-500 mt-1">
                Autorize via Open Finance Brasil. Seus dados ficam criptografados e você pode revogar a qualquer momento.
              </p>
            </div>
            <Button variant="outline" className="flex-shrink-0" onClick={handleConnect}>
              <Plus className="h-4 w-4" />
              Conectar banco
            </Button>
          </div>
        </Card>

        {/* Accounts list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : !accounts?.length ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <Landmark className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">Nenhuma conta vinculada</p>
            <p className="text-xs text-slate-500 mt-1">
              Conecte seus bancos via Open Finance para ver tudo em um lugar
            </p>
            <Button variant="outline" className="mt-4" onClick={handleConnect}>
              <Plus className="h-4 w-4" />
              Conectar primeiro banco
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const daysToExpire = acc.consent_expires_at
                ? differenceInDays(parseISO(acc.consent_expires_at), new Date())
                : null;

              return (
                <Card key={acc.id}>
                  <div className="flex items-center gap-4">
                    {/* Bank icon */}
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{
                        background:
                          bankColors[acc.institution_name] ??
                          "linear-gradient(135deg,#2ECFE4,#6366f1)",
                      }}
                    >
                      {(acc.institution_name ?? "").slice(0, 2).toUpperCase() || ""}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-200">
                          {acc.institution_name}
                        </p>
                        <Badge variant="default">
                          {accountTypeLabel[acc.account_type] ?? acc.account_type}
                        </Badge>
                        {daysToExpire !== null && daysToExpire <= 30 && (
                          <Badge variant="warning">
                            <AlertCircle className="h-3 w-3" />
                            Consentimento expira em {daysToExpire}d
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.name}</p>
                      {acc.last_sync_at && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          Última sync: {formatShortDate(acc.last_sync_at)}
                        </p>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-lg font-semibold ${
                          acc.balance >= 0 ? "text-slate-100" : "text-danger"
                        }`}
                      >
                        {formatCurrency(acc.balance)}
                      </p>
                      {acc.credit_limit && (
                        <p className="text-xs text-slate-500">
                          Limite: {formatCurrency(acc.credit_limit)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => syncMutation.mutate(acc.id)}
                        loading={syncMutation.isPending}
                        title="Sincronizar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm("Desvincular conta e revogar consentimento Open Finance?")) {
                            deleteMutation.mutate(acc.id);
                          }
                        }}
                        title="Desvincular"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
