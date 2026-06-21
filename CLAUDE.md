# Orbit — Frontend Web · Contexto para Claude Code

> Documento de contexto do projeto. Leia isso antes de qualquer tarefa no orbit_web.

---

## O que é o Orbit

App de controle financeiro pessoal brasileiro. O diferencial é o **limite diário adaptativo** — toda manhã o sistema recalcula quanto o usuário pode gastar naquele dia com base no orçamento restante e dias até o fim do mês. As transações chegam automaticamente via Open Finance Brasil (integração Pluggy), sem entrada manual.

**Persona principal:** Lucas, 28 anos, dev de software, São Paulo. Sabe otimizar query SQL mas não sabe para onde vai o dinheiro. Quer controle sem fricção.

---

## Stack do frontend web

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript strict |
| Estilo | Tailwind CSS |
| Data fetching | TanStack Query v5 |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Toasts | Sonner |
| Auth | JWT via cookie httpOnly |
| HTTP | Axios com interceptors de refresh automático |

---

## Estrutura de arquivos

```
orbit_web/
├── app/
│   ├── layout.tsx                    # Root layout: Providers + Toaster
│   ├── globals.css                   # CSS global + variáveis da marca
│   ├── (auth)/
│   │   ├── login/page.tsx            # Tela de login
│   │   └── register/page.tsx         # Tela de cadastro
│   └── (dashboard)/
│       ├── layout.tsx                # Layout com Sidebar
│       ├── page.tsx                  # Dashboard principal
│       ├── transactions/page.tsx     # Lista de transações
│       ├── budget/page.tsx           # Orçamento mensal
│       ├── projections/page.tsx      # Projeções 6 meses
│       ├── accounts/page.tsx         # Contas Open Finance
│       └── settings/page.tsx         # Perfil e configurações
│
├── components/
│   ├── providers.tsx                 # QueryClient + hidratação do user
│   ├── layout/
│   │   ├── sidebar.tsx               # Nav lateral colapsável
│   │   └── header.tsx                # Header com título + avatar
│   ├── ui/                           # Componentes base do design system
│   │   ├── button.tsx                # Button: primary|secondary|ghost|danger|outline
│   │   ├── card.tsx                  # Card + CardHeader + CardTitle + CardValue
│   │   ├── input.tsx                 # Input com label, error, hint, icons
│   │   ├── badge.tsx                 # Badge: default|success|warning|danger|info|teal
│   │   ├── progress.tsx              # Barra de progresso com cor automática por %
│   │   └── skeleton.tsx              # Skeletons de loading
│   └── features/
│       ├── dashboard/
│       │   ├── daily-limit-card.tsx  # Card hero: limite diário + voz do Orbit
│       │   ├── budget-overview-card.tsx  # Resumo do orçamento mensal
│       │   ├── accounts-card.tsx     # Lista de contas + saldo total
│       │   ├── spending-chart.tsx    # PieChart de gastos por categoria
│       │   └── recent-transactions.tsx  # Últimas 8 transações
│       └── transactions/
│           └── add-transaction-modal.tsx  # Modal de transação manual
│
├── lib/
│   ├── api.ts      # Todos os chamadas de API organizadas por módulo
│   ├── auth.ts     # Helpers de cookie/token + formatCurrency
│   ├── store.ts    # Zustand: useAuthStore + useUIStore
│   └── utils.ts    # cn(), formatCurrency(), formatDate(), formatMonth()...
│
├── types/
│   └── index.ts    # Todos os tipos TypeScript (User, Transaction, Budget, etc.)
│
├── middleware.ts    # Proteção de rotas: redireciona /login se não autenticado
├── .env.local       # NEXT_PUBLIC_API_URL=http://localhost:3000
└── tailwind.config.ts  # Paleta de cores completa da marca Orbit
```

---

## Design System — Cores e tokens

**Nunca usar cores hardcoded. Sempre usar as classes Tailwind abaixo.**

```
Fundos:
  navy-950  →  #070d1a   (fundo da página)
  navy-900  →  #0f1729   (sidebar, inputs, cards secundários)
  navy-800  →  #162036   (cards principais)
  navy-700  →  #1e2d48   (bordas, progress bg, hover)

Marca:
  teal-400  →  #2ECFE4   (cor primária, botões, destaques, links)
  teal-300  →  #5DDAEC   (hover do teal)
  indigo-500 → #6366f1   (cor secundária, badges info)

Status:
  success   →  #22c55e   (receitas, saldo positivo, on_track)
  danger    →  #ef4444   (despesas, alertas, over_budget)
  warning   →  #f59e0b   (atenção, confiança média, warning)

Texto:
  slate-100 →  texto principal
  slate-400 →  texto secundário / labels
  slate-500 →  texto muted / hints
  slate-600 →  texto muito apagado / meta
```

**Gradiente da marca:** `linear-gradient(135deg, #2ECFE4, #6366f1)` — usado no logo e avatares.

**Estilo geral:** Dark mode obrigatório. Bordas sutis (`border-navy-700/50`). Cantos arredondados `rounded-2xl` nos cards. Sem sombras pesadas — quando usar, sempre com opacidade da cor de destaque (ex: `shadow-teal-400/20`).

---

## Identidade de voz (Orbit fala assim)

O Orbit não culpa o usuário e não usa jargão financeiro. Contextualize os dados.

```
✅ "Seu limite hoje é R$ 87. Ainda dá para o almoço."
✅ "Você passou R$ 23 do limite de hoje. Segura o próximo café."
✅ "Se cortar Netflix e Spotify, economiza R$ 56/mês."

❌ "Atenção! Você ultrapassou seu orçamento!"
❌ "Suas despesas extrapolaram o threshold configurado."
❌ "Risco de inadimplência detectado."
```

**Onde aplicar:** mensagens de estado nos cards, empty states, toasts, textos de apoio em formulários.

---

## Camada de API (`lib/api.ts`)

O backend roda em `http://localhost:3000` (dev) e `https://api.fintrack.app/v1` (prod, pausado).

Todos os endpoints estão encapsulados em objetos por módulo:

```typescript
authApi.login(payload)          // POST /auth/login
authApi.register(payload)       // POST /auth/register
authApi.logout()                // POST /auth/logout

usersApi.me()                   // GET /users/me
usersApi.update(data)           // PATCH /users/me
usersApi.updateBudget(data)     // PATCH /users/me/budget

accountsApi.list()              // GET /accounts
accountsApi.sync(id)            // POST /accounts/:id/sync
accountsApi.delete(id)          // DELETE /accounts/:id
accountsApi.connect(institution_id)  // POST /accounts/connect

transactionsApi.list(filters)   // GET /transactions
transactionsApi.create(data)    // POST /transactions
transactionsApi.update(id, data) // PATCH /transactions/:id
transactionsApi.delete(id)      // DELETE /transactions/:id
transactionsApi.recategorize(id) // POST /transactions/:id/recategorize
transactionsApi.summary(params)  // GET /transactions/summary

budgetApi.current()             // GET /budget/current
budgetApi.daily()               // GET /budget/daily — resposta principal do app
budgetApi.history()             // GET /budget/history

projectionsApi.list()           // GET /projections
projectionsApi.recalculate()    // POST /projections/recalculate

categoriesApi.list()            // GET /categories
```

**Interceptors importantes em `api.ts`:**
- Request: injeta `Bearer <token>` do cookie `orbit_access_token`
- Response 401: tenta refresh automático via `orbit_refresh_token`. Se falhar, limpa cookies e redireciona para `/login`.

---

## Auth flow

1. Login → `authApi.login()` → salva tokens em cookie (`js-cookie`) + user em `localStorage`
2. Zustand `useAuthStore` mantém `{ user, isAuthenticated }` em memória
3. `components/providers.tsx` reidrata o store do `localStorage` no boot do app
4. `middleware.ts` (Next.js) protege as rotas: sem cookie → redireciona para `/login`
5. Logout → `authApi.logout()` + `clearTokens()` + `useAuthStore.logout()`

**Cookies:**
- `orbit_access_token` — expira em 15min
- `orbit_refresh_token` — expira em 7 dias

---

## Padrões de código

### Componentes de página
```typescript
"use client";  // sempre em páginas interativas

// Busca de dados: sempre com TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["budget", "daily"],
  queryFn: () => budgetApi.daily().then(r => r.data),
});

// Mutations: sempre com useMutation + toast de feedback
const mutation = useMutation({
  mutationFn: (id: string) => transactionsApi.delete(id),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["transactions"] });
    toast.success("Transação removida");
  },
  onError: () => toast.error("Erro ao remover transação"),
});
```

### Query keys (convenção)
```
["budget", "daily"]
["budget", "history"]
["transactions", { page, type, search }]
["transactions", "summary"]
["accounts"]
["projections"]
["categories"]
["users", "me"]
```

### Formatação de valores
```typescript
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

formatCurrency(1500)        // "R$ 1.500,00"
formatDate("2026-05-17")    // "Hoje" / "Ontem" / "17 de maio"
formatMonth(2026, 5)        // "maio 2026"
```

### cn() para classes condicionais
```typescript
import { cn } from "@/lib/utils";

className={cn(
  "base-class",
  condition && "conditional-class",
  variant === "primary" && "primary-class"
)}
```

---

## Estado atual — O que está implementado

### ✅ Completo
- Projeto Next.js 14 configurado (Tailwind, TypeScript, path aliases)
- Design system: Button, Card, Input, Badge, Progress, Skeleton
- Layout: Sidebar colapsável, Header com avatar
- Auth: Login, Register, middleware de proteção de rotas
- Dashboard: DailyLimitCard, BudgetOverviewCard, AccountsCard, SpendingChart, RecentTransactions
- Transações: listagem com filtros, paginação, recategorização por IA, modal de criação manual
- Orçamento: limite diário, gráfico de histórico, edição do orçamento mensal
- Projeções: gráfico de área, cards por mês com confiança
- Contas: lista Open Finance, sync manual, desvincular
- Configurações: editar perfil, timezone, notificações (placeholder), exclusão de conta

### ⚠️ Implementado com placeholder / sem integração real
- **Conectar banco (Open Finance):** botão existe, mas o widget Pluggy não está integrado. Precisa implementar o fluxo: `POST /accounts/connect` → recebe `connect_token` → abre Pluggy Widget (script externo) → callback `POST /accounts/connect/callback`.
- **Notificações:** toggles existem mas não persistem no backend (endpoint não está na spec MVP).
- **Alterar senha:** botão existe, falta a tela/modal + endpoint `POST /auth/reset-password`.
- **Busca de transações:** o campo existe e passa `search` como query param, mas depende do backend suportar esse filtro.
- **Filtro por data em transações:** não implementado na UI ainda.

### ❌ Não implementado
- **Filtro de data** nas transações (date range picker)
- **Edição inline de categoria** em cada transação (dropdown diretamente na linha)
- **Tela de detalhe de transação** (modal ou página separada)
- **Onboarding** para usuário novo sem orçamento configurado (redirecionar para configurar orçamento)
- **WebSocket / polling** para atualização em tempo real quando chega webhook do banco
- **PWA** (manifest, service worker) para instalar no celular como app
- **Testes** (não há nenhum arquivo de teste ainda)

---

## Como rodar

```bash
# Na pasta orbit_web
npm install
npm run dev       # http://localhost:3001 (porta padrão do Next)
```

O backend precisa estar rodando em `localhost:3000`:
```bash
# Na pasta orbit_api
npm run dev
```

---

## Próximas tarefas prioritárias (ordem sugerida)

1. **Integrar Pluggy Widget** no fluxo de conectar banco (`/accounts`) — isso desbloqueia o valor principal do produto
2. **Date range picker** na tela de transações — filtrar por período
3. **Onboarding flow** — detectar usuário sem `monthly_budget` e redirecionar para configurar
4. **Edição de categoria inline** na lista de transações
5. **PWA** — `manifest.json` + ícones para permitir "Adicionar à tela inicial"
6. **Testes** — começar pelos hooks customizados e pela lógica de `utils.ts`

---

## Migração para repositório separado (EXECUTAR UMA VEZ)

O projeto atualmente está em `C:\projects\orbit\orbit_web` junto com o backend e o mobile. **Execute os passos abaixo para mover para um repo Git próprio.**

### Pré-requisito
Crie o repositório `orbit-web` no GitHub (ou GitLab) — vazio, sem README.

### Passos (rodar no terminal, dentro de `orbit_web\`)

```bash
# 1. Inicializar git no projeto web
git init

# 2. Criar .gitignore antes de adicionar arquivos
cat > .gitignore << 'EOF'
node_modules/
.next/
.env.local
.env.production
*.log
.DS_Store
EOF

# 3. Primeiro commit com todo o código
git add .
git commit -m "feat: initial orbit web frontend (Next.js 14)"

# 4. Conectar ao repo remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU_USER/orbit-web.git

# 5. Subir
git push -u origin main
```

### Depois da migração
Você pode abrir a pasta `orbit_web` diretamente no VS Code ou rodar `claude` dentro dela que o Claude Code vai ler este `CLAUDE.md` automaticamente como contexto.

---

## Deploy (futuro — AWS Free Tier)

```
frontend web  →  EC2 t3.micro  (Next.js em produção na porta 3001)
                 ou S3 + CloudFront (se mudar para export estático)
backend       →  EC2 t3.micro  (Fastify na porta 3000, pausado)
banco         →  RDS PostgreSQL t3.micro (pausado)
```

Nginx no EC2 fará proxy:
- `/:80` → `Next.js :3001`
- `/api/:80` → `Fastify :3000`

---

## Variáveis de ambiente necessárias

```bash
# .env.local (desenvolvimento)
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production (quando for para AWS)
NEXT_PUBLIC_API_URL=https://api.fintrack.app
```

---

*Última atualização: maio 2026 · MVP v0.1*
