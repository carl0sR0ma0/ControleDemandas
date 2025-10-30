# 🚀 Guia de Deploy - Controle de Demandas

Sistema completo de controle de demandas com backend .NET 8, frontend Next.js e PostgreSQL.

---

## 📋 Opções de Deploy

| Opção | Complexidade | Custo | Recomendado para |
|-------|--------------|-------|------------------|
| [Docker Local](#-deploy-com-docker-local) | ⭐ Fácil | Gratuito | Desenvolvimento, Testes |
| [Azure Free Tier](#-deploy-no-azure-gratuito) | ⭐⭐ Médio | Gratuito (12 meses) | POC, Pequenos projetos |
| [Azure Container Apps](#-deploy-no-azure-pago) | ⭐⭐⭐ Médio | ~$50-80/mês | Produção, Médio/Grande porte |
| [IIS Windows Server](#-deploy-no-iis-windows) | ⭐⭐⭐⭐ Difícil | Variável | Infraestrutura Windows existente |

---

## 🐳 Deploy com Docker (Local)

### Pré-requisitos

- Docker Desktop instalado ([Windows](https://docs.docker.com/desktop/install/windows-install/) | [Mac](https://docs.docker.com/desktop/install/mac-install/) | [Linux](https://docs.docker.com/desktop/install/linux-install/))
- Git instalado

### 🚀 Quick Start (3 minutos)

```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd ControleDemandas

# 2. Copiar arquivo de ambiente
cp .env.example .env

# 3. Editar .env (opcional)
# Configure SMTP, senhas, etc.

# 4. Subir todos os serviços
docker-compose up -d

# 5. Aguardar inicialização (~2 minutos)
docker-compose logs -f backend

# 6. Acessar aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# PgAdmin: http://localhost:8081
```

### 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Rebuildar imagens (após alterações no código)
docker-compose up -d --build

# Verificar status dos containers
docker-compose ps

# Acessar terminal do backend
docker-compose exec backend sh

# Acessar terminal do banco
docker-compose exec db psql -U postgres -d controle_demandas
```

### 🗄️ Rodar Migrations

```bash
# Executar migrations no banco
docker-compose exec backend dotnet ef database update

# OU criar migration (após alteração no modelo)
docker-compose exec backend dotnet ef migrations add NomeDaMigration
```

### 📊 Acessar Serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080 | - |
| Swagger | http://localhost:8080/swagger | - |
| Health Check | http://localhost:8080/health | - |
| PgAdmin | http://localhost:8081 | admin@admin.com / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |

### 🔐 Primeiro Acesso

```bash
# Usuários padrão criados automaticamente:
# Admin: admin@empresa.com / Admin@123
# Gestor: gestor@empresa.com / Gestor@123
```

---

## ☁️ Deploy no Azure (Gratuito)

### Free Tier - 12 meses gratuitos

**Incluído:**
- ✅ Azure App Service (10 web apps)
- ✅ PostgreSQL Database (750h/mês)
- ✅ 100GB banda de saída
- ✅ $200 créditos (30 dias)

**Guia completo:** [doc/DEPLOY_AZURE.md](doc/DEPLOY_AZURE.md)

**Quick Start:**
```bash
# 1. Instalar Azure CLI
winget install -e --id Microsoft.AzureCLI

# 2. Login
az login

# 3. Executar script de deploy
# Ver doc/DEPLOY_AZURE.md para detalhes
```

**Custo estimado:** $0/mês (12 meses), depois ~$30/mês

---

## ☁️ Deploy no Azure (Pago)

### Container Apps - Produção Recomendada

**Vantagens:**
- ✅ Auto-scaling (0 a N instâncias)
- ✅ Pagamento por uso
- ✅ Deploy com Docker
- ✅ Alta disponibilidade
- ✅ Monitoramento integrado

**Guia completo:** [doc/DEPLOY_AZURE.md](doc/DEPLOY_AZURE.md#opção-2-azure-container-apps-pago)

**Quick Start:**
```bash
# 1. Build e push das imagens
docker-compose build
docker tag controle-demandas-backend seu-registry.azurecr.io/api:latest
docker tag controle-demandas-frontend seu-registry.azurecr.io/frontend:latest
docker push seu-registry.azurecr.io/api:latest
docker push seu-registry.azurecr.io/frontend:latest

# 2. Deploy via Azure CLI
# Ver doc/DEPLOY_AZURE.md para comandos completos
```

**Custo estimado:** ~$50-80/mês

---

## 🪟 Deploy no IIS (Windows)

### Requisitos

- Windows Server 2019/2022
- IIS 10+
- .NET 8 Runtime
- PostgreSQL 16
- Node.js 20+

**Guia completo:** [doc/DEPLOY_IIS.md](doc/DEPLOY_IIS.md)

**Quick Start:**
```powershell
# 1. Instalar pré-requisitos
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# 2. Publicar backend
dotnet publish backend/src/Api -c Release -o C:\publish\api

# 3. Build frontend
cd frontend
npm run build

# 4. Configurar IIS
# Ver doc/DEPLOY_IIS.md para passos detalhados
```

**Custo estimado:** Licença Windows Server + Hardware

---

## 🔧 Configurações Importantes

### 🔐 Segurança

**⚠️ ANTES DE IR PARA PRODUÇÃO:**

1. **Trocar senhas padrão:**
```bash
# .env ou appsettings.json
DB_PASSWORD=SenhaSuperSegura@2024
JWT_SIGNING_KEY=chave-jwt-bem-longa-e-aleatoria-min-32-caracteres
INIT_TOKEN=token-de-inicializacao-seguro-aleatorio
```

2. **Configurar CORS corretamente:**
```json
{
  "Cors": {
    "Origins": [
      "https://seu-dominio.com",
      "https://www.seu-dominio.com"
    ]
  }
}
```

3. **Habilitar HTTPS:**
- Azure: Automático
- IIS: Configurar certificado SSL
- Docker: Usar nginx/traefik como reverse proxy

### 📧 Configurar SMTP

**Opção 1: Gmail (Desenvolvimento)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SSL=true
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha-de-app-gerada
SMTP_FROM=seu-email@gmail.com
```

**Criar senha de app:** https://myaccount.google.com/apppasswords

**Opção 2: SendGrid (Produção - 100 emails/dia grátis)**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SSL=true
SMTP_USER=apikey
SMTP_PASSWORD=SUA_API_KEY_SENDGRID
SMTP_FROM=no-reply@seudominio.com
```

**Cadastro:** https://signup.sendgrid.com/

**Opção 3: AWS SES, Mailgun, etc.**

### 🗄️ Backup do Banco

**Docker:**
```bash
# Backup
docker-compose exec db pg_dump -U postgres controle_demandas > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U postgres controle_demandas < backup_20240130.sql
```

**Azure PostgreSQL:**
```bash
az postgres flexible-server backup create \
  --resource-group rg-controle-demandas \
  --name controle-demandas-db \
  --backup-name backup-manual
```

**IIS/Local:**
```powershell
# Backup
pg_dump -U postgres -d controle_demandas -f backup_$(Get-Date -Format 'yyyyMMdd').sql

# Restore
psql -U postgres -d controle_demandas -f backup_20240130.sql
```

---

## 📊 Monitoramento

### Verificar Health

```bash
# API Health
curl http://localhost:8080/health
# Resposta esperada: {"status":"ok"}

# Database Health
curl http://localhost:8080/health/db
```

### Logs

**Docker:**
```bash
# Todos os logs
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

**Azure:**
```bash
# Container Apps
az containerapp logs show \
  --name api-controle-demandas \
  --resource-group rg-controle-demandas \
  --follow

# App Service
az webapp log tail \
  --name api-controle-demandas \
  --resource-group rg-controle-demandas
```

**IIS:**
```powershell
# Logs da aplicação
Get-Content "C:\inetpub\controle-demandas\api\logs\log-*.txt" -Wait

# Logs do IIS
Get-Content "C:\inetpub\logs\LogFiles\W3SVC*\*.log" -Tail 50
```

---

## 🚨 Troubleshooting

### ❌ Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se portas estão em uso
netstat -ano | findstr "8080"

# Recriar containers
docker-compose down
docker-compose up -d --force-recreate
```

### ❌ Erro de conexão com banco

```bash
# Verificar se banco está rodando
docker-compose ps db

# Testar conexão
docker-compose exec db psql -U postgres -d controle_demandas

# Ver logs do banco
docker-compose logs db
```

### ❌ CORS Error no frontend

```javascript
// Verificar NEXT_PUBLIC_API_URL no frontend
console.log(process.env.NEXT_PUBLIC_API_URL)

// Deve apontar para a URL correta da API
// Exemplo: http://localhost:8080 (dev) ou https://api.seudominio.com (prod)
```

```json
// Verificar Cors__Origins no backend (appsettings.json)
{
  "Cors": {
    "Origins": ["http://localhost:3000", "https://seudominio.com"]
  }
}
```

### ❌ E-mails não são enviados

```bash
# Verificar logs do EmailBackgroundService
docker-compose logs backend | grep -i email

# Verificar configuração SMTP
docker-compose exec backend cat appsettings.json | grep -A 5 Smtp

# Testar envio manual via endpoint
curl -X POST http://localhost:8080/demands/{id}/notify \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "includeRequester": true,
    "message": "Teste de envio"
  }'
```

---

## 📚 Documentação Adicional

- [Melhorias de Escalabilidade](backend/MELHORIAS_ESCALABILIDADE.md)
- [Deploy Azure Detalhado](doc/DEPLOY_AZURE.md)
- [Deploy IIS Detalhado](doc/DEPLOY_IIS.md)
- [Documentação da API](http://localhost:8080/swagger) (após subir)

---

## 🎯 Comparação de Opções

| Critério | Docker Local | Azure Free | Azure Pago | IIS |
|----------|--------------|------------|------------|-----|
| **Custo** | Gratuito | Gratuito (12m) | ~$50-80/mês | Licenças Windows |
| **Setup** | 5 minutos | 30 minutos | 1 hora | 2-3 horas |
| **Escalabilidade** | ❌ Limitado | ⚠️ Básico | ✅ Excelente | ⚠️ Manual |
| **Manutenção** | ⚠️ Manual | ✅ Gerenciado | ✅ Gerenciado | ❌ Manual |
| **Performance** | ⚠️ Hardware local | ⚠️ F1 Tier | ✅ Alta | ⚠️ Variável |
| **SSL/HTTPS** | ❌ Não incluso | ✅ Automático | ✅ Automático | ⚠️ Manual |
| **Backup** | ❌ Manual | ✅ Automático | ✅ Automático | ❌ Manual |
| **Monitoramento** | ❌ Básico | ✅ App Insights | ✅ App Insights | ❌ Manual |

### 🎯 Recomendação por Caso de Uso

- **Desenvolvimento/Testes**: Docker Local
- **POC/Demonstração**: Azure Free Tier
- **Produção (< 100 usuários)**: Azure Free → Pago
- **Produção (> 100 usuários)**: Azure Container Apps
- **Infraestrutura Windows existente**: IIS

---

## 🆘 Suporte

- **Issues**: [GitHub Issues](seu-repositorio/issues)
- **Documentação**: [Wiki](seu-repositorio/wiki)
- **Email**: suporte@empresa.com

---

**Última atualização**: 2025-10-30
**Versão**: 1.0.0
