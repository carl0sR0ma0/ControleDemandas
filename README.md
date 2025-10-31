# Controle de Demandas

Aplicacao full stack para gestao de demandas internas, composta por backend .NET 8 (Minimal APIs), frontend Next.js 14 e PostgreSQL. O objetivo e oferecer um fluxo unico para cadastro, triagem e acompanhamento de demandas, com autenticacao e paines administrativos.

## Stack principal
- Backend: .NET 8, Entity Framework Core, FluentValidation, Docker
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind, componentes shadcn/ui
- Banco de dados: PostgreSQL 16
- Infra: Docker Compose para desenvolvimento, Render (API) e Vercel (frontend) para deploy

## Estrutura do repositorio
```
backend/   -> API .NET 8, migrations, scripts de inicializacao
frontend/  -> Aplicacao Next.js com layout, hooks e componentes compartilhados
doc/       -> Guias de deploy detalhados para Azure, IIS e referencias diversas
.github/   -> Workflows do GitHub Actions
```

## Preparando o ambiente local
1. **Clonar o repositorio**
   ```bash
   git clone <seu-fork-ou-repo>
   cd ControleDemandas
   ```
2. **Variaveis de ambiente**
   - Copie `.env.example` para `.env` e preencha chaves (JWT, SMTP, banco).
   - Opcional: use `.env.prod.example` como base para ambientes gerenciados.
3. **Subir tudo com Docker**
   ```bash
   docker compose up -d
   ```
   - Backend: http://localhost:8080 (Swagger em `/swagger`, health em `/health`)
   - Frontend: http://localhost:3000
   - PgAdmin: http://localhost:8081 (`admin@admin.com` / `admin`)
4. **Rodar migrations manualmente (se necessario)**
   ```bash
   docker compose exec backend dotnet ef database update
   ```
5. **Credenciais seeds**
   - Admin: `admin@empresa.com` / `Admin@123`
   - Gestor: `gestor@empresa.com` / `Gestor@123`

## Variaveis essenciais
- `ConnectionStrings__postgres`: string completa para o PostgreSQL
- `Jwt__SigningKey` / `JWT_SIGNING_KEY`: chave longa (>32 chars)
- `Init__Token`: token usado para bootstrap via `/init`
- `NEXT_PUBLIC_API_URL`: URL publica da API para o frontend
- `Smtp__Host`, `Smtp__Port`, `Smtp__User`, `Smtp__Password`

Consulte `DEPLOY.md` para um checklist completo de producao.

## Deploy e automacoes
- Workflow `deploy.yml` (GitHub Actions) executa em todo `push` ou `merge` para `main` e pode ser acionado manualmente via `workflow_dispatch`.
- Secrets obrigatorios no repositorio:
  - `RENDER_API_KEY`: token de API gerado no painel da Render.
  - `RENDER_SERVICE_ID`: ID do servico configurado na Render (ver `render.yaml`).
  - `VERCEL_DEPLOY_HOOK_URL`: URL de deploy hook gerada no projeto da Vercel.
- O job dispara:
  1. POST para `https://api.render.com/v1/services/<serviceId>/deploys`, iniciando o deploy da API.
  2. POST no hook da Vercel para publicar o frontend.
- Se algum secret faltar, o passo correspondente e ignorado e o job continua (logs indicam a configuracao ausente).

## Documentacao complementar
- `DEPLOY.md`: matriz de opcoes, checklist de producao e comandos Docker.
- `backend/README.md`: detalhes da API, endpoints, fluxo `/init` e dicas para Visual Studio.
- `doc/`: scripts e guias especificos (Azure, IIS, escalabilidade).

## Contribuindo
1. Abra uma issue descrevendo o problema ou melhoria.
2. Crie um branch a partir de `main`.
3. Implemente, adicione testes quando aplicavel e rode o `docker compose up -d --build` para validar.
4. Abra um pull request com o contexto, screenshots/logs relevantes.
