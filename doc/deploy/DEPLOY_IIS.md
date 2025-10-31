# 🪟 Deploy no IIS (Windows Server) - Controle de Demandas

Este guia mostra como fazer deploy da aplicação em um servidor Windows usando IIS (Internet Information Services).

---

## 📋 Pré-requisitos

- Windows Server 2019/2022 ou Windows 10/11 Pro
- IIS instalado e configurado
- .NET 8 Runtime instalado
- Node.js 20+ instalado
- PostgreSQL instalado (ou conexão com servidor remoto)
- Certificado SSL (opcional, mas recomendado)

---

## 🔧 Parte 1: Preparação do Servidor

### 📝 Passo 1: Instalar IIS

**Via PowerShell (Administrador):**
```powershell
# Windows Server
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Windows 10/11 Pro
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ApplicationDevelopment
Enable-WindowsOptionalFeature -Online -FeatureName IIS-NetFxExtensibility45
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HealthAndDiagnostics
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Performance
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerManagementTools
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ManagementConsole
```

### 📝 Passo 2: Instalar ASP.NET Core Hosting Bundle

```powershell
# Baixar e instalar o Hosting Bundle para .NET 8
# URL: https://dotnet.microsoft.com/download/dotnet/8.0

# Verificar instalação
dotnet --list-runtimes
# Deve mostrar: Microsoft.AspNetCore.App 8.0.x
```

**Link direto:** https://dotnet.microsoft.com/permalink/dotnetcore-current-windows-runtime-bundle-installer

**Após instalar, REINICIAR o IIS:**
```powershell
net stop was /y
net start w3svc
```

### 📝 Passo 3: Instalar Node.js (para Frontend)

```powershell
# Baixar Node.js 20 LTS
# URL: https://nodejs.org/

# Verificar instalação
node --version
npm --version
```

### 📝 Passo 4: Instalar e Configurar PostgreSQL

**Opção 1: PostgreSQL Local**
```powershell
# Baixar PostgreSQL 16
# URL: https://www.postgresql.org/download/windows/

# Após instalação, criar banco:
psql -U postgres
CREATE DATABASE controle_demandas;
\q
```

**Opção 2: Usar PostgreSQL Remoto (Azure, AWS, etc.)**
```
# Apenas configure a connection string corretamente
```

### 📝 Passo 5: Instalar URL Rewrite Module (para Frontend)

```powershell
# Baixar URL Rewrite Module 2.1
# URL: https://www.iis.net/downloads/microsoft/url-rewrite
```

---

## 🎯 Parte 2: Deploy do Backend (.NET API)

### 📝 Passo 1: Publicar a Aplicação

**No seu ambiente de desenvolvimento:**
```powershell
cd backend\src\Api

# Publicar para produção
dotnet publish -c Release -o C:\publish\api

# Resultado: Arquivos publicados em C:\publish\api
```

**Estrutura de pastas no servidor:**
```
C:\inetpub\controle-demandas\
├── api\              # Backend .NET
│   ├── Api.dll
│   ├── appsettings.json
│   ├── web.config
│   ├── storage\      # Arquivos uploadados
│   └── wwwroot\      # Arquivos estáticos
└── frontend\         # Frontend Next.js (veremos depois)
```

### 📝 Passo 2: Copiar Arquivos para o Servidor

```powershell
# Criar diretórios no servidor
New-Item -Path "C:\inetpub\controle-demandas\api" -ItemType Directory -Force
New-Item -Path "C:\inetpub\controle-demandas\api\storage" -ItemType Directory -Force
New-Item -Path "C:\inetpub\controle-demandas\api\wwwroot" -ItemType Directory -Force

# Copiar arquivos publicados
Copy-Item -Path "C:\publish\api\*" -Destination "C:\inetpub\controle-demandas\api\" -Recurse -Force
```

### 📝 Passo 3: Configurar appsettings.json

**Editar:** `C:\inetpub\controle-demandas\api\appsettings.json`

```json
{
  "ConnectionStrings": {
    "postgres": "Host=localhost;Port=5432;Database=controle_demandas;Username=postgres;Password=SuaSenhaSegura;Pooling=true;Minimum Pool Size=5;Maximum Pool Size=100;Connection Idle Lifetime=300;Connection Pruning Interval=10"
  },
  "Jwt": {
    "Issuer": "controle-demandas",
    "Audience": "controle-demandas",
    "SigningKey": "sua-chave-jwt-bem-longa-e-secreta-aqui",
    "ExpHours": 8
  },
  "Cors": {
    "Origins": [
      "http://localhost:3000",
      "http://seu-dominio.com",
      "https://seu-dominio.com"
    ]
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "EnableSsl": true,
    "User": "seu-email@gmail.com",
    "Password": "sua-senha-de-app",
    "From": "no-reply@empresa.com"
  },
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "C:\\inetpub\\controle-demandas\\api\\logs\\log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  },
  "Init": {
    "Token": "seu-token-de-inicializacao-seguro"
  }
}
```

### 📝 Passo 4: Criar Application Pool no IIS

```powershell
# Importar módulo IIS
Import-Module WebAdministration

# Criar Application Pool
New-WebAppPool -Name "ControleDemandasAPI" -Force

# Configurar Application Pool
Set-ItemProperty "IIS:\AppPools\ControleDemandasAPI" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty "IIS:\AppPools\ControleDemandasAPI" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty "IIS:\AppPools\ControleDemandasAPI" -Name "startMode" -Value "AlwaysRunning"
Set-ItemProperty "IIS:\AppPools\ControleDemandasAPI" -Name "processModel.idleTimeout" -Value ([TimeSpan]::FromMinutes(0))
Set-ItemProperty "IIS:\AppPools\ControleDemandasAPI" -Name "recycling.periodicRestart.time" -Value ([TimeSpan]::FromMinutes(0))
```

**Ou via IIS Manager (GUI):**
1. Abrir IIS Manager
2. Clicar com botão direito em "Application Pools" → "Add Application Pool"
3. Nome: `ControleDemandasAPI`
4. .NET CLR Version: `No Managed Code`
5. Managed pipeline mode: `Integrated`
6. Clicar em "Advanced Settings":
   - Start Mode: `AlwaysRunning`
   - Idle Time-out: `0`
   - Regular Time Interval: `0`

### 📝 Passo 5: Criar Site no IIS

```powershell
# Criar site
New-Website -Name "ControleDemandasAPI" `
  -Port 8080 `
  -PhysicalPath "C:\inetpub\controle-demandas\api" `
  -ApplicationPool "ControleDemandasAPI" `
  -Force

# Configurar bindings (se quiser HTTPS)
New-WebBinding -Name "ControleDemandasAPI" -Protocol https -Port 8443 -SslFlags 0

# Configurar permissões de pasta
$acl = Get-Acl "C:\inetpub\controle-demandas\api"
$identity = "IIS AppPool\ControleDemandasAPI"
$fileSystemRights = "FullControl"
$type = "Allow"
$fileSystemAccessRuleArgumentList = $identity, $fileSystemRights, $type
$fileSystemAccessRule = New-Object -TypeName System.Security.AccessControl.FileSystemAccessRule -ArgumentList $fileSystemAccessRuleArgumentList
$acl.SetAccessRule($fileSystemAccessRule)
Set-Acl -Path "C:\inetpub\controle-demandas\api" -AclObject $acl

# Permissões para storage e wwwroot
icacls "C:\inetpub\controle-demandas\api\storage" /grant "IIS AppPool\ControleDemandasAPI:(OI)(CI)F" /T
icacls "C:\inetpub\controle-demandas\api\wwwroot" /grant "IIS AppPool\ControleDemandasAPI:(OI)(CI)F" /T
```

### 📝 Passo 6: Verificar web.config

**Arquivo:** `C:\inetpub\controle-demandas\api\web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\Api.dll"
                  stdoutLogEnabled="true"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
      <security>
        <requestFiltering>
          <requestLimits maxAllowedContentLength="104857600" /> <!-- 100 MB -->
        </requestFilimits>
      </security>
    </system.webServer>
  </location>
</configuration>
```

### 📝 Passo 7: Rodar Migrations

```powershell
cd C:\inetpub\controle-demandas\api

# Rodar migrations
dotnet Api.dll -- migrate
# OU
dotnet ef database update --project "C:\caminho\para\Api.csproj"
```

### 📝 Passo 8: Testar API

```powershell
# Testar health endpoint
curl http://localhost:8080/health

# Deve retornar: {"status":"ok"}
```

---

## 🎨 Parte 3: Deploy do Frontend (Next.js)

### 📝 Passo 1: Build da Aplicação Next.js

**No seu ambiente de desenvolvimento:**
```powershell
cd frontend

# Configurar variável de ambiente
$env:NEXT_PUBLIC_API_URL="http://localhost:8080"
# OU editar .env.production:
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Build para produção
npm install
npm run build

# Resultado: pasta .next/standalone gerada
```

### 📝 Passo 2: Copiar Arquivos para o Servidor

```powershell
# Criar diretório
New-Item -Path "C:\inetpub\controle-demandas\frontend" -ItemType Directory -Force

# Copiar arquivos standalone
Copy-Item -Path "frontend\.next\standalone\*" -Destination "C:\inetpub\controle-demandas\frontend\" -Recurse -Force

# Copiar arquivos estáticos
Copy-Item -Path "frontend\.next\static" -Destination "C:\inetpub\controle-demandas\frontend\.next\static" -Recurse -Force
Copy-Item -Path "frontend\public" -Destination "C:\inetpub\controle-demandas\frontend\public" -Recurse -Force
```

### 📝 Passo 3: Instalar PM2 (Process Manager)

```powershell
# Instalar PM2 globalmente
npm install -g pm2
npm install -g pm2-windows-service

# Configurar PM2 como serviço Windows
pm2-service-install -n PM2
```

### 📝 Passo 4: Configurar PM2 para Next.js

**Criar arquivo:** `C:\inetpub\controle-demandas\frontend\ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'controle-demandas-frontend',
    script: 'server.js',
    cwd: 'C:\\inetpub\\controle-demandas\\frontend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://localhost:8080'
    },
    error_file: 'C:\\inetpub\\controle-demandas\\frontend\\logs\\error.log',
    out_file: 'C:\\inetpub\\controle-demandas\\frontend\\logs\\out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

```powershell
# Criar pasta de logs
New-Item -Path "C:\inetpub\controle-demandas\frontend\logs" -ItemType Directory -Force

# Iniciar aplicação
cd C:\inetpub\controle-demandas\frontend
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 list
pm2 logs
```

### 📝 Passo 5: Criar Reverse Proxy no IIS (Frontend)

**Opção A: Usar IIS como Reverse Proxy**

1. Instalar ARR (Application Request Routing):
   - https://www.iis.net/downloads/microsoft/application-request-routing

2. Criar site no IIS:
```powershell
# Criar Application Pool para frontend
New-WebAppPool -Name "ControleDemandasFrontend" -Force

# Criar site
New-Website -Name "ControleDemandasFrontend" `
  -Port 80 `
  -PhysicalPath "C:\inetpub\controle-demandas\frontend-proxy" `
  -ApplicationPool "ControleDemandasFrontend" `
  -Force

# Criar diretório vazio para proxy
New-Item -Path "C:\inetpub\controle-demandas\frontend-proxy" -ItemType Directory -Force
```

3. Criar `web.config` para reverse proxy:

**Arquivo:** `C:\inetpub\controle-demandas\frontend-proxy\web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

**Opção B: Acessar diretamente via porta 3000**
```
http://seu-servidor:3000
```

### 📝 Passo 6: Testar Frontend

```powershell
# Abrir navegador
Start-Process "http://localhost:80"  # Se usando reverse proxy
# OU
Start-Process "http://localhost:3000"  # Acesso direto
```

---

## 🔒 Parte 4: Configurar SSL/HTTPS

### 📝 Opção 1: Certificado Self-Signed (Desenvolvimento)

```powershell
# Criar certificado self-signed
$cert = New-SelfSignedCertificate `
  -DnsName "localhost", "seu-dominio.local" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(5)

# Obter thumbprint
$thumbprint = $cert.Thumbprint

# Adicionar binding HTTPS no IIS
New-WebBinding -Name "ControleDemandasAPI" `
  -Protocol https `
  -Port 8443 `
  -SslFlags 0

# Associar certificado
$binding = Get-WebBinding -Name "ControleDemandasAPI" -Protocol https
$binding.AddSslCertificate($thumbprint, "my")
```

### 📝 Opção 2: Certificado Let's Encrypt (Produção)

1. Instalar Win-ACME:
   - https://www.win-acme.com/

2. Configurar certificado:
```powershell
# Baixar Win-ACME
Invoke-WebRequest -Uri "https://github.com/win-acme/win-acme/releases/download/v2.2.7/win-acme.v2.2.7.1612.x64.pluggable.zip" -OutFile "win-acme.zip"
Expand-Archive -Path "win-acme.zip" -DestinationPath "C:\win-acme"

# Executar
cd C:\win-acme
.\wacs.exe

# Seguir wizard para criar certificado para seu domínio
```

### 📝 Opção 3: Certificado Comercial

1. Comprar certificado SSL (Comodo, DigiCert, etc.)
2. Importar para Certificate Store
3. Associar ao binding do IIS

---

## 📊 Parte 5: Monitoramento e Logs

### 📝 Logs da API

**Localização:** `C:\inetpub\controle-demandas\api\logs\`

```powershell
# Ver logs em tempo real
Get-Content "C:\inetpub\controle-demandas\api\logs\log-$(Get-Date -Format 'yyyyMMdd').txt" -Wait
```

### 📝 Logs do IIS

```powershell
# Habilitar logging detalhado
Set-WebConfigurationProperty -Filter "/system.webServer/httpLogging" `
  -Name "dontLog" -Value $false -PSPath "IIS:\Sites\ControleDemandasAPI"

# Ver logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC*\*.log" -Tail 50
```

### 📝 Logs do Frontend (PM2)

```powershell
# Ver logs
pm2 logs controle-demandas-frontend

# Ver logs de erro
Get-Content "C:\inetpub\controle-demandas\frontend\logs\error.log" -Wait
```

---

## 🔧 Parte 6: Troubleshooting

### ❌ Problema: "HTTP Error 500.31 - Failed to load ASP.NET Core runtime"

**Solução:**
```powershell
# Reinstalar Hosting Bundle
# Download: https://dotnet.microsoft.com/download/dotnet/8.0

# Reiniciar IIS
net stop was /y
net start w3svc
```

### ❌ Problema: "Connection to database failed"

**Solução:**
```powershell
# Verificar se PostgreSQL está rodando
Get-Service -Name "postgresql*"

# Testar conexão
Test-NetConnection -ComputerName localhost -Port 5432

# Verificar firewall
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

### ❌ Problema: "Access Denied" ao salvar arquivos

**Solução:**
```powershell
# Dar permissões corretas
icacls "C:\inetpub\controle-demandas\api\storage" /grant "IIS AppPool\ControleDemandasAPI:(OI)(CI)F" /T
icacls "C:\inetpub\controle-demandas\api\wwwroot" /grant "IIS AppPool\ControleDemandasAPI:(OI)(CI)F" /T
```

### ❌ Problema: Frontend não conecta na API (CORS)

**Solução:**
```json
// appsettings.json
{
  "Cors": {
    "Origins": [
      "http://localhost:3000",
      "http://seu-ip:80",
      "http://seu-dominio.com",
      "https://seu-dominio.com"
    ]
  }
}
```

---

## 🚀 Parte 7: Automação de Deploy

### 📝 Script PowerShell de Deploy Automatizado

**Criar arquivo:** `deploy-iis.ps1`

```powershell
# Configurações
$API_PATH = "C:\inetpub\controle-demandas\api"
$FRONTEND_PATH = "C:\inetpub\controle-demandas\frontend"
$BACKUP_PATH = "C:\backups\controle-demandas"

# Criar backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -Path "$BACKUP_PATH\$timestamp" -ItemType Directory -Force
Copy-Item -Path $API_PATH -Destination "$BACKUP_PATH\$timestamp\api" -Recurse -Force

# Parar aplicações
Stop-WebSite -Name "ControleDemandasAPI"
pm2 stop controle-demandas-frontend

# Build Backend
cd backend\src\Api
dotnet publish -c Release -o $API_PATH

# Build Frontend
cd ..\..\..\frontend
npm run build
Copy-Item -Path ".next\standalone\*" -Destination $FRONTEND_PATH -Recurse -Force
Copy-Item -Path ".next\static" -Destination "$FRONTEND_PATH\.next\static" -Recurse -Force

# Rodar migrations
cd $API_PATH
dotnet Api.dll -- migrate

# Iniciar aplicações
Start-WebSite -Name "ControleDemandasAPI"
pm2 restart controle-demandas-frontend

Write-Host "Deploy concluído com sucesso!" -ForegroundColor Green
```

**Executar:**
```powershell
.\deploy-iis.ps1
```

---

## 📚 Checklist Final

- [ ] IIS instalado e configurado
- [ ] .NET 8 Hosting Bundle instalado
- [ ] PostgreSQL rodando
- [ ] Backend publicado e testado (http://localhost:8080/health)
- [ ] Frontend buildado e rodando via PM2
- [ ] CORS configurado corretamente
- [ ] SMTP configurado
- [ ] Logs funcionando
- [ ] Backups automatizados
- [ ] SSL/HTTPS configurado (produção)
- [ ] Firewall configurado
- [ ] Monitoramento ativo

---

## 🎯 Resumo de URLs

- **Backend API**: http://seu-servidor:8080
- **Frontend**: http://seu-servidor:80 (ou :3000)
- **Health Check**: http://seu-servidor:8080/health
- **Swagger**: http://seu-servidor:8080/swagger
- **Logs**: `C:\inetpub\controle-demandas\api\logs\`

---

**Documentação IIS:** https://learn.microsoft.com/iis/
**Documentação ASP.NET Core no IIS:** https://learn.microsoft.com/aspnet/core/host-and-deploy/iis/
