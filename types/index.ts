// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  monthly_budget: number | null;
  budget_start_day: number;
  currency: string;
  timezone: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ─── Account ─────────────────────────────────────────────────────────────────
export type AccountType = "checking" | "savings" | "credit" | "investment";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  institution_name: string;
  institution_code: string;
  account_type: AccountType;
  balance: number;
  credit_limit: number | null;
  last_sync_at: string | null;
  consent_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  item_id: string | null;
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionSource = "open_finance" | "manual" | "import";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  description_clean: string | null;
  date: string;
  is_recurring: boolean;
  ai_confidence: number | null;
  source: TransactionSource;
  category?: Category;
  account?: Account;
  created_at: string;
}

export interface TransactionSummary {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  count: number;
  percentage: number;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_essential: boolean;
  parent_id: string | null;
  keywords: string[];
}

// ─── Budget ──────────────────────────────────────────────────────────────────
export type BudgetStatus = "on_track" | "warning" | "over_budget";

export interface DailyBudget {
  daily_limit: number;
  spent_today: number;
  remaining_today: number;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  remaining_days: number;
  period: { year: number; month: number };
  status: BudgetStatus;
}

export interface DailyBreakdownDay {
  date: string;
  spent: number;
  limit: number;
  remaining: number;
  status: "on_track" | "over_budget";
  transaction_count: number;
}

export interface DailyBreakdown {
  period: { year: number; month: number };
  total_budget: number;
  total_spent: number;
  daily_target: number;
  days: DailyBreakdownDay[];
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  totalLimit: number;
  spent: number;
  dailyLimit: number;
  fixedIncome: number;
  fixedExpenses: number;
  variableBudget: number;
  remainingAmount: number;
  usagePercent: number;
  isOverBudget: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Projection ───────────────────────────────────────────────────────────────
export interface ProjectionSummary {
  currentBalance: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  avgVariableFlow: number;
  fixedNetFlow: number;
  projectedNetFlow: number;
  lookbackMonths: number;
}

export interface Projection {
  id: string;
  date: string;
  projectedBalance: number;
  type: string;
  confidencePercent: number;
  isPositive: boolean;
  status: string;
  createdAt: string;
}

export interface ProjectionsResponse {
  summary: ProjectionSummary;
  projections: Projection[];
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  type?: TransactionType;
  category_id?: string;
  accountId?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}
