import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
  Account,
  Transaction,
  TransactionFilters,
  TransactionSummary,
  DailyBudget,
  DailyBreakdown,
  Budget,
  ProjectionsResponse,
  Category,
  PaginatedResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Axios instance ────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptor: injetar access_token em cada request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("orbit_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: refresh automático quando 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = Cookies.get("orbit_refresh_token");
        const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        Cookies.set("orbit_access_token", data.access_token, { expires: 1 / 96 }); // 15min
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        Cookies.remove("orbit_access_token");
        Cookies.remove("orbit_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<{ user: User } & AuthTokens>("/auth/register", payload),

  login: (payload: LoginPayload) =>
    api.post<{ user: User } & AuthTokens>("/auth/login", payload),

  refresh: (refresh_token: string) =>
    api.post<AuthTokens>("/auth/refresh", { refresh_token }),

  logout: () => api.post("/auth/logout", { refresh_token: Cookies.get("orbit_refresh_token") }),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get<User>("/users/me"),
  update: (data: Partial<Pick<User, "name" | "timezone">>) => api.patch<User>("/users/me", data),
  updateBudget: (data: { monthly_budget: number; budget_start_day?: number }) =>
    api.patch<User>("/users/me/budget", data),
};

// ─── Accounts ──────────────────────────────────────────────────────────────
export const accountsApi = {
  list: () => api.get<Account[]>("/accounts"),
  get: (id: string) => api.get<Account>(`/accounts/${id}`),
  sync: (id: string) => api.post(`/accounts/${id}/sync`),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

// ─── Open Finance ──────────────────────────────────────────────────────────
export const openFinanceApi = {
  connectToken: (itemId?: string) =>
    api.post<{ connectToken: string }>("/open-finance/connect-token", itemId ? { itemId } : {}),
  syncItem: (itemId: string) => api.post(`/open-finance/items/${itemId}/sync`),
  deleteItem: (itemId: string) => api.delete(`/open-finance/items/${itemId}`),
};

// ─── Transactions ──────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (filters?: TransactionFilters) =>
    api.get<PaginatedResponse<Transaction>>(`accounts/${filters?.accountId}/transactions`),

  get: (id: string) => api.get<Transaction>(`/transactions/${id}`),

  create: (data: {
    type: Transaction["type"];
    amount: number;
    description: string;
    date: string;
    categoryId?: string;
    accountId?: string;
  // }) => console.log(data),
  }) => api.post<Transaction>(`/accounts/${data.accountId}/transactions`, data),


  createRecurring: (data: {
    type: "INCOME" | "EXPENSE";
    description: string;
    amount: number;
    recurringDay: number;
    occurrences: number;
    categoryId?: string;
    accountId?: string;
  }) => api.post<{ created: number; transactions: Pick<Transaction, "id" | "date" | "amount" | "description" | "type">[] }>("/transactions/recurring", data),

  update: (
    id: string,
    data: Partial<Pick<Transaction, "description" | "category_id" | "date">>
  ) => api.patch<Transaction>(`/transactions/${id}`, data),

  // delete: (id: string) => api.delete(`/transactions/${id}`),
  delete: (id: string, accountid: string) => {
    return api.delete(`/accounts/${accountid}/transactions/${id}`);
  },

  recategorize: (id: string) => api.post<Transaction>(`/transactions/${id}/recategorize`),

  summary: (params?: { start_date?: string; end_date?: string }) =>
    api.get<TransactionSummary[]>("/transactions/summary", { params }),
};

// ─── Budget ────────────────────────────────────────────────────────────────
export const budgetApi = {
  current: () => api.get<Budget>("/budget/current"),
  daily: () => api.get<DailyBudget>("/budget/daily"),
  dailyBreakdown: (params?: { year?: number; month?: number }) =>
    api.get<DailyBreakdown>("/budget/daily-breakdown", { params }),
  history: () => api.get<Budget[]>("/budget/history"),
  create: (data: { month: number; year: number; totalLimit: number }) =>
    api.post<Budget>("/budgets", data),
  update: (id: string, data: { totalLimit: number }) =>
    api.patch<Budget>(`/budgets/${id}`, data),
};

// ─── Projections ───────────────────────────────────────────────────────────
export const projectionsApi = {
  list: () => api.get<ProjectionsResponse>("/projections"),
  generate: (months = 6) => api.post<ProjectionsResponse>("/projections/generate", { months }),
};

// ─── Categories ────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: Partial<Category>) => api.post<Category>("/categories", data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export default api;
