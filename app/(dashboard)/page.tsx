"use client";
import { useQuery } from "@tanstack/react-query";
import { budgetApi, transactionsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { DailyLimitCard } from "@/components/features/dashboard/daily-limit-card";
import { BudgetOverviewCard } from "@/components/features/dashboard/budget-overview-card";
import { SpendingChart } from "@/components/features/dashboard/spending-chart";
import { RecentTransactions } from "@/components/features/dashboard/recent-transactions";
import { AccountsCard } from "@/components/features/dashboard/accounts-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { OnboardingModal } from "@/components/features/dashboard/onboarding-modal";
import { useAuthStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

function NoBudgetCard() {
  return (
    <Card className="lg:col-span-2 flex flex-col justify-center items-center text-center p-8 gap-4">
      <p className="text-slate-300 font-medium">Nenhum orçamento configurado</p>
      <p className="text-slate-500 text-sm">
        Configure um orçamento mensal para ver seu limite diário e começar a controlar seus gastos.
      </p>
      <Link
        href="/settings"
        className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-xl bg-teal-400 text-navy-900 hover:bg-teal-300 transition-colors"
      >
        Configurar orçamento
      </Link>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ["budget", "daily"],
    queryFn: () => budgetApi.daily().then((r) => r.data),
    refetchInterval: 60 * 1000,
    retry: false,
  });

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: () => transactionsApi.summary().then((r) => r.data),
  });

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () =>
      transactionsApi.list({ per_page: 8 }).then((r) => r.data),
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const showOnboarding = !loadingDaily && !daily;

  return (
    <div>
      {showOnboarding && user && <OnboardingModal userName={user.name} />}
      <Header
        title={`${greeting()}, ${user?.name?.split(" ")[0] ?? ""}!`}
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Row 1: Daily + Budget overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loadingDaily ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : daily ? (
            <>
              <DailyLimitCard data={daily} />
              <BudgetOverviewCard data={daily} />
              <AccountsCard />
            </>
          ) : (
            <>
              <NoBudgetCard />
              <AccountsCard />
            </>
          )}
        </div>

        {/* Row 2: Chart + Recent transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <SpendingChart data={summary ?? []} loading={loadingSummary} />
          </div>
          <div className="lg:col-span-3">
            <RecentTransactions
              transactions={recent?.data ?? []}
              loading={loadingRecent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
