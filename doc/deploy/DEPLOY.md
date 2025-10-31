# Guia de Deploy - Controle de Demandas

Aplicacao completa para controle de demandas com backend .NET 8, frontend Next.js e banco PostgreSQL. Este guia apresenta as opcoes de deploy, requisitos e procedimentos de configuracao.

---

## Opcoes de Deploy

| Opcao                 | Complexidade | Custo estimado | Indicado para                    |
|-----------------------|--------------|----------------|----------------------------------|
| Docker Local          | Baixa        | Gratuito       | Desenvolvimento e testes         |
| Azure Free Tier       | Media        | Gratuito 12 m  | Provas de conceito e pilotos     |
| Azure Container Apps  | Media        | USD 50-80/m    | Producao com autoscale           |
| IIS Windows Server    | Alta         | Variavel       | Ambientes Windows legados        |

---

## Checklist de Producao

- Copie `.env.example` para `.env` e preencha senhas, tokens e chaves fortes.
- Garanta que `JWT_SIGNING_KEY`, `INIT_TOKEN` e dados SMTP estejam definidos antes do deploy.
- Execute `dotnet ef database update` para aplicar migracoes pendentes no banco.
- Configure backups automatizados para o PostgreSQL e revise credenciais de acesso.
- Habilite monitoramento (Azure Monitor, App Insights ou ferramenta equivalente) antes de liberar para usuarios finais.

---

## Deploy com Docker (Local)

### Pre-requisitos
- Docker Desktop instalado.
- Git instalado.
- Opcional: editor de texto para ajustar variaveis no `.env`.

### Passo a passo rapido

```bash
# 1. Clonar o repositorio
git clone <seu-repositorio>
cd ControleDemandas

# 2. Copiar o arquivo de ambiente
cp .env.example .env

# 3. Ajustar variaveis conforme necessario

# 4. Subir os servicos
docker-compose up -d

# 5. Acompanhar logs do backend ate finalizar a migracao inicial (~2 minutos)
docker-compose logs -f backend
```

### Comandos uteis

```bash
# Logs combinados
docker-compose logs -f

# Logs apenas do backend
docker-compose logs -f backend

# Parar servicos
docker-compose down

# Parar e remover volumes (apaga dados!)
docker-compose down -v

# Reconstruir imagens apos alteracoes
docker-compose up -d --build

# Status dos containers
docker-compose ps

# Terminal dentro do backend
docker-compose exec backend sh

# Terminal dentro do banco
docker-compose exec db psql -U postgres -d controle_demandas
```

### Executar migrations

```bash
docker-compose exec backend dotnet ef database update
```

### Servicos disponiveis

| Servico          | URL                       | Credenciais padrao                       |
|------------------|---------------------------|------------------------------------------|
| Frontend         | http://localhost:3000     | -                                        |
| Backend API      | http://localhost:8080     | -                                        |
| Swagger          | http://localhost:8080/swagger | -                                    |
| Health check API | http://localhost:8080/health | -                                      |
| PgAdmin          | http://localhost:8081     | admin@admin.com / admin                  |
| PostgreSQL       | localhost:5432            | postgres / postgres                      |

### Usuarios iniciais

```text
Admin:   admin@empresa.com / Admin@123
Gestor:  gestor@empresa.com / Gestor@123
```

---

## Deploy no Azure (camada gratuita)

### Recursos incluidos no free tier
- App Service (ate 10 web apps F1).
- Flexible Server PostgreSQL 750h/m.
- 100 GB de banda de saida.
- USD 200 em creditos no primeiro mes.

### Requisitos
- Conta Azure com creditos ativos.
- Azure CLI instalada (`winget install -e --id Microsoft.AzureCLI`).
- Docker Desktop (para publicar imagens locais).

### Passo a passo resumido

```bash
# Login
az login

# Selecionar subscription correta
az account set --subscription "<ID ou nome>"

# Criar resource group
az group create \
  --name rg-controle-demandas \
  --location brazilsouth

# Criar banco PostgreSQL flexivel
az postgres flexible-server create \
  --resource-group rg-controle-demandas \
  --name pg-controle-demandas \
  --location brazilsouth \
  --admin-user postgres \
  --admin-password <sua-senha> \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --version 16

# Publicar backend via Azure Container Registry + App Service
az acr create \
  --resource-group rg-controle-demandas \
  --name acrcontroleDemandas \
  --sku Basic

az acr login --name acrcontroleDemandas
docker build -t acrcontroledemandas.azurecr.io/backend:latest ./backend
docker push acrcontroledemandas.azurecr.io/backend:latest

az webapp create \
  --resource-group rg-controle-demandas \
  --plan plano-backend \
  --name api-controle-demandas \
  --deployment-container-image-name acrcontroledemandas.azurecr.io/backend:latest
```

### Ajustes adicionais
- Configurar connection string nos Application Settings do App Service.
- Configurar variaveis `Jwt__SigningKey`, `Init__Token`, `Smtp__*`.
- Habilitar logging e health check no App Service.
- Criar Web App separado ou Static Web App para o frontend.

---

## Deploy no Azure Container Apps (producao)

### Vantagens
- Escala automatica baseada em CPU/RPS.
- Gasto controlado por replicas.
- Integra com Azure Database for PostgreSQL e Azure Monitor.

### Fluxo principal
1. Criar Azure Container Registry (ou reutilizar existente).
2. Build e push das imagens `backend` e `frontend`.
3. Criar ambiente Container Apps.
4. Criar container app para o backend apontando para a imagem do ACR e informando as variaveis de ambiente.
5. Criar container app ou Static Web App para o frontend.
6. Configurar TLS/Custom Domain e observabilidade (Log Analytics + Application Insights).

Documentacao recomendada: consulte `doc/DEPLOY_AZURE.md` para scripts completos.

---

## Deploy em IIS (Windows Server)

### Pre-requisitos
- Windows Server 2019 ou superior com IIS habilitado.
- .NET Hosting Bundle instalado.
- PostgreSQL acessivel na mesma rede ou como servico gerenciado.

### Procedimento resumido
1. Publicar o backend com `dotnet publish -c Release -o ./publish`.
2. Copiar os artefatos para `C:\inetpub\controle-demandas\api`.
3. Criar App Pool dedicado em modo `No Managed Code`.
4. Criar site apontando para a pasta publicada e configurar binding HTTPS.
5. Configurar variaveis sensiveis no `appsettings.Production.json` ou via environment variables do sistema.
6. Publicar o frontend (Next.js) com `npm run build && npm run export` ou servir via Node de maneira auto hospedada.

Logs uteis:

```powershell
Get-Content "C:\inetpub\controle-demandas\api\logs\log-*.txt" -Wait
Get-Content "C:\inetpub\logs\LogFiles\W3SVC*\*.log" -Tail 50
```

---

## Variaveis de ambiente essenciais

- `ConnectionStrings__postgres`: string de conexao completa para o PostgreSQL.
- `Jwt__SigningKey`: chave longa e secreta (32+ caracteres).
- `Init__Token`: usado para bootstrap de usuarios; trocar antes de produzir.
- `Smtp__Host`, `Smtp__Port`, `Smtp__User`, `Smtp__Password`: configuracao de e-mail.
- `NEXT_PUBLIC_API_URL`: URL publica da API para o frontend.
- `DB_PASSWORD`, `JWT_SIGNING_KEY`, `SMTP_*`, `INIT_TOKEN`: preencher no `docker-compose.yml` ou no provider.

---

## Problemas comuns

- **Container backend unhealthy**  
  Confirme se `curl` esta instalado (Dockerfile atualizado) e se a rota `/health` responde 200.

- **Erro de conexao com banco**  
  Verifique firewall, porta 5432 e dados em `ConnectionStrings__postgres`. Use `docker-compose exec db psql ...` para testar.

- **CORS**  
  Ajuste `Cors__Origins__*` no backend e `NEXT_PUBLIC_API_URL` no frontend.

- **SMTP**  
  Teste com `docker-compose exec backend dotnet user-secrets set` ou configuracoes de producao. Use servicos como Mailtrap em ambientes de teste.

- **Arquivos estaticos**  
  Volume `backend_wwwroot` precisa de permissao de escrita se montar em producao.

---

## Documentacao adicional
- `backend/MELHORIAS_ESCALABILIDADE.md`
- `doc/DEPLOY_AZURE.md`
- `doc/DEPLOY_IIS.md`
- `/swagger` depois que a API estiver em execucao.

---

Ultima atualizacao: 2025-10-30  
Versao: 1.0.1
