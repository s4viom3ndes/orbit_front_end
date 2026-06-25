import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined, currency = "BRL"): string {
  const num = Number(value ?? 0);
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const normalized = new Date(d.getTime() + d.getTimezoneOffset() * 60000);


  if (isToday(normalized)) return "Hoje";
  if (isYesterday(normalized)) return "Ontem";
  return format(normalized, "d 'de' MMMM", { locale: ptBR });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy");
}

export function formatMonth(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM yyyy", { locale: ptBR });
}

export function getMonthName(month: number): string {
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return names[month - 1] ?? "";
}

export function percentOf(value: number | string | null | undefined, total: number | string | null | undefined): number {
  const v = Number(value ?? 0);
  const t = Number(total ?? 0);
  if (t === 0 || isNaN(t) || isNaN(v)) return 0;
  return Math.min(100, Math.round((v / t) * 100));
}

export function classifyBudgetStatus(status: "on_track" | "warning" | "over_budget") {
  const map = {
    on_track: { label: "No trilho", color: "text-success", bg: "bg-success/10" },
    warning: { label: "Atenção", color: "text-warning", bg: "bg-warning/10" },
    over_budget: { label: "Acima do limite", color: "text-danger", bg: "bg-danger/10" },
  };
  return map[status];
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "Alta";
  if (confidence >= 0.6) return "Média";
  return "Baixa";
}

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#f59e0b",
  Transporte: "#3b82f6",
  Lazer: "#a855f7",
  Saúde: "#22c55e",
  Educação: "#06b6d4",
  Moradia: "#f97316",
  Vestuário: "#ec4899",
  Assinaturas: "#6366f1",
  Outros: "#6b7280",
};
