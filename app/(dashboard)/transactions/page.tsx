"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, Tag, Trash2, X, Calendar, Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TransactionSkeleton } from "@/components/ui/skeleton";
import { transactionsApi, categoriesApi, accountsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddTransactionModal } from "@/components/features/transactions/add-transaction-modal";
import { AddRecurringModal } from "@/components/features/transactions/add-recurring-modal";
import type { Transaction, TransactionType, Category } from "@/types";

const TYPE_FILTERS: { label: string; value: TransactionType | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Receitas", value: "INCOME" },
  { label: "Despesas", value: "EXPENSE" },
  { label: "Transferências", value: "TRANSFER" },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [selectedAccountID, setSelectedAccountID] = useState('');
  const qc = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsApi.list().then((r) => r.data),
  });
  
  const hasDateFilter = startDate || endDate;

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", { page, type: typeFilter, search, startDate, endDate, accountsId: selectedAccountID }],
    queryFn: () =>
      transactionsApi
        .list({
          page,
          per_page: 20,
          type: typeFilter === "all" ? undefined : typeFilter,
          search: search || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          accountId: selectedAccountID
        })
        .then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });



  const recategorizeMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.recategorize(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Recategorizado com IA!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação removida");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category_id }: { id: string; category_id: string | null }) =>
      transactionsApi.update(id, { category_id: category_id ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const transactions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  useEffect(() => {
  if (accounts?.length && !selectedAccountID) {
    setSelectedAccountID(accounts[0].id);
    console.log('effect')
  }
}, [accounts, selectedAccountID]);

  useEffect(() => {
    console.log(typeFilter);
  }, [typeFilter]);


  return (
    <div>
      <Header title="Transações" subtitle={`${total} transações encontradas`} />

      <div className="p-6 space-y-4 animate-fade-in">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar transação..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button variant="secondary" onClick={() => setShowRecurring(true)}>
            <Repeat2 className="h-4 w-4" />
            Recorrente
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        </div>

        {/* Type filters + Date range */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">

            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setTypeFilter(f.value); setPage(1); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  typeFilter === f.value
                    ? "bg-teal-400/10 text-teal-400 border border-teal-400/30"
                    : "bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700/50"
                }`}
              >
                {f.label}
              </button>
            ))}
            <select value={selectedAccountID} onChange={(e) => {setSelectedAccountID(e.target.value); console.log(e.target.value)}} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-navy-800 text-slate-400 border border-navy-700/50 hover:cursor-pointer `}>
              {(accounts != undefined) ? accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} - Saldo: R${acc.balance}</option>
              )) : <></>}
            </select>

          </div>
            
          {/* Date range picker */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-8 px-2 text-xs rounded-lg bg-navy-800 border border-navy-700/50 text-slate-300 focus:outline-none focus:border-teal-400/50 [color-scheme:dark]"
            />
            <span className="text-slate-600 text-xs">até</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-8 px-2 text-xs rounded-lg bg-navy-800 border border-navy-700/50 text-slate-300 focus:outline-none focus:border-teal-400/50 [color-scheme:dark]"
            />
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-navy-700 transition-colors"
                title="Limpar filtro de data"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 border-b border-navy-700/50">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Valor</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</span>
          </div>

          {isLoading ? (
            <div className="px-5 divide-y divide-navy-700/30">
              {[...Array(8)].map((_, i) => <TransactionSkeleton key={i} />)}
            </div>
          ) : !transactions.length ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-slate-400">Nenhuma transação encontrada</p>
              <p className="text-xs text-slate-600 mt-1">Tente ajustar os filtros ou adicionar uma transação manual</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-700/30">
              {[...transactions].reverse().map((tx) => (
                <TransactionTableRow
                  key={`${tx.id}-${selectedAccountID}`}
                  transaction={tx}
                  categories={categories ?? []}
                  onRecategorize={() => recategorizeMutation.mutate(tx.id)}
                  onDelete={() => deleteMutation.mutate(tx.id)}
                  onUpdateCategory={(category_id) =>
                    updateCategoryMutation.mutate({ id: tx.id, category_id })
                  }
                  typeFilter={typeFilter}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-slate-400">{page} de {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </div>

      {showAdd && (

        
        <AddTransactionModal
          categories={categories ?? []}
          accounts={accounts ?? []}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            qc.invalidateQueries({ queryKey: ["transactions"] });
            qc.invalidateQueries({ queryKey: ["budget"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
          }}
        />
      )}

      {showRecurring && (
        <AddRecurringModal
          categories={categories ?? []}
          onClose={() => setShowRecurring(false)}
          onSuccess={() => {
            setShowRecurring(false);
            qc.invalidateQueries({ queryKey: ["transactions"] });
            qc.invalidateQueries({ queryKey: ["budget"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
          }}
        />
      )}
    </div>
  );
}

function CategoryDropdown({
  current,
  categories,
  onSelect,
}: {
  current: Transaction["category"];
  categories: Category[];
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 group"
        title="Editar categoria"
      >
        {current ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: current.color }} />
            <span className="text-xs text-slate-500 group-hover:text-teal-400 transition-colors">
              {current.name}
            </span>
          </>
        ) : (
          <span className="text-xs text-slate-600 hover:text-teal-400 transition-colors">
            + categoria
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-5 z-20 w-44 rounded-xl border border-navy-700 bg-navy-900 shadow-xl shadow-black/40 overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-navy-800 hover:text-slate-200 transition-colors"
            >
              Sem categoria
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { onSelect(cat.id); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2 hover:bg-navy-800 ${
                  current?.id === cat.id ? "text-teal-400" : "text-slate-300"
                }`}
              >
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionTableRow({
  transaction: tx,
  categories,
  onRecategorize,
  onDelete,
  onUpdateCategory,
  typeFilter,
}: {
  transaction: Transaction;
  categories: Category[];
  onRecategorize: () => void;
  onDelete: () => void;
  onUpdateCategory: (category_id: string | null) => void;
  typeFilter: TransactionType | "all";
}) {

  if(typeFilter !== "all" && tx.type !== typeFilter) return null

  const isIncome = tx.type === "INCOME";
  const isTransfer = tx.type === "TRANSFER";

  // if(typeFilter !== "all" && tx.type !== typeFilter) return null

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-navy-900/40 transition-colors">
      {/* Type icon */}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
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

      {/* Description */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {tx.description_clean ?? tx.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{formatDate(tx.date)}</span>
          <CategoryDropdown
            current={tx.category}
            categories={categories}
            onSelect={onUpdateCategory}
          />
          {tx.is_recurring && (
            <Badge variant="info" className="text-[10px] px-1.5 py-0">
              <RefreshCw className="h-2.5 w-2.5" />
              Recorrente
            </Badge>
          )}
          {tx.source === "open_finance" && (
            <Badge variant="teal" className="text-[10px] px-1.5 py-0">Open Finance</Badge>
          )}
        </div>
      </div>

      {/* Amount */}
      <p className={`text-sm font-semibold whitespace-nowrap ${isIncome ? "text-success" : "text-slate-200"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onRecategorize}
          title="Recategorizar com IA"
          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-400 hover:bg-teal-400/10 transition-colors"
        >
          <Tag className="h-3.5 w-3.5" />
        </button>
        {tx.source === "manual" && (
          <button
            onClick={onDelete}
            title="Remover"
            className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
