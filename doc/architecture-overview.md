# Visao Geral da Arquitetura

Este documento serve como briefing rapido para agentes automatos (Codex, Claude, etc.) antes de executar tarefas. Ele descreve os limites principais do sistema, contratos relevantes e pontos sensiveis.

## Componentes Principais
- **Backend**: `backend/src/Api` implementa Minimal APIs em .NET 8.
- **Frontend**: `frontend/` usa Next.js 14 (App Router) com Typescript e Tailwind.
- **Banco**: PostgreSQL 16, acessado via Entity Framework Core.
- **Storage**: uploads de anexos no backend em `storage/` (volume Docker).
- **Orquestracao**: Docker Compose para desenvolvimento; deploy em Render (API) e Vercel (frontend).

## Backend (.NET 8)
- **Entrada**: `Program.cs` compoe o pipeline usando Minimal APIs, Swagger, autenticao JWT e Middlewares customizados.
- **Domain**: `Domain/` contem agregados (Demand, DemandStatus, User, Profile) com regras de negocio.
- **Features**: `Features/` segue abordagem Feature Folder (cada subpasta expone endpoints, DTOs, mapeamentos).
- **Persistence**:
  - `Persistence/AppDbContext.cs` configura EF Core com schemas e conversores.
  - `Persistence/Migrations/` guarda migracoes geradas pelo `dotnet ef`.
  - `Persistence/Repositories` contem Repositories especificos (DemandRepository, UserRepository, etc.).
- **Services**:
  - `Services/Email` integra com SMTP configurado via appsettings.
  - `Services/Storage` gerencia upload/download de anexos em `storage/`.
  - `BackgroundServices/` inclui jobs como reconciliacao de status ou limpesa de arquivos.
- **Security**:
  - `Security/JwtTokenService.cs` emite tokens com claims de Role/Profile.
  - `Security/Policies` define autorizacao fina por rota (admin, gestor, etc.).
- **Health**: `Health/` expone `/health`, `/healthz` e `/health/db`.
- **Configuracao**:
  - `appsettings.json` com defaults; variaveis override via env (Docker/Render).
  - Secrets criticos: `Jwt__SigningKey`, `Init__Token`, strings SMTP.
- **Infra**:
  - `Dockerfile` (multi-stage build).
  - `render.yaml` descreve servico na Render.

### Fluxos de Negocio Relevantes
- **Auth**: `POST /auth/login` autentica e retorna JWT. Seed inicial (`Init__Token`) pode criar usuarios via `/init`.
- **Demandas**: CRUD principal em `Features/Demands`. Suporta anexos (`/attachments`), timeline, mudanca de status.
- **Backlog/Sprint**: endpoints em `Features/Backlogs` e `Features/Sprints` (WIP).
- **Usuarios/Perfis**: `Features/Users` e `Features/Profiles` gerenciam acessos e papeis.

## Frontend (Next.js 14)
- **Estrutura**:
  - `app/` App Router com rotas segmentadas (`dashboard`, `demandas`, `usuarios`, etc.).
  - `components/` possui UI compartilhada (tabelas, modais, cards).
  - `lib/` traz utilitarios: `lib/http.ts` (axios + interceptors + retry), `lib/api/*` (camada de servicos), `lib/env.ts`.
  - `hooks/` para React Query, formularios e auth context.
  - `theme/` e `styles/` centralizam Tailwind e tokens de design.
- **Estado e Data Fetching**:
  - React Query (QueryClient em `lib/queryClient.ts`).
  - Contexto de auth em `app/providers.tsx`.
- **Autenticacao**:
  - Mock de login redireciona para `dashboard`.
  - JWT guardado em cookie (via API / storage local; conferir `lib/http.ts`).
- **Build/Deploy**:
  - `Dockerfile` exporta build static + Node runtime.
  - Deploy na Vercel consumindo hook configurado via secret.

## Banco de Dados
- PostgreSQL 16.
- Tabelas criadas em camel case via EF Core; namespace `public`.
- Migrations localizadas em `backend/src/Api/Migrations`.
- Seeds:
  - Admin e Gestor com credenciais defaults (ver `backend/README.md`).
  - Perfis e permissoes iniciais configuradas no bootstrap.

## Automatizacoes
- **GitHub Actions**: `.github/workflows/deploy.yml`
  - Ao push na `main`: chama Render (`RENDER_SERVICE_ID`, `RENDER_API_KEY`) e Vercel (`VERCEL_DEPLOY_HOOK_URL`).
  - Job referencia environment `Prodcution` (com aprovacao manual se configurada).
- **Script de Backlog**: `scripts/migrate_next_tasks.py`
  - Lê `doc/backlog/NEXT_TASKS.md`, cria issues via API e adiciona ao Project "Controle de demandas".
  - Usa GraphQL Projects Next (`GraphQL-Features: projects_next_graphql`).

## Diretórios Importantes
- `doc/backlog/`: rascunhos (NEXT_TASKS.md, agente-email.md).
- `.github/projects/next_tasks_migration.json`: mapa de tarefas já convertidas.
- `docker-compose.yml`: orquestra backend, frontend, db, pgadmin.
- `docker-compose.prod.yml`/`docker-compose.prod.yml`: variacao para prod (quando aplicavel).

## Boas Practicas para Agentes
- Sempre validar se secrets estão definidos antes de modificar pipelines.
- Ao tocar migrations, alinhar com mantenedor (migracoes sao responsabilidade centralizada).
- Para novas APIs, seguir padrao Feature Folder e adicionar testes (xUnit/FluentAssertions).
- No frontend, usar componentes existentes em `components/` e hooks de React Query para consistencia.
- Antes de subir migrations ou seeds, rodar `docker compose up -d --build` e verificar `/health`.
- Documentar novas decisoes em `doc/` mantendo ASCII simples.

## Referencias Rapidas
- `backend/README.md`: setup, endpoints, fluxo `/init`.
- `DEPLOY.md`, `doc/DEPLOY_AZURE.md`, `doc/DEPLOY_IIS.md`: estrategias de deploy.
- `doc/passo-a-passo-config-smtp.md`: configuracao de email.
- `README.md`: overview geral, automacoes e requisitos.
