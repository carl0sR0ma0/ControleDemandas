# 🚀 Deploy no Azure - Controle de Demandas

Este guia mostra como fazer deploy da aplicação no Azure, começando com recursos gratuitos e depois migrando para recursos pagos conforme necessário.

---

## 📋 Índice

1. [Opção 1: Azure Free Tier (Gratuito por 12 meses)](#opção-1-azure-free-tier-gratuito)
2. [Opção 2: Azure Container Apps (Pago - Recomendado)](#opção-2-azure-container-apps-pago)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Configuração de SMTP](#configuração-de-smtp)
5. [Monitoramento e Logs](#monitoramento-e-logs)

---

## Opção 1: Azure Free Tier (Gratuito)

### ✅ O que está incluído GRÁTIS por 12 meses:

- **Azure App Service**: 10 Web Apps (F1 tier)
- **Azure Database for PostgreSQL**: 750 horas/mês (B1ms)
- **Azure Container Registry**: Básico (até 10 GB)
- **Banda de saída**: 100 GB/mês
- **Azure Monitor**: 5 GB logs/mês

### 📝 Passo 1: Criar Conta Azure

```bash
# Acesse: https://azure.microsoft.com/free/
# Cadastre-se com cartão de crédito (não será cobrado durante o período gratuito)
# Receba $200 em créditos por 30 dias + serviços gratuitos por 12 meses
```

### 📝 Passo 2: Instalar Azure CLI

**Windows:**
```powershell
# Baixe e instale: https://aka.ms/installazurecliwindows
# Ou via Winget:
winget install -e --id Microsoft.AzureCLI
```

**Linux/Mac:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Login:**
```bash
az login
# Selecione sua assinatura
az account set --subscription "Nome-da-Sua-Assinatura"
```

### 📝 Passo 3: Criar Resource Group

```bash
# Variáveis
RESOURCE_GROUP="rg-controle-demandas"
LOCATION="brazilsouth"  # Datacenter no Brasil

# Criar grupo de recursos
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### 📝 Passo 4: Criar Azure Database for PostgreSQL (Free Tier)

```bash
# Variáveis
DB_SERVER="controle-demandas-db"
DB_NAME="controle_demandas"
DB_USER="adminuser"
DB_PASSWORD="SuaSenhaSegura@2024"  # TROQUE!

# Criar servidor PostgreSQL (B1ms - Free Tier)
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user $DB_USER \
  --admin-password $DB_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --yes

# Criar banco de dados
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER \
  --database-name $DB_NAME

# Configurar firewall (permitir Azure Services)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Connection String:**
```
Host=controle-demandas-db.postgres.database.azure.com;Port=5432;Database=controle_demandas;Username=adminuser;Password=SuaSenhaSegura@2024;SslMode=Require
```

### 📝 Passo 5: Deploy Backend (App Service - Free Tier)

```bash
# Variáveis
APP_SERVICE_PLAN="plan-controle-demandas"
BACKEND_APP="api-controle-demandas"

# Criar App Service Plan (F1 - FREE)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku F1 \
  --is-linux

# Criar Web App para Backend
az webapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "DOTNETCORE:8.0"

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    ConnectionStrings__postgres="Host=$DB_SERVER.postgres.database.azure.com;Port=5432;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD;SslMode=Require;Pooling=true;Maximum Pool Size=100" \
    Jwt__SigningKey="sua-chave-jwt-super-secreta-aqui" \
    Jwt__Issuer="controle-demandas" \
    Jwt__Audience="controle-demandas" \
    Jwt__ExpHours="8" \
    Cors__Origins__0="https://frontend-controle-demandas.azurewebsites.net" \
    Smtp__Host="smtp.sendgrid.net" \
    Smtp__Port="587" \
    Smtp__EnableSsl="true" \
    Smtp__User="apikey" \
    Smtp__Password="SUA_SENDGRID_API_KEY" \
    Smtp__From="no-reply@seudominio.com"

# Deploy do código (via ZIP)
cd backend/src/Api
dotnet publish -c Release -o ./publish
cd publish
zip -r ../deploy.zip .
cd ..

az webapp deployment source config-zip \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --src deploy.zip
```

**URL da API:** `https://api-controle-demandas.azurewebsites.net`

### 📝 Passo 6: Deploy Frontend (App Service - Free Tier)

```bash
# Variáveis
FRONTEND_APP="frontend-controle-demandas"

# Criar Web App para Frontend
az webapp create \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "NODE:20-lts"

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NEXT_PUBLIC_API_URL="https://api-controle-demandas.azurewebsites.net" \
    NODE_ENV="production"

# Deploy do código (via GitHub Actions ou ZIP)
cd frontend
npm install
npm run build

# Criar pacote standalone
cd .next/standalone
zip -r ../../deploy.zip .
cd ../..

az webapp deployment source config-zip \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --src deploy.zip
```

**URL do Frontend:** `https://frontend-controle-demandas.azurewebsites.net`

### 📝 Passo 7: Rodar Migrations do Banco

```bash
# Conectar no banco e rodar migrations
cd backend/src/Api

# Atualizar connection string no appsettings.json temporariamente
# Ou usar variável de ambiente:
export ConnectionStrings__postgres="Host=$DB_SERVER.postgres.database.azure.com;Port=5432;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD;SslMode=Require"

# Rodar migrations
dotnet ef database update
```

---

## Opção 2: Azure Container Apps (Pago - Recomendado)

### 🎯 Por que Container Apps?

- ✅ **Melhor custo-benefício** para containers
- ✅ **Auto-scaling** automático (0 a N instâncias)
- ✅ **Mais controle** sobre recursos
- ✅ **Suporta Docker Compose**
- ✅ **Pagamento por uso** (sem instâncias idle)

### 💰 Custo Estimado:

- **Container Apps**: ~$20-50/mês (com auto-scale)
- **PostgreSQL Flexible**: ~$25/mês (B2s)
- **Container Registry**: ~$5/mês
- **Total**: ~$50-80/mês

### 📝 Passo 1: Criar Azure Container Registry

```bash
# Variáveis
ACR_NAME="controledemandasacr"  # Apenas alfanumérico

# Criar registry
az acr create \
  --name $ACR_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Basic \
  --admin-enabled true

# Fazer login
az acr login --name $ACR_NAME
```

### 📝 Passo 2: Build e Push das Imagens Docker

```bash
# Obter login server
ACR_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# Build e push backend
cd backend
docker build -t $ACR_SERVER/controle-demandas-api:latest .
docker push $ACR_SERVER/controle-demandas-api:latest

# Build e push frontend
cd ../frontend
docker build -t $ACR_SERVER/controle-demandas-frontend:latest .
docker push $ACR_SERVER/controle-demandas-frontend:latest
```

### 📝 Passo 3: Criar Container Apps Environment

```bash
# Variáveis
ENVIRONMENT="env-controle-demandas"

# Criar environment
az containerapp env create \
  --name $ENVIRONMENT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 📝 Passo 4: Deploy Backend Container App

```bash
# Obter credenciais do ACR
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Deploy backend
az containerapp create \
  --name api-controle-demandas \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $ACR_SERVER/controle-demandas-api:latest \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --env-vars \
    "ConnectionStrings__postgres=Host=$DB_SERVER.postgres.database.azure.com;Port=5432;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD;SslMode=Require" \
    "Jwt__SigningKey=sua-chave-jwt-super-secreta" \
    "ASPNETCORE_ENVIRONMENT=Production"

# Obter URL da API
BACKEND_URL=$(az containerapp show --name api-controle-demandas --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "Backend URL: https://$BACKEND_URL"
```

### 📝 Passo 5: Deploy Frontend Container App

```bash
# Deploy frontend
az containerapp create \
  --name frontend-controle-demandas \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $ACR_SERVER/controle-demandas-frontend:latest \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --env-vars \
    "NEXT_PUBLIC_API_URL=https://$BACKEND_URL" \
    "NODE_ENV=production"

# Obter URL do Frontend
FRONTEND_URL=$(az containerapp show --name frontend-controle-demandas --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "Frontend URL: https://$FRONTEND_URL"
```

### 📝 Passo 6: Atualizar CORS no Backend

```bash
# Atualizar variável de ambiente CORS
az containerapp update \
  --name api-controle-demandas \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    "Cors__Origins__0=https://$FRONTEND_URL"
```

---

## Configuração do Banco de Dados

### 🔐 Segurança Recomendada:

```bash
# Desabilitar acesso público (apenas via VNet)
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --public-access Disabled

# Habilitar SSL obrigatório
az postgres flexible-server parameter set \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER \
  --name require_secure_transport \
  --value ON
```

### 📊 Backup Automático:

```bash
# Configurar backup (7 dias de retenção)
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --backup-retention 7 \
  --geo-redundant-backup Enabled
```

---

## Configuração de SMTP

### 📧 Opção 1: SendGrid (Recomendado - 100 emails/dia grátis)

1. Criar conta: https://signup.sendgrid.com/
2. Criar API Key
3. Configurar no backend:

```bash
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    Smtp__Host="smtp.sendgrid.net" \
    Smtp__Port="587" \
    Smtp__EnableSsl="true" \
    Smtp__User="apikey" \
    Smtp__Password="SUA_API_KEY_AQUI" \
    Smtp__From="no-reply@seudominio.com"
```

### 📧 Opção 2: Gmail SMTP

```bash
# 1. Criar senha de app: https://myaccount.google.com/apppasswords
# 2. Configurar:
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    Smtp__Host="smtp.gmail.com" \
    Smtp__Port="587" \
    Smtp__EnableSsl="true" \
    Smtp__User="seu-email@gmail.com" \
    Smtp__Password="sua-senha-de-app" \
    Smtp__From="seu-email@gmail.com"
```

---

## Monitoramento e Logs

### 📊 Habilitar Application Insights

```bash
# Criar Application Insights
az monitor app-insights component create \
  --app controle-demandas-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Obter Instrumentation Key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app controle-demandas-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Configurar no backend
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$INSTRUMENTATION_KEY"
```

### 📝 Ver Logs em Tempo Real

```bash
# Logs do backend
az webapp log tail \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP

# Logs do Container App
az containerapp logs show \
  --name api-controle-demandas \
  --resource-group $RESOURCE_GROUP \
  --follow
```

---

## 🎯 Resumo de Custos

### Free Tier (12 meses):
- **Custo mensal**: $0
- **Limitações**: Tier F1 (compartilhado), sem auto-scaling
- **Ideal para**: Testes, desenvolvimento, POC

### Container Apps (Produção):
- **Custo mensal**: ~$50-80
- **Vantagens**: Auto-scaling, melhor performance, produção
- **Ideal para**: Produção com múltiplos usuários

---

## 🔧 Troubleshooting

### Problema: "Cannot connect to database"
```bash
# Verificar firewall
az postgres flexible-server firewall-rule list \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER

# Adicionar seu IP
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --rule-name AllowMyIP \
  --start-ip-address SEU_IP \
  --end-ip-address SEU_IP
```

### Problema: "App não inicia"
```bash
# Ver logs detalhados
az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

---

## 📚 Próximos Passos

1. ✅ Configurar domínio customizado
2. ✅ Habilitar SSL/TLS (Let's Encrypt)
3. ✅ Configurar CI/CD com GitHub Actions
4. ✅ Configurar alertas de monitoramento
5. ✅ Implementar WAF (Web Application Firewall)

---

**Documentação completa Azure:** https://learn.microsoft.com/azure/
**Suporte:** https://azure.microsoft.com/support/
