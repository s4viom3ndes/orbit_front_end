# orbit — Web App (Next.js)

Interface web do Orbit, app de controle financeiro inteligente.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — dark-mode first, paleta Orbit
- **TanStack Query** — cache e data fetching
- **Zustand** — estado global (auth, UI)
- **React Hook Form + Zod** — formulários com validação
- **Recharts** — gráficos de orçamento e projeções
- **Lucide React** — ícones
- **Sonner** — toasts

## Rodar localmente

```bash
cd orbit_web
npm install
npm run dev
# acessa: http://localhost:3001
```

## Variáveis de ambiente

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Estrutura de páginas
- `/login` — autenticação
- `/register` — cadastro
- `/` — dashboard (limite diário, resumo, transações recentes)
- `/transactions` — lista completa de transações
- `/budget` — orçamento mensal + histórico
- `/projections` — projeções dos próximos 6 meses
- `/accounts` — contas bancárias via Open Finance
- `/settings` — perfil e configurações

## Deploy AWS (Free Tier)
Em produção no EC2, servir com:
```bash
npm run build
npm start  # porta 3001
```
Configure NGINX para fazer proxy de `:80` → `:3001`.
